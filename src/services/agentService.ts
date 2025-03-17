import mongoose from 'mongoose';
import AgentModel, { IAgent } from '../models/agentModel';
import UserModel, { IUser } from '../models/userModel';
import { NotFoundError, BadRequestError } from '../utils/appError';

/**
 * Register a Parent Agent
 */
export const createParentAgent = async (data: Partial<IAgent & IUser>) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { email, password, firstName, lastName, company, phone, address } =
      data;

    const existingUser = await UserModel.findOne({ email }).session(session);
    if (existingUser)
      throw new BadRequestError('User with this email already exists');

    const user = await UserModel.create(
      [{ email, password, role: 'agent', address }],
      { session },
    );

    const agent = await AgentModel.create(
      [
        {
          user: user[0]._id,
          firstName,
          lastName,
          company,
          phone,
          level: 'parent',
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return await AgentModel.findById(agent[0]._id);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Create a Sub-Agent or Normal Agent
 */
export const createSubAgent = async (
  parentAgentId: string,
  data: Partial<IAgent & IUser>,
) => {
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
          company: parentAgent.company,
          level,
          parentId: parentAgent._id,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return await AgentModel.findById(agent[0]._id);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get All Agents (Excluding Logged-in User)
 */
export const getAllAgents = async (
  level: string,
  parentId: string,
  company: string,
  page: number,
  limit: number,
) => {
  let query: any = {};

  if (level === 'parent') {
    query = { company, _id: { $ne: parentId } }; // Exclude logged-in agent
  } else if (level === 'sub-agent') {
    query = { parentId, level: 'agent', _id: { $ne: parentId } }; // Exclude logged-in agent
  } else {
    return { agents: [], totalPages: 0 };
  }

  const agents = await AgentModel.find(query)
    .populate('user', 'email isActive address')
    .skip((page - 1) * limit)
    .limit(limit);

  const totalAgents = await AgentModel.countDocuments(query);

  return { agents, totalPages: Math.ceil(totalAgents / limit) };
};
/**
 * Get an Agent by ID
 */
export const getAgentById = async (id: string): Promise<IAgent> => {
  const agent = await AgentModel.findById(id);
  if (!agent) throw new NotFoundError('Agent not found');
  return agent;
};

/**
 * Get an Agent by User ID
 */
export const getAgentByUserId = async (userId: string): Promise<IAgent> => {
  const agent = await AgentModel.findOne({ user: userId });
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

  // Toggle the isActive status
  user.isActive = !user.isActive;
  await user.save();

  return { message: 'Agent status updated', isActive: user.isActive };
};

/**
 * Update an Agent
 */
export const updateAgent = async (
  id: string,
  updateData: Partial<IAgent & IUser>,
): Promise<IAgent> => {
  const agent = await AgentModel.findById(id);
  if (!agent) throw new NotFoundError('Agent not found');

  if (updateData.email || updateData.password || updateData.address) {
    await UserModel.findByIdAndUpdate(agent.user, {
      email: updateData.email,
      password: updateData.password,
      address: updateData.address,
    });
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
export const deleteAgent = async (id: string): Promise<void> => {
  const agent = await AgentModel.findById(id);
  if (!agent) throw new NotFoundError('Agent not found');

  await UserModel.findByIdAndDelete(agent.user);
  await AgentModel.findByIdAndDelete(id);
};
