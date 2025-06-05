import UserModel, { IUser } from '../models/userModel';
import { NotFoundError, BadRequestError } from '../utils/appError';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';

export const createUser = async (userData: Partial<IUser>): Promise<IUser> => {
  const { email } = userData;
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new BadRequestError('User already exists');
  }
  return await UserModel.create(userData);
};

export const getUserById = async (userId: string): Promise<IUser> => {
  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundError('User not found');
  return user;
};

export const getUserByEmail = async (email: string): Promise<IUser | null> => {
  return await UserModel.findOne({ email }).select('+password');
};

export const getAllUsers = async (): Promise<IUser[]> => {
  return await UserModel.find();
};

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

export const deleteUser = async (userId: string): Promise<void> => {
  const user = await UserModel.findByIdAndDelete(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
};

export const generateAuthTokens = async (user: IUser) => {
  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id, role: user.role });
  await UserModel.findByIdAndUpdate(user.id, { refreshToken });
  return { accessToken, refreshToken };
};

export const getSuperAdmins = async (): Promise<IUser[]> => {
  const superAdmins = await UserModel.find({ role: 'super_admin' });
  return superAdmins;
};
