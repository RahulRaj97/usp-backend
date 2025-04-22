import { Request, Response, NextFunction } from 'express';

import UserModel from '../models/userModel';
import { generateAuthTokens } from '../services/userService';

import { verifyRefreshToken } from '../utils/jwt';
import { StatusCodes } from '../utils/httpStatuses';
import { UnauthorizedError } from '../utils/appError';
import { getAgentByUserId } from '../services/agentService';
import { getAdminByUserId } from '../services/adminService';

/**
 * User/Admin Login
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
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // agent / user login response
    let userProfile: any = {};

    if (user.role === 'admin') {
      // admin login response
      const adminProfile = await getAdminByUserId(user.id);
      if (adminProfile) {
        userProfile = adminProfile;
      }
    }
    if (user.role === 'agent') {
      const agent = await getAgentByUserId(user.id);
      if (agent) userProfile = agent;
    }

    res.status(StatusCodes.OK).json({
      accessToken,
      userProfile,
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
    const { accessToken, refreshToken: newRefresh } =
      await generateAuthTokens(user);
    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(StatusCodes.OK).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout User/Admin
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
      sameSite: 'strict',
    });

    const isAdminRoute = req.baseUrl.includes('/admin');
    const message = isAdminRoute
      ? 'Logout successful'
      : 'Logged out successfully';

    res.status(StatusCodes.OK).json({ message });
  } catch (error) {
    next(error);
  }
};
