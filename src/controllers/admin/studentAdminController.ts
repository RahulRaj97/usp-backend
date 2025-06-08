// =====================================================================
// File: src/controllers/admin/studentAdminController.ts
// =====================================================================
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from '../../utils/httpStatuses';
import {
  listStudentsAdmin,
  adminCreateStudent,
  adminGetStudentById,
  adminUpdateStudent,
  adminDeleteStudent,
  AdminStudentFilters,
} from '../../services/studentService';
import { Gender } from 'models/studentModel';
/** GET /api/admin/students */
export const listStudentsAdminController = async (
  req: Request<{}, {}, {}, AdminStudentFilters>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const q = req.query;
    const filters: AdminStudentFilters = {
      firstName: q.firstName,
      lastName: q.lastName,
      gender: q.gender as Gender,
      companyId: q.companyId,
      page: q.page ? Number(q.page) : undefined,
      limit: q.limit ? Number(q.limit) : undefined,
    };
    const result = await listStudentsAdmin(filters);
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};

/** GET /api/admin/students/:id */
export const getStudentByIdAdminController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const student = await adminGetStudentById(req.params.id);
    res.status(StatusCodes.OK).json(student);
  } catch (err) {
    next(err);
  }
};

/** POST /api/admin/students */
export const createStudentAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = Array.isArray(req.files)
      ? (req.files as Express.Multer.File[])
      : [];
    const student = await adminCreateStudent(req.body, files);
    res.status(StatusCodes.CREATED).json(student);
  } catch (err) {
    next(err);
  }
};

/** PUT /api/admin/students/:id */
export const updateStudentAdminController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = req.files as Express.Multer.File[];
    const updated = await adminUpdateStudent(req.params.id, req.body, files);
    res.status(StatusCodes.OK).json(updated);
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/admin/students/:id */
export const deleteStudentAdminController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    await adminDeleteStudent(req.params.id);
    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (err) {
    next(err);
  }
};
