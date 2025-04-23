// src/controllers/programmeController.ts

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from '../utils/httpStatuses';
import {
  listProgrammesForAgent,
  getProgrammeByIdForAgent,
  AgentProgrammeFilters,
} from '../services/programmeService';

function parseNumberParam(v: any): number | undefined {
  if (v == null) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

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
      search: q.search,
      universityId: q.universityId,
      type: q.type as any,
      deliveryMethod: q.deliveryMethod as any,
      openIntakeOnly: String(q.openIntakeOnly) === 'true',
      minTuition: parseNumberParam(q.minTuition),
      maxTuition: parseNumberParam(q.maxTuition),
      minApplicationFee: parseNumberParam(q.minApplicationFee),
      maxApplicationFee: parseNumberParam(q.maxApplicationFee),
      page: parseNumberParam(q.page) ?? 1,
      limit: parseNumberParam(q.limit) ?? 20,
    };

    const result = await listProgrammesForAgent(filters);
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
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
