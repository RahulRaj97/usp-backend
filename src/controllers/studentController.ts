// src/controllers/studentController.ts
import { Request, Response, NextFunction } from 'express';
import {
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentById,
  listStudents,
} from '../services/studentService';
import { StatusCodes } from '../utils/httpStatuses';
import { getAgentByUserId } from '../services/agentService';

export const createStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userID = req.user?.id || '';
    const agent = await getAgentByUserId(userID);
    const dataWithFiles = {
      ...req.body,
      files: req.files,
    };
    const student = await createStudent(dataWithFiles, agent);
    res.status(StatusCodes.CREATED).json(student);
  } catch (error) {
    next(error);
  }
};

export const updateStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const student = await updateStudent(req.params.id, req.body, req.files);
    res.status(StatusCodes.OK).json(student);
  } catch (error) {
    next(error);
  }
};

export const deleteStudentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteStudent(req.params.id);
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
};

export const getStudentByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const student = await getStudentById(req.params.id);
    res.status(StatusCodes.OK).json(student);
  } catch (error) {
    next(error);
  }
};

export const listStudentsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const students = await listStudents(req.user);
    res.status(StatusCodes.OK).json(students);
  } catch (error) {
    next(error);
  }
};
