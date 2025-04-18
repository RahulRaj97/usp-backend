import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from '../../utils/httpStatuses';
import {
  listUniversitiesAdmin,
  adminGetUniversityById,
  adminCreateUniversity,
  adminUpdateUniversity,
  adminDeleteUniversity,
  AdminUniversityFilters,
} from '../../services/universityService';

export const listUniversitiesAdminController = async (
  req: Request<{}, {}, {}, AdminUniversityFilters>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const q = req.query;
    const filters: AdminUniversityFilters = {
      name: q.name,
      country: q.country,
      page: q.page ? Number(q.page) : undefined,
      limit: q.limit ? Number(q.limit) : undefined,
    };
    const result = await listUniversitiesAdmin(filters);
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};

export const getUniversityByIdAdmin = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const uni = await adminGetUniversityById(req.params.id);
    res.status(StatusCodes.OK).json(uni);
  } catch (err) {
    next(err);
  }
};

export const createUniversityAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = (req.file as Express.Multer.File) || undefined;
    const uni = await adminCreateUniversity(req.body, file);
    res.status(StatusCodes.CREATED).json(uni);
  } catch (err) {
    next(err);
  }
};

export const updateUniversityAdmin = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = (req.file as Express.Multer.File) || undefined;
    const uni = await adminUpdateUniversity(req.params.id, req.body, file);
    res.status(StatusCodes.OK).json(uni);
  } catch (err) {
    next(err);
  }
};

export const deleteUniversityAdmin = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    await adminDeleteUniversity(req.params.id);
    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (err) {
    next(err);
  }
};
