import AgentModel, { IAgent } from '../models/agentModel';

/**
 * Create a new agent
 */
export const createAgent = async (data: Partial<IAgent>): Promise<IAgent> => {
  const agent = new AgentModel(data);
  return await agent.save();
};

/**
 * Get all agents
 */
export const getAllAgents = async (): Promise<IAgent[]> => {
  return await AgentModel.find();
};

/**
 * Get an agent by ID
 */
export const getAgentById = async (id: string): Promise<IAgent | null> => {
  return await AgentModel.findById(id);
};

/**
 * Update an agent by ID
 */
export const updateAgent = async (
  id: string,
  data: Partial<IAgent>,
): Promise<IAgent | null> => {
  return await AgentModel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

/**
 * Delete an agent by ID
 */
export const deleteAgent = async (id: string): Promise<IAgent | null> => {
  return await AgentModel.findByIdAndDelete(id);
};
