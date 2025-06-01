// src/services/applicationService.ts
import mongoose from 'mongoose';
import agentModel from '../models/agentModel';
import applicationModel, {
  IApplication,
  ApplicationStage,
  ApplicationStatus,
  StageHistoryEntry,
  STAGE_VALUES,
} from '../models/applicationModel';
import { NotFoundError, UnauthorizedError } from '../utils/appError';
import { getAgentById } from './agentService';
import { getUserById } from './userService';
import adminModel, { AdminRole } from '../models/adminModel';
import programmeModel from '../models/programmeModel';
import companyModel from '../models/companyModel';
import {
  sendApplicationSubmittedToAgentAndOwnerEmail,
  sendApplicationSubmittedToSuperAdminEmail
} from './mailService';
import userModel from '../models/userModel';


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

/**
 * Set the status of a stage (done/undone), update stageStatus, stageHistory, and currentStage accordingly.
 */
export async function setStageStatus(
  applicationId: string,
  stage: ApplicationStage,
  done: boolean,
  adminId: string,
  notes?: string,
  attachments?: string[],
) {
  const app = await applicationModel.findById(applicationId);
  if (!app) throw new NotFoundError('Application not found');
  // Ensure adminId is a mongoose.Types.ObjectId
  const adminObjectId = new mongoose.Types.ObjectId(adminId);
  // Update or add the stageStatus entry
  let entry = app.stageStatus.find((s) => s.stage === stage);
  if (!entry) {
    entry = {
      stage,
      done,
      doneAt: done ? new Date() : undefined,
      doneBy: done ? adminObjectId : undefined,
      notes,
      attachments,
    };
    app.stageStatus.push(entry);
  } else {
    entry.done = done;
    entry.doneAt = done ? new Date() : undefined;
    entry.doneBy = done ? adminObjectId : undefined;
    if (notes !== undefined) entry.notes = notes;
    if (attachments !== undefined) entry.attachments = attachments;
  }
  // Add to stageHistory for audit
  app.stageHistory.push({
    stage,
    notes,
    completedAt: new Date(),
  });
  // Update currentStage to the first not-done stage, or last stage if all done
  const firstNotDone = STAGE_VALUES.find(
    (s) => !app.stageStatus.find((ss) => ss.stage === s)?.done,
  );
  if (firstNotDone) {
    app.currentStage = firstNotDone;
  } else {
    app.currentStage = STAGE_VALUES[STAGE_VALUES.length - 1];
  }
  await app.save();
  return enrichOne(applicationId);
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
  const app = await applicationModel.create({
    studentId,
    agentId: agent._id,
    companyId: agent.companyId,
    programmeIds,
    priorityMapping,
    currentStage: STAGE_VALUES[0],
    submittedAt: new Date(),
    stageStatus: [],
  });

  // Email Notification Logic - Start
  try {
    // The 'agent' variable is already fetched in createApplication: const agent = await getAgentById(agentId);
    // It should have user details populated (email, firstName, lastName).

    // 1. Submitting Agent's Details
    const submittingAgentName = `${agent.firstName} ${agent.lastName}`;
    const submittingAgentEmail = (agent.user as any)?.email;

    // 2. Fetch Student's User Details
    const studentUser = await userModel.findById(studentId).lean();
    const studentName = studentUser ? `${studentUser.firstName} ${studentUser.lastName}` : 'Student Name N/A';

    // 3. Fetch Company Owner(s) Emails
    let companyOwnerEmails: string[] = [];
    if (agent.companyId) {
      const ownerAgents = await agentModel.find({ companyId: agent.companyId, level: 'owner' }).populate('user').lean();
      companyOwnerEmails = ownerAgents
        .map(owner => (owner.user as any)?.email)
        .filter(email => !!email);
    }

    // 4. Fetch Super Admin Emails
    const superAdmins = await adminModel.find({ role: AdminRole.SUPER_ADMIN }).populate('user').lean();
    const superAdminEmails = superAdmins
      .map(sa => (sa.user as any)?.email)
      .filter(email => !!email);

    // 5. Fetch Programme Details & Format for Email
    const programmes = await programmeModel.find({ _id: { $in: app.programmeIds } }).populate('universityId').lean();
    const programmesListHtml = programmes.map(p => {
      const universityName = (p.universityId as any)?.name || 'University N/A';
      return `<li>${p.name} (University: ${universityName})</li>`;
    }).join('');
    const programmesHtmlForEmail = `<ul>${programmesListHtml}</ul>`;

    // 6. Fetch Company Details
    let companyName = 'Company N/A';
    if (agent.companyId) {
      const company = await companyModel.findById(agent.companyId).lean();
      if (company) {
        companyName = company.name;
      }
    }

    const submissionDateFormatted = app.submittedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const agentAndOwnerRecipients = [...new Set([submittingAgentEmail, ...companyOwnerEmails].filter(email => !!email))] as string[];

    if (agentAndOwnerRecipients.length > 0 && submittingAgentEmail) {
      sendApplicationSubmittedToAgentAndOwnerEmail(
        submittingAgentName,
        agentAndOwnerRecipients,
        app._id.toString(),
        submissionDateFormatted,
        studentName,
        programmesHtmlForEmail
      ).catch(err => console.error("Failed to send application email to agent/owner:", err));
    } else if (!submittingAgentEmail) {
      console.warn("Submitting agent email not found for agent/owner notification.");
    }

    if (superAdminEmails.length > 0 && submittingAgentEmail) {
      sendApplicationSubmittedToSuperAdminEmail(
        superAdminEmails,
        submittingAgentName,
        submittingAgentEmail,
        companyName,
        app._id.toString(),
        submissionDateFormatted,
        studentName,
        programmesHtmlForEmail
      ).catch(err => console.error("Failed to send application email to super admins:", err));
    } else if (superAdminEmails.length > 0 && !submittingAgentEmail) {
      console.warn("Submitting agent email not found for super admin notification (super admins will still be notified if company name is available).");
      sendApplicationSubmittedToSuperAdminEmail( // Allow sending to superadmin even if agent email is missing for some reason
        superAdminEmails,
        submittingAgentName,
        'Agent Email N/A',
        companyName,
        app._id.toString(),
        submissionDateFormatted,
        studentName,
        programmesHtmlForEmail
      ).catch(err => console.error("Failed to send application email to super admins (agent email missing):", err));
    }

  } catch (emailError) {
    console.error('Error preparing or sending application submission emails:', emailError);
  }
  // Email Notification Logic - End

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
    currentStage: STAGE_VALUES[0],
    stageStatus: [],
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

/** Admin: update status, stage (pushing to history), notes, attachments, or stageStatus */
export async function adminUpdateApplication(
  id: string,
  data: Partial<{
    notes: string;
    supportingDocuments: string[];
    status: ApplicationStatus;
    currentStage: ApplicationStage;
    stage: ApplicationStage;
    done: boolean;
    adminId: string;
    stageNotes?: string;
    stageAttachments?: string[];
  }>,
): Promise<EnrichedApp> {
  const app = await applicationModel.findById(id);
  if (!app) throw new NotFoundError('Application not found');

  if (data.status && data.status !== app.status) {
    app.status = data.status;
  }

  // If stage and done are provided, update stageStatus
  if (data.stage && typeof data.done === 'boolean' && data.adminId) {
    await setStageStatus(
      id,
      data.stage,
      data.done,
      data.adminId,
      data.stageNotes,
      data.stageAttachments,
    );
    // refetch app after setStageStatus
    return enrichOne(id);
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
