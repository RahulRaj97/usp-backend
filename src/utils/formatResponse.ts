import { IAgent } from '../models/agentModel';
import { IUser } from '../models/userModel';

export const formatAgentResponse = (agent: IAgent, user: IUser) => {
  return {
    id: agent._id,
    firstName: agent.firstName,
    lastName: agent.lastName,
    company: agent.company,
    phone: agent.phone,
    profileImage: agent.profileImage,
    level: agent.level,
    parentId: agent.parentId || null,
    email: user.email,
    role: user.role,
    address: user.address || null,
    isActive: user.isActive,
    isEmailVerified: user.isEmailVerified,
    createdAt: agent.createdAt,
    updatedAt: agent.updatedAt,
  };
};
