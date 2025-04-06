import studentModel from '../models/studentModel';
import agentModel from '../models/agentModel';
import applicationModel, { IApplication } from '../models/applicationModel';
import { UnauthorizedError } from '../utils/appError';
import { getAgentById } from './agentService';
import { getUserById } from './userService';

interface ApplicationFilters {
  page?: number;
  limit?: number;
  companyId?: string;
  studentId?: string;
}

export const createApplication = async (
  agentId: string,
  studentId: string,
  programmeIds: string[],
  priorityMapping: Record<string, number>,
): Promise<IApplication> => {
  const agent = await getAgentById(agentId);
  if (!agent) throw new UnauthorizedError('Agent not found');
  return await applicationModel.create({
    studentId,
    agentId: agent._id,
    companyId: agent.companyId,
    programmeIds,
    priorityMapping,
  });
};

export const listApplications = async (
  agentId: string,
  filters: ApplicationFilters = {},
) => {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const agent = await getAgentById(agentId);
  const user = await getUserById(`${agent.user._id}`);
  if (!agent) throw new UnauthorizedError('Agent not found');

  const query: any = {};

  if (filters.studentId) {
    query.studentId = filters.studentId;
  }

  if (user.role === 'admin') {
    // Admin: no scoping
  } else if (user.role === 'agent') {
    if (agent.level === 'admission' || agent.level === 'counsellor') {
      query.agentId = agent._id;
    } else if (agent.level === 'manager') {
      const subAgents = await agentModel.find({ parentId: agent._id });
      const agentIds = subAgents.map((a) => a._id).concat(agent._id);
      query.agentId = { $in: agentIds };
    } else if (agent.level === 'owner') {
      query.companyId = agent.companyId;
    } else {
      throw new UnauthorizedError();
    }
  } else {
    throw new UnauthorizedError();
  }

  const [applications, total] = await Promise.all([
    applicationModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    applicationModel.countDocuments(query),
  ]);

  // ✅ Add studentId from student document (student.user === application.studentId)
  const enrichedApplications = await Promise.all(
    applications.map(async (application) => {
      const student = await studentModel.findOne({
        _id: application.studentId,
      });
      const studentId = student?.studentId || null;

      return {
        ...application.toObject(),
        studentIdFriendly: studentId,
      };
    }),
  );

  return {
    applications: enrichedApplications,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
};

export const getApplicationById = async (id: string) => {
  return await applicationModel.findById(id);
};
