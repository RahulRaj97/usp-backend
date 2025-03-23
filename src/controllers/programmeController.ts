// src/controllers/programmeController.ts
import { Request, Response, NextFunction } from 'express';
import {
  createProgramme,
  getAllProgrammes,
  getProgrammeById,
  updateProgramme,
  deleteProgramme,
  listProgrammes,
} from '../services/programmeService';
import { StatusCodes } from '../utils/httpStatuses';

export const createProgrammeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const images = Array.isArray(req.files)
      ? (req.files as Express.Multer.File[])
      : [];
    const programme = await createProgramme(req.body, images);
    res.status(StatusCodes.CREATED).json(programme);
  } catch (err) {
    next(err);
  }
};

export const getAllProgrammesController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const programmes = await getAllProgrammes();
    res.status(StatusCodes.OK).json(programmes);
  } catch (err) {
    next(err);
  }
};

export const getProgrammeByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const programme = await getProgrammeById(req.params.id);
    res.status(StatusCodes.OK).json(programme);
  } catch (err) {
    next(err);
  }
};

export const updateProgrammeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const images = Array.isArray(req.files)
      ? (req.files as Express.Multer.File[])
      : [];
    const programme = await updateProgramme(req.params.id, req.body, images);
    res.status(StatusCodes.OK).json(programme);
  } catch (err) {
    next(err);
  }
};

export const deleteProgrammeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteProgramme(req.params.id);
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
};

export const filterProgrammesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const filters = req.query;
    const programmes = await listProgrammes(filters);
    res.status(StatusCodes.OK).json(programmes);
  } catch (err) {
    next(err);
  }
};
