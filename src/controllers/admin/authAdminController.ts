// =====================================================================
// File: src/controllers/admin/authAdminController.ts
// =====================================================================
import { Request, Response, NextFunction } from 'express';
import UserModel from '../../models/userModel';
import argon2 from 'argon2';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt';
import { StatusCodes } from '../../utils/httpStatuses';
import { UnauthorizedError } from '../../utils/appError';

interface LoginRequestBody {
  email: string;
  password: string;
}

/**
 * POST /admin/login
 * Admin login: returns access & refresh tokens, user profile
 */
export const adminLogin = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid || user.role !== 'admin') {
      throw new UnauthorizedError('Invalid email or password');
    }
    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, role: user.role });
    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(StatusCodes.OK).json({
      message: 'Login successful',
      token: accessToken,
      user: {
        _id: user.id,
        email: user.email,
        role: user.role,
        name: `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim(),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /admin/logout
 * Admin logout: clears refresh token
 */
export const adminLogout = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Clear cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.status(StatusCodes.OK).json({ message: 'Logout successful' });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /admin/profile
 * Returns current admin profile
 */
export const adminProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedError();
    const user = await UserModel.findById(userId);
    if (!user || user.role !== 'admin') throw new UnauthorizedError();
    res.status(StatusCodes.OK).json({
      _id: user.id,
      email: user.email,
      role: user.role,
      name: `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim(),
    });
  } catch (err) {
    next(err);
  }
};
