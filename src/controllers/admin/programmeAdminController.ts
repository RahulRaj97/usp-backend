import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from '../../utils/httpStatuses';
import {
  adminCreateProgramme,
  listProgrammesAdmin,
  adminGetProgrammeById,
  adminUpdateProgramme,
  adminDeleteProgramme,
  AdminProgrammeDto,
  AdminProgrammeFilters,
} from '../../services/programmeService';

export const createProgrammeAdmin = async (
  req: Request<{}, {}, AdminProgrammeDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    const prog = await adminCreateProgramme(req.body, files);
    res.status(StatusCodes.CREATED).json(prog);
  } catch (err) {
    next(err);
  }
};

export const listProgrammesAdminController = async (
  req: Request<{}, {}, {}, AdminProgrammeFilters>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const q = req.query;
    const filters: AdminProgrammeFilters = {
      universityId: q.universityId,
      type: q.type,
      subjectArea: q.subjectArea,
      startDate: q.startDate ? new Date(q.startDate) : undefined,
      minDuration: q.minDuration ? Number(q.minDuration) : undefined,
      maxDuration: q.maxDuration ? Number(q.maxDuration) : undefined,
      page: q.page ? Number(q.page) : undefined,
      limit: q.limit ? Number(q.limit) : undefined,
    };
    const result = await listProgrammesAdmin(filters);
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};

export const getProgrammeByIdAdmin = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const prog = await adminGetProgrammeById(req.params.id);
    res.status(StatusCodes.OK).json(prog);
  } catch (err) {
    next(err);
  }
};

export const updateProgrammeAdmin = async (
  req: Request<{ id: string }, {}, Partial<AdminProgrammeDto>>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    const prog = await adminUpdateProgramme(req.params.id, req.body, files);
    res.status(StatusCodes.OK).json(prog);
  } catch (err) {
    next(err);
  }
};

export const deleteProgrammeAdmin = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    await adminDeleteProgramme(req.params.id);
    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (err) {
    next(err);
  }
};
