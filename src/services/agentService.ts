import mongoose from 'mongoose';
import { OTPModel } from '../models/otpModel';
import AgentModel from '../models/agentModel';
import UserModel from '../models/userModel';
import { NotFoundError, BadRequestError } from '../utils/appError';
import { generateOTP } from '../utils/otpHelper';
import { sendOTPEmail } from './mailService';
import companyModel from '../models/companyModel';

/**
 * Register a Parent Agent & Send OTP
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
          level: 'parent',
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

    await sendOTPEmail(email, otp);

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

    const defaultPassword = 'TempPassword@123'; // ⚠️ Must be changed later!

    const user = await UserModel.create(
      [{ email, password: defaultPassword, role: 'agent' }],
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
          parentId: parentAgent._id,
        },
      ],
      { session },
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
 * Get All Agents (Admins see all, Parent agents see all in company, Sub-agents see only their assigned agents)
 */
export const getAllAgents = async (
  level: string,
  parentId: string,
  companyId: string,
  page: number,
  limit: number,
) => {
  let query: any = {};

  if (level === 'parent') {
    query = { companyId, _id: { $ne: parentId } }; // Fetch all in company except self
  } else if (level === 'sub-agent') {
    query = { parentId, level: 'agent', _id: { $ne: parentId } }; // Fetch assigned agents
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
  const agent = await AgentModel.findOne({ user: userId }).lean();
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

  if (updateData.password || updateData.address) {
    await UserModel.findByIdAndUpdate(agent.user, {
      password: updateData.password,
      address: updateData.address,
    });
  }

  if (updateData.parentId) {
    const newParent = await AgentModel.findById(updateData.parentId);
    if (!newParent) throw new NotFoundError('New parent agent not found');
  }

  const updatedAgent = await AgentModel.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  if (!updatedAgent) throw new NotFoundError('Failed to update agent');

  return updatedAgent;
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
