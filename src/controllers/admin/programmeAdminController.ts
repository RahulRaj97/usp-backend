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
import { IProgramIntake, IProgramRequirement } from '../../models/programmeModel';
import mongoose from 'mongoose';

function parseJsonField<T>(val: any): T | undefined {
  if (val == null) return undefined;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val) as T;
    } catch {}
  }
  return val as T;
}

function parseNumericField(value: any): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

function parseBooleanField(value: any): boolean {
  if (value === undefined || value === null || value === '') return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return Boolean(value);
}

// Helper function to convert ObjectId to string
function convertObjectIdToString(obj: any): any {
  if (obj instanceof mongoose.Types.ObjectId) {
    try {
      return obj.toString();
    } catch (error) {
      console.error('Error converting ObjectId to string:', error);
      return null;
    }
  }
  if (Array.isArray(obj)) {
    return obj.map(convertObjectIdToString);
  }
  if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = convertObjectIdToString(obj[key]);
    }
    return newObj;
  }
  return obj;
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
      country: req.query.country 
        ? (Array.isArray(req.query.country) 
            ? req.query.country 
            : [req.query.country]).map(c => String(c))
        : undefined,
      intakeDateFrom: req.query.intakeDateFrom 
        ? new Date(String(req.query.intakeDateFrom))
        : undefined,
      intakeDateTo: req.query.intakeDateTo
        ? new Date(String(req.query.intakeDateTo))
        : undefined,
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
    
    // Parse program requirements if present
    let programRequirement: IProgramRequirement | undefined;
    if (req.body.programRequirement) {
      const rawReq = parseJsonField<IProgramRequirement>(req.body.programRequirement);
      if (rawReq) {
        programRequirement = {
          englishScoreRequired: parseBooleanField(rawReq.englishScoreRequired),
          minGpa: parseNumericField(rawReq.minGpa),
          otherRequirements: Array.isArray(rawReq.otherRequirements) ? rawReq.otherRequirements : [],
          minToeflReading: parseNumericField(rawReq.minToeflReading),
          minToeflWriting: parseNumericField(rawReq.minToeflWriting),
          minToeflListening: parseNumericField(rawReq.minToeflListening),
          minToeflSpeaking: parseNumericField(rawReq.minToeflSpeaking),
          minToeflTotal: parseNumericField(rawReq.minToeflTotal),
          minIeltsReading: parseNumericField(rawReq.minIeltsReading),
          minIeltsWriting: parseNumericField(rawReq.minIeltsWriting),
          minIeltsListening: parseNumericField(rawReq.minIeltsListening),
          minIeltsSpeaking: parseNumericField(rawReq.minIeltsSpeaking),
          minIeltsAverage: parseNumericField(rawReq.minIeltsAverage),
          minIeltsAnyBand: rawReq.minIeltsAnyBand === null ? undefined : rawReq.minIeltsAnyBand,
          minIeltsAnyBandCount: rawReq.minIeltsAnyBandCount === null ? undefined : rawReq.minIeltsAnyBandCount,
          minDuolingoScore: parseNumericField(rawReq.minDuolingoScore),
          minDuolingoLiteracyScore: parseNumericField(rawReq.minDuolingoLiteracyScore),
          minDuolingoConversationScore: parseNumericField(rawReq.minDuolingoConversationScore),
          minDuolingoComprehensionScore: parseNumericField(rawReq.minDuolingoComprehensionScore),
          minDuolingoProductionScore: parseNumericField(rawReq.minDuolingoProductionScore),
          minPteListening: parseNumericField(rawReq.minPteListening),
          minPteReading: parseNumericField(rawReq.minPteReading),
          minPteSpeaking: parseNumericField(rawReq.minPteSpeaking),
          minPteWriting: parseNumericField(rawReq.minPteWriting),
          minPteOverall: parseNumericField(rawReq.minPteOverall),
          greRequirements: rawReq.greRequirements ? {
            minVerbal: parseNumericField(rawReq.greRequirements.minVerbal),
            minQuantitative: parseNumericField(rawReq.greRequirements.minQuantitative),
            minWriting: parseNumericField(rawReq.greRequirements.minWriting),
            minTotal: parseNumericField(rawReq.greRequirements.minTotal)
          } : undefined
        };
      }
    }

    const dto: Partial<AdminUpdateProgrammeDto> = {
      universityId: req.body.universityId,
      name: req.body.name,
      description: req.body.description,
      type: req.body.type as any,
      lengthBreakdown: req.body.lengthBreakdown,
      deliveryMethod: req.body.deliveryMethod as any,
      tuitionFee: parseNumericField(req.body.tuitionFee),
      applicationFee: parseNumericField(req.body.applicationFee),
      otherFees: parseJsonField<string[]>(req.body.otherFees),
      published: parseBooleanField(req.body.published),
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
      metaKeywords: parseJsonField<string[]>(req.body.metaKeywords),
      intakes: parseJsonField<IProgramIntake[]>(req.body.intakes)?.map(intake => ({
        ...intake,
        openDate: intake.openDate ? new Date(intake.openDate) : undefined,
        submissionDeadline: intake.submissionDeadline ? new Date(intake.submissionDeadline) : undefined,
        available: parseBooleanField(intake.available),
        acceptingNewApps: parseBooleanField(intake.acceptingNewApps),
        status: intake.status || 'likely_open',
        openTime: intake.openTime,
        deadlineTime: intake.deadlineTime
      })),
      programRequirement,
      modules: parseJsonField<string[]>(req.body.modules),
      services: parseJsonField<string[]>(req.body.services),
      imageFiles: files,
    };

    // Handle image operations
    if (req.body.imageOperations) {
      try {
        const imageOperations = parseJsonField<{
          remove?: string[];
          reorder?: string[];
        }>(req.body.imageOperations);

        if (imageOperations) {
          dto.imageOperations = imageOperations;
        }
      } catch (error) {
        console.error('Error parsing imageOperations:', error);
        throw new Error('Invalid imageOperations format');
      }
    }

    // Handle array operations
    if (req.body.arrayOperations) {
      try {
        const arrayOperations = parseJsonField<{
          otherFees?: { remove?: string[]; add?: string[] };
          metaKeywords?: { remove?: string[]; add?: string[] };
          modules?: { remove?: string[]; add?: string[] };
          services?: { remove?: string[]; add?: string[] };
        }>(req.body.arrayOperations);

        if (arrayOperations) {
          dto.arrayOperations = arrayOperations;
        }
      } catch (error) {
        console.error('Error parsing arrayOperations:', error);
        throw new Error('Invalid arrayOperations format');
      }
    }

    // Handle intake operations
    if (req.body.intakeOperations) {
      try {
        const intakeOperations = parseJsonField<{
          remove?: number[];
          update?: Array<{
            index: number;
            updates: Partial<IProgramIntake>;
          }>;
          add?: IProgramIntake[];
        }>(req.body.intakeOperations);

        if (intakeOperations) {
          // Convert dates in updates and add operations
          if (intakeOperations.update) {
            intakeOperations.update = intakeOperations.update.map(op => ({
              ...op,
              updates: {
                ...op.updates,
                openDate: op.updates.openDate ? new Date(op.updates.openDate) : undefined,
                submissionDeadline: op.updates.submissionDeadline ? new Date(op.updates.submissionDeadline) : undefined
              }
            }));
          }
          if (intakeOperations.add) {
            intakeOperations.add = intakeOperations.add.map(intake => ({
              ...intake,
              openDate: intake.openDate ? new Date(intake.openDate) : undefined,
              submissionDeadline: intake.submissionDeadline ? new Date(intake.submissionDeadline) : undefined
            }));
          }
          dto.intakeOperations = intakeOperations;
        }
      } catch (error) {
        console.error('Error parsing intakeOperations:', error);
        throw new Error('Invalid intakeOperations format');
      }
    }

    const updated = await updateProgrammeAdmin(req.params.id, dto);
    const serializedResponse = convertObjectIdToString(updated);
    res.status(StatusCodes.OK).json(serializedResponse);
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
