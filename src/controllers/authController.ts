import { Request, Response, NextFunction } from 'express';

import UserModel from '../models/userModel';
import { generateAuthTokens } from '../services/userService';

import { verifyRefreshToken } from '../utils/jwt';
import { StatusCodes } from '../utils/httpStatuses';
import { UnauthorizedError } from '../utils/appError';
import { getAgentByUserId } from '../services/agentService';

/**
 * User Login (Returns Access Token, Role & User Details)
 */
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const { accessToken, refreshToken } = await generateAuthTokens(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
    });

    let userResponse = {};

    if (user.role === 'agent') {
      const agent = await getAgentByUserId(user.id);
      if (agent) userResponse = agent;
    }

    res.status(StatusCodes.OK).json({
      accessToken,
      userProfile: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh Token (Generate New Access Token)
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) throw new UnauthorizedError('Refresh token missing');
    const decoded = verifyRefreshToken(token);
    if (!decoded)
      throw new UnauthorizedError('Invalid or expired refresh token');
    const user = await UserModel.findById(decoded.id);
    if (!user || user.refreshToken !== token) {
      throw new UnauthorizedError('Refresh token not recognized');
    }
    const { accessToken } = await generateAuthTokens(user);
    res.status(StatusCodes.OK).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout User (Invalidate Refresh Token)
 */
export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await UserModel.findById(req.user?.id);
    if (user) {
      user.refreshToken = '';
      await user.save();
    }
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};
