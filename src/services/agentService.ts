import mongoose from 'mongoose';
import { OTPModel } from '../models/otpModel';
import AgentModel, { AgentLevel, IAgent } from '../models/agentModel';
import UserModel from '../models/userModel';
import { NotFoundError, BadRequestError } from '../utils/appError';
import { generateOTP } from '../utils/otpHelper';
import { sendOTPEmail } from './mailService';
import companyModel from '../models/companyModel';
import { VerificationTokenModel, generateVerificationToken } from '../models/verificationTokenModel';
import { sendSubagentVerificationEmail } from './mailService';

/**
 * Register a Owner Agent & Send OTP
 */
export const sendOTPAndRegisterAgent = async (data: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      companyName,
      phone,
      country,
    } = data;

    if (!email) throw new BadRequestError('Email is required');

    const existingUser = await UserModel.findOne({ email }).session(session);
    if (existingUser)
      throw new BadRequestError('User with this email already exists');

    const existingCompany = await companyModel
      .findOne({
        name: companyName,
      })
      .session(session);

    if (existingCompany)
      throw new BadRequestError(`Company ${companyName} already exists`);

    const newCompany = await companyModel.create(
      [
        {
          name: companyName,
        },
      ],
      { session },
    );

    const user = await UserModel.create(
      [{ email, password, role: 'agent', address: { country } }],
      { session },
    );

    const agent = await AgentModel.create(
      [
        {
          user: user[0]._id,
          firstName,
          lastName,
          companyId: newCompany[0]._id,
          phone,
          level: 'owner',
        },
      ],
      { session },
    );

    const otp = generateOTP(5);

    await OTPModel.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true },
    );

    await sendOTPEmail(`${firstName} ${lastName}`, email, otp);

    await session.commitTransaction();
    session.endSession();

    return agent[0]._id.toString();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Verify OTP & Activate Agent
 */
export const verifyAgentOTP = async (email: string, otp: string) => {
  const validOTP = await OTPModel.findOne({ email, otp });

  if (!validOTP) throw new BadRequestError('Invalid or expired OTP');

  const user = await UserModel.findOneAndUpdate(
    { email },
    { isEmailVerified: true },
    { new: true },
  );
  if (!user) throw new NotFoundError('User not found');

  await OTPModel.deleteOne({ email });

  return true;
};

/**
 * Create a Sub-Agent or Agent
 */
