// src/controllers/companyController.ts
import { Request, Response, NextFunction } from 'express';
import {
  getCompanyById,
  getAllCompanies,
  updateCompany,
} from '../services/companyService';
import { StatusCodes } from '../utils/httpStatuses';
import { getAgentByUserId } from '../services/agentService';
import { UnauthorizedError } from '../utils/appError';

export const getAllCompaniesController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (_req.user?.role !== 'admin') {
      throw new UnauthorizedError('Only admin can view all companies');
    }
    const companies = await getAllCompanies();
    res.status(StatusCodes.OK).json(companies);
  } catch (error) {
    next(error);
  }
};

export const getCompanyByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const companyId = req.params.id;
    const user = req.user;
    if (!user) throw new UnauthorizedError();
    if (user.role === 'admin') {
    } else if (user.role === 'agent') {
      const agent = await getAgentByUserId(user.id);
      if (agent.level !== 'owner' || String(agent.companyId) !== companyId) {
        throw new UnauthorizedError('Not allowed to access this company');
      }
    } else {
      throw new UnauthorizedError();
    }
    const company = await getCompanyById(companyId);
    res.status(StatusCodes.OK).json(company);
  } catch (error) {
    next(error);
  }
};

export const updateCompanyController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: companyId } = req.params;
    const updateData = req.body;
    const logoFile = req.file;

    const user = req.user;
    if (!user) throw new UnauthorizedError();

    if (user.role === 'admin') {
      // allowed
    } else if (user.role === 'agent') {
      const agent = await getAgentByUserId(user.id);
      if (agent.level !== 'owner' || String(agent.companyId) !== companyId) {
        throw new UnauthorizedError('Not allowed to update this company');
      }
    } else {
      throw new UnauthorizedError();
    }

    const updatedCompany = await updateCompany(companyId, updateData, logoFile);
    res.status(StatusCodes.OK).json(updatedCompany);
  } catch (error) {
    next(error);
  }
};
