import UserModel, { IUser } from '../models/userModel';
import { NotFoundError, BadRequestError } from '../utils/appError';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

/**
 * Create a new user
 */
export const createUser = async (userData: Partial<IUser>): Promise<IUser> => {
  const { email } = userData;
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new BadRequestError('User already exists');
  }
  const user = await UserModel.create(userData);
  return user;
};

/**
 * Find a user by ID
 */
export const getUserById = async (userId: string): Promise<IUser> => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
};

/**
 * Find a user by email (For Authentication)
 */
export const getUserByEmail = async (email: string): Promise<IUser | null> => {
  return await UserModel.findOne({ email }).select('+password');
};

/**
 * Get all users
 */
export const getAllUsers = async (): Promise<IUser[]> => {
  return await UserModel.find();
};

/**
 * Update user details
 */
export const updateUser = async (
  userId: string,
  updateData: Partial<IUser>,
): Promise<IUser> => {
  const user = await UserModel.findByIdAndUpdate(userId, updateData, {
    new: true,
  });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
};

/**
 * Delete a user
 */
export const deleteUser = async (userId: string): Promise<void> => {
  const user = await UserModel.findByIdAndDelete(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
};

/**
 * Generate Access and Refresh Tokens for a user
 */
export const generateAuthTokens = async (user: IUser) => {
  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id, role: user.role });
  user.refreshToken = refreshToken;
  await user.save();
  return { accessToken, refreshToken };
};
