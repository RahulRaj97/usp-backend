// src/services/applicationService.ts

import agentModel from '../models/agentModel';
import applicationModel, {
  IApplication,
  ApplicationStage,
  ApplicationStatus,
  StageHistoryEntry,
} from '../models/applicationModel';
import { NotFoundError, UnauthorizedError } from '../utils/appError';
import { getAgentById } from './agentService';
import { getUserById } from './userService';

export interface ApplicationFilters {
  page?: number;
  limit?: number;
  studentId?: string;
  companyId?: string;
  agentId?: string;
  status?: ApplicationStatus;
  stage?: ApplicationStage;
}

type EnrichedApp = IApplication & { student: any };

/**
 * Internal helper: load one application, populate student, strip Mongoose metadata
 */
async function enrichOne(id: string): Promise<EnrichedApp> {
  const doc = await applicationModel.findById(id).populate('studentId').lean();
  if (!doc) throw new NotFoundError('Application not found');
  const { studentId, __v, ...rest } = doc as any;
  return { ...rest, student: studentId } as EnrichedApp;
}

/** Agent: create a new application */
export async function createApplication(
  agentUserId: string,
  studentId: string,
  programmeIds: string[],
  priorityMapping: Record<string, number>,
): Promise<EnrichedApp> {
  const agent = await getAgentById(agentUserId);
  if (!agent) throw new UnauthorizedError('Agent not found');
  const mappingArray = Object.entries(priorityMapping).map(
    ([programmeId, priority]) => ({ programmeId, priority }),
  );
  const app = await applicationModel.create({
    studentId,
    agentId: agent._id,
    companyId: agent.companyId,
    programmeIds,
    priorityMapping: mappingArray,
  });
  return enrichOne(app._id.toString());
}

/** Agent: list applications scoped to this agent (and their sub-agents or company) */
export async function listApplications(
  agentUserId: string,
  filters: ApplicationFilters = {},
) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const skip = (page - 1) * limit;

  const agent = await getAgentById(agentUserId);
  if (!agent) throw new UnauthorizedError('Agent not found');
  const user = await getUserById(agent.user._id.toString());

  const query: any = {};
  if (filters.studentId) query.studentId = filters.studentId;
  if (filters.companyId) query.companyId = filters.companyId;
  if (filters.status) query.status = filters.status;
  if (filters.stage) query.currentStage = filters.stage;

  // Scope by agent.level
  if (user.role === 'agent') {
    switch (agent.level) {
      case 'admission':
      case 'counsellor':
        query.agentId = agent._id;
        break;
      case 'manager': {
        const subs = await agentModel.find({ parentId: agent._id });
        query.agentId = { $in: subs.map((a) => a._id).concat(agent._id) };
        break;
      }
      case 'owner':
        query.companyId = agent.companyId;
        if (filters.agentId) query.agentId = filters.agentId;
        break;
      default:
        throw new UnauthorizedError();
    }
  }

  const [docs, total] = await Promise.all([
    applicationModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    applicationModel.countDocuments(query),
  ]);

  const items = await Promise.all(docs.map((a) => enrichOne(a._id.toString())));

  return {
    applications: items,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

/** Anyone (agent or admin): get one application */
export const getApplicationById = enrichOne;

/** Agent: update notes or supportingDocuments (and record in stageHistory) */
export async function updateApplication(
  id: string,
  data: { notes?: string; supportingDocuments?: string[] },
): Promise<EnrichedApp> {
  const app = await applicationModel.findById(id);
  if (!app) throw new NotFoundError('Application not found');

  if (data.notes != null) app.notes = data.notes;
  if (data.supportingDocuments) {
    app.supportingDocuments = data.supportingDocuments;
    app.stageHistory.push({
      stage: app.currentStage,
      notes: data.notes,
      completedAt: new Date(),
    } as StageHistoryEntry);
  }

  await app.save();
  return enrichOne(id);
}

/** Agent: withdraw their own application */
export async function withdrawApplication(
  agentUserId: string,
  id: string,
): Promise<EnrichedApp> {
  const agent = await getAgentById(agentUserId);
  if (!agent) throw new UnauthorizedError('Agent not found');

  const app = await applicationModel.findById(id);
  if (!app) throw new NotFoundError('Application not found');

  if (!app.agentId.equals(agent._id)) {
    throw new UnauthorizedError();
  }
  app.isWithdrawn = true;
  await app.save();
  return enrichOne(id);
}

/** Admin DTO for creation/update */
export interface AdminApplicationDto {
  studentId: string;
  agentId: string;
  programmeIds: string[];
  priorityMapping: { programmeId: string; priority: number }[];
  notes?: string;
  supportingDocuments?: string[];
  status?: ApplicationStatus;
  currentStage?: ApplicationStage;
}

/** Admin: create any application */
export async function adminCreateApplication(
  dto: AdminApplicationDto,
): Promise<EnrichedApp> {
  const agent = await getAgentById(dto.agentId);
  if (!agent) throw new UnauthorizedError('Agent not found');
  const app = await applicationModel.create({
    ...dto,
    companyId: agent.companyId,
    submittedAt: new Date(),
    isWithdrawn: false,
  });
  return enrichOne(app._id.toString());
}

/** Admin: list all applications with arbitrary filters */
export async function listApplicationsAdmin(filters: ApplicationFilters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (filters.studentId) query.studentId = filters.studentId;
  if (filters.companyId) query.companyId = filters.companyId;
  if (filters.agentId) query.agentId = filters.agentId;
  if (filters.status) query.status = filters.status;
  if (filters.stage) query.currentStage = filters.stage;

  const [docs, total] = await Promise.all([
    applicationModel
      .find(query)
      .populate('studentId')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
    applicationModel.countDocuments(query),
  ]);

  const applications = docs.map((doc: any) => {
    const { studentId, __v, ...rest } = doc;
    return { ...rest, student: studentId } as EnrichedApp;
  });

  return {
    applications,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

/** Admin: update status, stage (pushing to history), notes, attachments */
export async function adminUpdateApplication(
  id: string,
  data: Partial<{
    notes: string;
    supportingDocuments: string[];
    status: ApplicationStatus;
    currentStage: ApplicationStage;
  }>,
): Promise<EnrichedApp> {
  const app = await applicationModel.findById(id);
  if (!app) throw new NotFoundError('Application not found');

  if (data.status && data.status !== app.status) {
    app.status = data.status;
  }

  if (data.currentStage && data.currentStage !== app.currentStage) {
    app.stageHistory.push({
      stage: app.currentStage,
      notes: data.notes,
      completedAt: new Date(),
    } as StageHistoryEntry);
    app.currentStage = data.currentStage;
  }

  if (data.notes) app.notes = data.notes;
  if (data.supportingDocuments)
    app.supportingDocuments = data.supportingDocuments;

  await app.save();
  return enrichOne(id);
}

/** Admin: mark withdrawn */
export async function adminWithdrawApplication(
  id: string,
): Promise<EnrichedApp> {
  const app = await applicationModel.findByIdAndUpdate(
    id,
    { isWithdrawn: true },
    { new: true },
  );
  if (!app) throw new NotFoundError('Application not found');
  return enrichOne(id);
}

/** Admin: hard delete */
export async function adminDeleteApplication(id: string): Promise<void> {
  const result = await applicationModel.findByIdAndDelete(id);
  if (!result) throw new NotFoundError('Application not found');
}
