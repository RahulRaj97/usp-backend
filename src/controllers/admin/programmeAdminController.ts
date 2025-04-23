// src/controllers/admin/programmeAdminController.ts

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from '../../utils/httpStatuses';
import {
  listProgrammesAdmin,
  getProgrammeByIdForAdmin,
  createProgrammeAdmin,
  updateProgrammeAdmin,
  deleteProgrammeAdmin,
  AdminProgrammeFilters,
  AdminCreateProgrammeDto,
  AdminUpdateProgrammeDto,
} from '../../services/programmeService';

function parseJsonField<T>(val: any): T | undefined {
  if (val == null) return undefined;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val) as T;
    } catch {}
  }
  return val as T;
}

export const listProgrammesAdminController = async (
  req: Request<{}, {}, {}, AdminProgrammeFilters>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const filters: AdminProgrammeFilters = {
      page: parseInt(req.query.page as any) || 1,
      limit: parseInt(req.query.limit as any) || 20,
      search: req.query.search as string | undefined,
      universityId: req.query.universityId as string | undefined,
      type: req.query.type as any,
      deliveryMethod: req.query.deliveryMethod as any,
      openIntakeOnly: req.query.openIntakeOnly === true,
      minTuition: req.query.minTuition
        ? Number(req.query.minTuition)
        : undefined,
      maxTuition: req.query.maxTuition
        ? Number(req.query.maxTuition)
        : undefined,
      minApplicationFee: req.query.minApplicationFee
        ? Number(req.query.minApplicationFee)
        : undefined,
      maxApplicationFee: req.query.maxApplicationFee
        ? Number(req.query.maxApplicationFee)
        : undefined,
      published:
        req.query.published == null ? undefined : req.query.published === true,
    };
    const result = await listProgrammesAdmin(filters);
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};

export const getProgrammeByIdAdminController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const programme = await getProgrammeByIdForAdmin(req.params.id);
    res.status(StatusCodes.OK).json(programme);
  } catch (err) {
    next(err);
  }
};

/** POST /api/admin/programmes */
export const createProgrammeAdminController = async (
  req: Request<{}, {}, AdminCreateProgrammeDto>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const dto: AdminCreateProgrammeDto = {
      universityId: req.body.universityId,
      name: req.body.name,
      description: req.body.description,
      type: req.body.type as any,
      lengthBreakdown: req.body.lengthBreakdown,
      deliveryMethod: req.body.deliveryMethod as any,
      tuitionFee: req.body.tuitionFee ? Number(req.body.tuitionFee) : undefined,
      applicationFee: req.body.applicationFee
        ? Number(req.body.applicationFee)
        : undefined,
      otherFees: parseJsonField<string[]>(req.body.otherFees),
      published: req.body.published,
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
      metaKeywords: parseJsonField<string[]>(req.body.metaKeywords),
      intakes: parseJsonField(req.body.intakes),
      programRequirement: parseJsonField(req.body.programRequirement),
      modules: parseJsonField<string[]>(req.body.modules),
      services: parseJsonField<string[]>(req.body.services),
      imageFiles: files,
    };
    const created = await createProgrammeAdmin(dto);
    res.status(StatusCodes.CREATED).json(created);
  } catch (err) {
    next(err);
  }
};

export const updateProgrammeAdminController = async (
  req: Request<{ id: string }, {}, Partial<AdminUpdateProgrammeDto>>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const dto: Partial<AdminUpdateProgrammeDto> = {
      universityId: req.body.universityId,
      name: req.body.name,
      description: req.body.description,
      type: req.body.type as any,
      lengthBreakdown: req.body.lengthBreakdown,
      deliveryMethod: req.body.deliveryMethod as any,
      tuitionFee: req.body.tuitionFee ? Number(req.body.tuitionFee) : undefined,
      applicationFee: req.body.applicationFee
        ? Number(req.body.applicationFee)
        : undefined,
      otherFees: parseJsonField<string[]>(req.body.otherFees),
      published: req.body.published,
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
      metaKeywords: parseJsonField<string[]>(req.body.metaKeywords),
      intakes: parseJsonField(req.body.intakes),
      programRequirement: parseJsonField(req.body.programRequirement),
      modules: parseJsonField<string[]>(req.body.modules),
      services: parseJsonField<string[]>(req.body.services),
      imageFiles: files,
    };
    const updated = await updateProgrammeAdmin(req.params.id, dto);
    res.status(StatusCodes.OK).json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteProgrammeAdminController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteProgrammeAdmin(req.params.id);
    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (err) {
    next(err);
  }
};
