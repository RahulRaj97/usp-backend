import { Request, Response, NextFunction } from 'express';
import {
  createApplication,
  listApplications,
  getApplicationById,
  updateApplication,
  adminWithdrawApplication as withdrawApplication,
  ApplicationFilters,
} from '../services/applicationService';
import { StatusCodes } from '../utils/httpStatuses';
import { getAgentByUserId } from '../services/agentService';
import { uploadFileBufferToS3 } from '../services/s3UploadHelpter';

/**
 * Agent: submit a new application
 */
export const createApplicationController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { studentId, programmeIds, priorityMapping } = req.body;
    const user = req.user!;
    const agent = await getAgentByUserId(user.id);
    const app = await createApplication(
      agent._id.toString(),
      studentId,
      programmeIds,
      priorityMapping,
    );
    res.status(StatusCodes.CREATED).json(app);
  } catch (err) {
    next(err);
  }
};

/**
 * Agent: list all applications (scoped by their level/company)
 */
export const listApplicationsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const filters: ApplicationFilters = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      studentId: req.query.studentId as string | undefined,
      companyId: req.query.companyId as string | undefined,
      status: req.query.status
        ? (req.query.status as ApplicationFilters['status'])
        : undefined,
      stage: req.query.stage
        ? (req.query.stage as ApplicationFilters['stage'])
        : undefined,
    };
    const user = req.user!;
    const agent = await getAgentByUserId(user.id);
    const result = await listApplications(agent._id.toString(), filters);
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Agent: get one application by ID
 */
export const getApplicationByIdController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const app = await getApplicationById(req.params.id);
    res.status(StatusCodes.OK).json(app);
  } catch (err) {
    next(err);
  }
};

/**
 * Agent: add notes or upload supporting documents to an application
 */
export const updateApplicationController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload: { notes?: string; supportingDocuments?: string[] } = {};
    if (req.body.notes !== undefined) payload.notes = req.body.notes;
    if (req.body.supportingDocuments !== undefined)
      payload.supportingDocuments = req.body.supportingDocuments;
    const updated = await updateApplication(req.params.id, payload);
    res.status(StatusCodes.OK).json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * Agent: withdraw (mark isWithdrawn=true)
 */
export const withdrawApplicationController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const withdrawn = await withdrawApplication(req.params.id);
    res.status(StatusCodes.OK).json(withdrawn);
  } catch (err) {
    next(err);
  }
};

export const uploadSupportingDocsController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const appId = req.params.id;
    const files = req.files as Express.Multer.File[];
    const urls = await Promise.all(
      files.map((f) =>
        uploadFileBufferToS3(
          f.buffer,
          f.originalname,
          'applications',
          appId,
          f.mimetype,
        ),
      ),
    );
    const updated = await updateApplication(appId, {
      supportingDocuments: urls,
    });
    res.status(StatusCodes.OK).json(updated);
  } catch (err) {
    next(err);
  }
};
