import { Request, Response, NextFunction } from 'express';
import {
  adminCreateApplication,
  listApplicationsAdmin,
  adminUpdateApplication,
  adminDeleteApplication,
  adminWithdrawApplication,
  getApplicationById,
  AdminApplicationDto,
  ApplicationFilters as AdminApplicationFilters,
} from '../../services/applicationService';
import { StatusCodes } from '../../utils/httpStatuses';
import { uploadFileBufferToS3 } from '../../services/s3UploadHelpter';

/**
 * Admin: create any application
 */
export const createApplicationAdmin = async (
  req: Request<{}, {}, AdminApplicationDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const app = await adminCreateApplication(req.body);
    res.status(StatusCodes.CREATED).json(app);
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: list all applications (unscoped)
 */
export const listApplicationsAdminController = async (
  // leave req.query typed as AdminApplicationFilters
  req: Request<{}, {}, {}, AdminApplicationFilters>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const raw = req.query;

    const filters: AdminApplicationFilters = {
      page:
        typeof raw.page === 'string' ? parseInt(raw.page, 10) : (raw.page ?? 1),
      limit:
        typeof raw.limit === 'string'
          ? parseInt(raw.limit, 10)
          : (raw.limit ?? 10),
      studentId: raw.studentId,
      agentId: raw.agentId,
      companyId: raw.companyId,
      status: raw.status as any,
      stage: raw.stage as any,
    };

    const result = await listApplicationsAdmin(filters);
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: get one application by ID
 */
export const getApplicationByIdAdmin = async (
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
 * Admin: update status, stage, notes, documents
 */
export const updateApplicationAdmin = async (
  req: Request<{ id: string }, {}, Partial<AdminApplicationDto>>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updated = await adminUpdateApplication(req.params.id, req.body);
    res.status(StatusCodes.OK).json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: withdraw (mark isWithdrawn=true)
 */
export const withdrawApplicationAdmin = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const withdrawn = await adminWithdrawApplication(req.params.id);
    res.status(StatusCodes.OK).json(withdrawn);
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: hard‐delete an application
 */
export const deleteApplicationAdmin = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    await adminDeleteApplication(req.params.id);
    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (err) {
    next(err);
  }
};

export const uploadSupportingDocsAdmin = async (
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
    const updated = await adminUpdateApplication(appId, {
      supportingDocuments: urls,
    });
    res.status(StatusCodes.OK).json(updated);
  } catch (err) {
    next(err);
  }
};
