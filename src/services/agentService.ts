import AgentModel, { IAgent } from '../models/agentModel';

export const createAgent = async (data: Partial<IAgent>): Promise<IAgent> => {
  const agent = new AgentModel(data);
  return await agent.save();
};

export const getAllAgents = async (): Promise<IAgent[]> => {
  return await AgentModel.find();
};

export const getAgentById = async (id: string): Promise<IAgent | null> => {
  return await AgentModel.findById(id);
};

export const updateAgent = async (
  id: string,
  data: Partial<IAgent>,
): Promise<IAgent | null> => {
  return await AgentModel.findByIdAndUpdate(id, data, { new: true });
};

export const deleteAgent = async (id: string): Promise<IAgent | null> => {
  return await AgentModel.findByIdAndDelete(id);
};
