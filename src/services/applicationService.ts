import studentModel from '../models/studentModel';
import agentModel from '../models/agentModel';
import applicationModel, {
  ApplicationStage,
  ApplicationStatus,
  IApplication,
} from '../models/applicationModel';
import { NotFoundError, UnauthorizedError } from '../utils/appError';
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

/**
 * Admin: create a new application
 */
export interface AdminApplicationDto {
  studentId: string;
  agentId: string;
  companyId: string;
  programmeIds: string[];
  priorityMapping: { programmeId: string; priority: number }[];
  notes?: string;
  supportingDocuments?: string[];
  status?: ApplicationStatus;
  currentStage?: ApplicationStage;
}

export const adminCreateApplication = async (
  data: AdminApplicationDto,
): Promise<IApplication> => {
  const app = await applicationModel.create({
    ...data,
    status: data.status ?? 'submitted_to_usp',
    currentStage: data.currentStage ?? 'profile_complete',
    isWithdrawn: false,
    submittedAt: new Date(),
  });
  return app;
};

/**
 * Admin: list applications with filters
 */
export interface AdminApplicationFilters {
  page?: number;
  limit?: number;
  status?: ApplicationStatus;
  stage?: ApplicationStage;
  studentId?: string;
  agentId?: string;
  companyId?: string;
}

export const listApplicationsAdmin = async (
  filters: AdminApplicationFilters = {},
) => {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (filters.status) query.status = filters.status;
  if (filters.stage) query.currentStage = filters.stage;
  if (filters.studentId) query.studentId = filters.studentId;
  if (filters.agentId) query.agentId = filters.agentId;
  if (filters.companyId) query.companyId = filters.companyId;

  const [apps, total] = await Promise.all([
    applicationModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    applicationModel.countDocuments(query),
  ]);

  return {
    applications: apps,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
};

/**
 * Admin: update an application
 */
export const adminUpdateApplication = async (
  id: string,
  data: Partial<AdminApplicationDto>,
): Promise<IApplication> => {
  const updated = await applicationModel.findByIdAndUpdate(id, data, {
    new: true,
  });
  if (!updated) throw new NotFoundError('Application not found');
  return updated;
};

/**
 * Admin: delete an application
 */
export const adminDeleteApplication = async (id: string): Promise<void> => {
  const result = await applicationModel.findByIdAndDelete(id);
  if (!result) throw new NotFoundError('Application not found');
};

/**
 * Admin: withdraw (mark isWithdrawn)
 */
export const adminWithdrawApplication = async (
  id: string,
): Promise<IApplication> => {
  const app = await applicationModel.findByIdAndUpdate(
    id,
    { isWithdrawn: true },
    { new: true },
  );
  if (!app) throw new NotFoundError('Application not found');
  return app;
};
