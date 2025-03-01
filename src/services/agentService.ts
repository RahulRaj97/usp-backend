import mongoose from 'mongoose';
import AgentModel, { IAgent } from '../models/agentModel';
import UserModel, { IUser } from '../models/userModel';
import { NotFoundError, BadRequestError } from '../utils/appError';

/**
 * Create an agent and a linked user transactionally
 */
export const createAgent = async (agentData: Partial<IAgent & IUser>) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { email, password, address, ...agentSpecificFields } = agentData;
    const existingUser = await UserModel.findOne({ email }).session(session);
    if (existingUser)
      throw new BadRequestError('User with this email already exists');
    const user = await UserModel.create(
      [{ email, password, role: 'agent', address }],
      { session },
    );
    const agent = await AgentModel.create(
      [{ user: user[0]._id, ...agentSpecificFields }],
      { session },
    );
    await session.commitTransaction();
    session.endSession();
    return await AgentModel.findById(agent[0]._id).populate(
      'user',
      'email role address',
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Get all agents with user details
 */
export const getAllAgents = async (): Promise<IAgent[]> => {
  return await AgentModel.find().populate('user', 'email role address');
};

/**
 * Get an agent by ID with user details
 */
export const getAgentById = async (id: string): Promise<IAgent> => {
  const agent = await AgentModel.findById(id).populate(
    'user',
    'email role address',
  );
  if (!agent) {
    throw new NotFoundError('Agent not found');
  }
  return agent;
};

/**
 * Update an agent and their linked user
 */
export const updateAgent = async (
  id: string,
  updateData: Partial<IAgent & IUser>,
): Promise<IAgent> => {
  const agent = await AgentModel.findById(id);
  if (!agent) {
    throw new NotFoundError('Agent not found');
  }
  if (updateData.email || updateData.password || updateData.address) {
    await UserModel.findByIdAndUpdate(agent.user, {
      email: updateData.email,
      password: updateData.password,
      address: updateData.address,
    });
  }
  const updatedAgent = (await AgentModel.findByIdAndUpdate(id, updateData, {
    new: true,
  })) as IAgent | null;
  if (!updatedAgent) {
    throw new NotFoundError('Failed to update agent');
  }
  return updatedAgent;
};

/**
 * Delete an agent and the linked user
 */
export const deleteAgent = async (id: string): Promise<void> => {
  const agent = await AgentModel.findById(id);
  if (!agent) {
    throw new NotFoundError('Agent not found');
  }
  await UserModel.findByIdAndDelete(agent.user);
  await AgentModel.findByIdAndDelete(id);
};
