import { Request, Response, NextFunction } from 'express';
import {
  deleteAgent,
  updateAgent,
  getAllAgents,
  getAgentById,
  verifyAgentOTP,
  createSubAgent,
  getAgentByUserId,
  toggleAgentStatus,
  sendOTPAndRegisterAgent,
} from '../services/agentService';
import { StatusCodes } from '../utils/httpStatuses';
import { UnauthorizedError } from '../utils/appError';

export const registerAgentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agentId = await sendOTPAndRegisterAgent(req.body);
    res.status(StatusCodes.CREATED).json({ agentId });
  } catch (error) {
    next(error);
  }
};

export const verifyOTPController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;
    const success = await verifyAgentOTP(email, otp);
    res.status(StatusCodes.OK).json({ success });
  } catch (error) {
    next(error);
  }
};

export const createAgentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newAgentData = req.body;
    const loggedUserId = req.user?.id || '';
    const { level, _id: parentAgentId } = await getAgentByUserId(loggedUserId);
    if (level === 'admission' || level === 'counsellor')
      throw new UnauthorizedError('You are not allowed to create Users');
    if (
      level === 'manager' &&
      newAgentData.level !== 'admission' &&
      newAgentData.level !== 'counsellor'
    )
      throw new UnauthorizedError(
        'Manager can only create Admission or Counsellor',
      );
    const newAgent = await createSubAgent(`${parentAgentId}`, newAgentData);
    res.status(StatusCodes.CREATED).json(newAgent);
  } catch (error) {
    next(error);
  }
};

export const getAllAgentsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page = 1, limit = 10, companyId } = req.query;
    const userId = req.user?.id || '';
    const loggedInAgent = await getAgentByUserId(userId);
    const paginatedResponse = await getAllAgents(
      loggedInAgent.level,
      `${loggedInAgent._id}`,
      companyId ? String(companyId) : String(loggedInAgent.companyId || ''),
      Number(page),
      Number(limit),
    );
    res.status(StatusCodes.OK).json(paginatedResponse);
  } catch (error) {
    next(error);
  }
};

export const getAgentByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const agent = await getAgentById(req.params.id);
    res.status(StatusCodes.OK).json(agent);
  } catch (error) {
    next(error);
  }
};

export const toggleAgentStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await toggleAgentStatus(id);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateAgentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const file = req.file as any;
    if (file?.location) {
      req.body.profileImage = file.location;
    }
    const updatedAgent = await updateAgent(req.params.id, req.body);
    res.status(StatusCodes.OK).json(updatedAgent);
  } catch (error) {
    next(error);
  }
};

export const deleteAgentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteAgent(req.params.id);
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
};