export const createSubAgent = async (parentAgentId: string, data: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const parentAgent =
      await AgentModel.findById(parentAgentId).session(session);
    if (!parentAgent) throw new NotFoundError('Parent agent not found');

    const { email, firstName, lastName, level } = data;

    const existingUser = await UserModel.findOne({ email }).session(session);
    if (existingUser)
      throw new BadRequestError('User with this email already exists');

    // Create user with temporary password
    const user = await UserModel.create(
      [
        {
          email,
          password: 'TempPassword@123',
          role: 'agent',
          isEmailVerified: false,
        },
      ],
      {
        session,
      },
    );

    const agent = await AgentModel.create(
      [
        {
          user: user[0]._id,
          firstName,
          lastName,
          companyId: parentAgent.companyId,
          level,
          ...(level !== 'owner' && { parentId: parentAgentId }),
        },
      ],
      { session },
    );

    // Generate verification token
    const token = generateVerificationToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    await VerificationTokenModel.create(
      [
        {
          token,
          email,
          type: 'subagent',
          expiresAt,
        },
      ],
      { session },
    );

    // Generate verification link
    const verificationLink = `${process.env.FRONTEND_URL}/sign-up-team/${token}`;

    // Send verification email
    await sendSubagentVerificationEmail(
      `${firstName} ${lastName}`,
      email,
      level,
      verificationLink,
    );

    await session.commitTransaction();
    session.endSession();

    return agent[0].toJSON();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Verify Subagent Token and Set Password
 */
export const verifySubagentToken = async (token: string, password: string) => {
  const verificationToken = await VerificationTokenModel.findOne({
    token,
    type: 'subagent',
    expiresAt: { $gt: new Date() },
  });

  if (!verificationToken) {
    throw new BadRequestError('Invalid or expired verification token');
  }

  const user = await UserModel.findOne({ email: verificationToken.email });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Update user with new password and mark as verified
  user.password = password;
  user.isEmailVerified = true;
  await user.save();

  // Delete the used token
  await VerificationTokenModel.deleteOne({ token });

  return true;
};

/**
 * Validate Subagent Token and Get User Details
 */
export const validateSubagentToken = async (token: string) => {
  const verificationToken = await VerificationTokenModel.findOne({
    token,
    type: 'subagent',
    expiresAt: { $gt: new Date() },
  });

  if (!verificationToken) {
    throw new BadRequestError('Invalid or expired verification token');
  }

  const user = await UserModel.findOne({ email: verificationToken.email });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const agent = await AgentModel.findOne({ user: user._id });
  if (!agent) {
    throw new NotFoundError('Agent not found');
  }

  return {
    email: user.email,
    firstName: agent.firstName,
    lastName: agent.lastName,
    level: agent.level,
  };
};

/**
 * Get All Agents
 */
export const getAllAgents = async (
  level: string,
  parentId: string,
  companyId: string,
  page: number,
  limit: number,
) => {
  let query: any = {};

  if (level === 'owner') {
    query = { companyId, _id: { $ne: parentId } }; // Fetch all in company except self
  } else if (level === 'manager') {
    query = {
      companyId,
      parentId,
      level: { $in: ['admission', 'counsellor'] },
      _id: { $ne: parentId },
    };
  } else {
    return { agents: [], totalPages: 0 };
  }

  const agents = await AgentModel.find(query)
    .lean()
    .skip((page - 1) * limit)
    .limit(limit);

  const totalAgents = await AgentModel.countDocuments(query);

  return { agents, totalPages: Math.ceil(totalAgents / limit) };
};

/**
 * Get an Agent by ID
 */
export const getAgentById = async (id: string) => {
  const agent = await AgentModel.findById(id).lean();
  if (!agent) throw new NotFoundError('Agent not found');
  return agent;
};

/**
 * Get an Agent by User ID
 */
export const getAgentByUserId = async (userId: string) => {
  const agent = await AgentModel.findOne({ user: userId })
    .populate('companyId', 'name')
    .lean();
  if (!agent) throw new NotFoundError('Agent not found');
  return agent;
};

/**
 * Toggle Agent's Active Status
 */
export const toggleAgentStatus = async (agentId: string) => {
  const agent = await AgentModel.findById(agentId);
  if (!agent) throw new NotFoundError('Agent not found');

  const user = await UserModel.findById(agent.user);
  if (!user) throw new NotFoundError('User not found');

  if (agent.level === 'owner')
    throw new BadRequestError('Owner agent cannot be deactivated');

  user.isActive = !user.isActive;
  await user.save();

  return { message: 'Agent status updated', isActive: user.isActive };
};

/**
 * Update an Agent (Allows updating phone, name, address, password, and reassigning to a sub-agent)
 */
export const updateAgent = async (id: string, updateData: any) => {
  const agent = await AgentModel.findById(id);
  if (!agent) throw new NotFoundError('Agent not found');
  if (updateData.password || updateData.address || updateData.profileImage) {
    const user = await UserModel.findById(agent.user);
    if (!user) throw new NotFoundError('User not found');
    if (updateData.password) user.password = updateData.password;
    if (updateData.address) user.address = updateData.address;
    if (updateData.profileImage) user.profileImage = updateData.profileImage;
    await user.save();
  }
  if (updateData.parentId) {
    const newParent = await AgentModel.findById(updateData.parentId);
    if (!newParent) throw new NotFoundError('New parent agent not found');
  }
  await AgentModel.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  return getAgentById(id);
};

/**
 * Delete an Agent
 */
export const deleteAgent = async (id: string) => {
  const agent = await AgentModel.findById(id);
  if (!agent) throw new NotFoundError('Agent not found');

  await UserModel.findByIdAndDelete(agent.user);
  await AgentModel.findByIdAndDelete(id);
};

// =====================================================================
// 1. Extend src/services/agentService.ts with admin wrappers
// ====================================================================

export interface AdminAgentFilters {
  role?: AgentLevel;
  active?: boolean;
  companyId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const listAgentsAdmin = async (filters: AdminAgentFilters = {}) => {
  const { role, companyId, search, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (role) query.level = role;
  if (companyId) query.companyId = companyId;
  if (search) {
    const regex = new RegExp(search, 'i');
    query.$or = [
      { firstName: regex },
      { lastName: regex },
      { 'user.email': regex },
    ];
  }

  // Base find; will populate user via schema
  let agents = await AgentModel.find(query).lean().skip(skip).limit(limit);
  const total = await AgentModel.countDocuments(query);

  return {
    agents,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
};

/** Admin: create an agent with fullName */
export const adminCreateAgent = async (data: any): Promise<IAgent> => {
  const {
    fullName,
    email,
    phone,
    profileImage,
    address,
    role,
    parentId,
    companyId,
  } = data;

  const existing = await UserModel.findOne({ email });
  if (existing) throw new BadRequestError('User already exists');

  const defaultPassword = 'TempPassword@123';
  const [firstName, ...rest] = fullName.trim().split(' ');
  const lastName = rest.join(' ');

  // Create user
  const user = await UserModel.create({
    email,
    password: defaultPassword,
    role: 'agent',
    profileImage,
    address,
  });

  // Create agent document
  const agent = await AgentModel.create({
    user: user._id,
    firstName,
    lastName,
    phone,
    level: role.toLowerCase() as AgentLevel,
    parentId: role !== 'owner' ? parentId : undefined,
    companyId,
  });

  return agent.toJSON() as IAgent;
};
