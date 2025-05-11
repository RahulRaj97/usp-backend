// src/controllers/programmeController.ts

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from '../utils/httpStatuses';
import {
  listProgrammesForAgent,
  getProgrammeByIdForAgent,
  AgentProgrammeFilters,
} from '../services/programmeService';
import { DeliveryMethod, IProgramIntake } from 'models/programmeModel';
import { ProgrammeType } from 'models/programmeModel';

const parseNumberParam = (param: any): number | undefined => {
  if (param == null) return undefined;
  const num = Number(param);
  return isNaN(num) ? undefined : num;
};

/**
 * GET /programmes
 * Query params → AgentProgrammeFilters
 */
export const listProgrammesForAgentController = async (
  req: Request<{}, {}, {}, Partial<AgentProgrammeFilters>>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const q = req.query;
    const filters: AgentProgrammeFilters = {
      search: q.search as string | undefined,
      universityId: q.universityId as string | undefined,
      type: Array.isArray(q.type) ? q.type as ProgrammeType[] : q.type ? [q.type as ProgrammeType] : undefined,
      deliveryMethod: Array.isArray(q.deliveryMethod) ? q.deliveryMethod as DeliveryMethod[] : q.deliveryMethod ? [q.deliveryMethod as DeliveryMethod] : undefined,
      location: Array.isArray(q.location) ? q.location as string[] : q.location ? [q.location as string] : undefined,
      intakeStatus: Array.isArray(q.intakeStatus) ? q.intakeStatus as IProgramIntake['status'][] : q.intakeStatus ? [q.intakeStatus as IProgramIntake['status']] : undefined,
      intakeDateFrom: q.intakeDateFrom ? new Date(q.intakeDateFrom as unknown as string) : undefined,
      intakeDateTo: q.intakeDateTo ? new Date(q.intakeDateTo as unknown as string) : undefined,
      minTuition: parseNumberParam(q.minTuition),
      maxTuition: parseNumberParam(q.maxTuition),
      minApplicationFee: parseNumberParam(q.minApplicationFee),
      maxApplicationFee: parseNumberParam(q.maxApplicationFee),
      openIntakeOnly: q.openIntakeOnly ? String(q.openIntakeOnly).toLowerCase() === 'true' : undefined,
      page: parseNumberParam(q.page) ?? 1,
      limit: parseNumberParam(q.limit) ?? 20,
    };

    const result = await listProgrammesForAgent(filters);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /programmes/:id
 */
export const getProgrammeByIdForAgentController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const programme = await getProgrammeByIdForAgent(req.params.id);
    res.status(StatusCodes.OK).json(programme);
  } catch (err) {
    next(err);
  }
};
