// src/controllers/universityController.ts
import { Request, Response, NextFunction } from 'express';
import {
  createUniversity,
  getAllUniversities,
  getUniversityById,
  updateUniversity,
  deleteUniversity,
} from '../services/universityService';
import { StatusCodes } from '../utils/httpStatuses';
import { NotFoundError } from '../utils/appError';

export const createUniversityController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const university = await createUniversity(req.body, req.file);
    res.status(StatusCodes.CREATED).json(university);
  } catch (error) {
    next(error);
  }
};

export const getAllUniversitiesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const filters = {
      search: req.query.search as string | undefined,
    };
    const universities = await getAllUniversities(filters);
    res.status(StatusCodes.OK).json(universities);
  } catch (error) {
    next(error);
  }
};

export const getUniversityByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const university = await getUniversityById(req.params.id);
    if (!university) throw new NotFoundError('University not found');
    res.status(StatusCodes.OK).json(university);
  } catch (error) {
    next(error);
  }
};

export const updateUniversityController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updated = await updateUniversity(req.params.id, req.body, req.file);
    if (!updated) throw new NotFoundError('University not found');
    res.status(StatusCodes.OK).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteUniversityController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteUniversity(req.params.id);
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
};
