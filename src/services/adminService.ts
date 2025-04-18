// File: src/services/adminService.ts
// =====================================================================
import mongoose from 'mongoose';
import AdminModel, { IAdmin } from '../models/adminModel';
import UserModel from '../models/userModel';
import { NotFoundError, BadRequestError } from '../utils/appError';

/**
 * Get an Admin record by its own ID
 */
export const getAdminById = async (id: string): Promise<IAdmin> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Invalid admin ID');
  }
  const admin = await AdminModel.findById(id).lean();
  if (!admin) throw new NotFoundError('Admin not found');
  return admin;
};

/**
 * Get an Admin record by the linked User ID
 */
export const getAdminByUserId = async (userId: string): Promise<IAdmin> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequestError('Invalid user ID');
  }
  const admin = await AdminModel.findOne({ user: userId }).lean();
  if (!admin) throw new NotFoundError('Admin not found');
  return admin;
};

/**
 * List Admins with optional pagination
 */
export const listAdmins = async (
  page = 1,
  limit = 10,
): Promise<{ admins: IAdmin[]; totalPages: number; currentPage: number }> => {
  const skip = (page - 1) * limit;
  const [admins, total] = await Promise.all([
    AdminModel.find().lean().skip(skip).limit(limit),
    AdminModel.countDocuments(),
  ]);
  return {
    admins,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
};

/**
 * Create a new Admin for an existing User ID
 */
export const createAdmin = async (userId: string): Promise<IAdmin> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new BadRequestError('Invalid user ID');
  }
  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundError('User not found');
  if (user.role !== 'admin') {
    throw new BadRequestError('User is not in admin role');
  }
  const existing = await AdminModel.findOne({ user: userId });
  if (existing) throw new BadRequestError('Admin already exists for this user');
  const admin = await AdminModel.create({ user: userId });
  return admin.toObject() as IAdmin;
};

/**
 * Update an existing Admin record
 */
export const updateAdmin = async (
  id: string,
  data: Partial<IAdmin>,
): Promise<IAdmin> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Invalid admin ID');
  }
  const updated = await AdminModel.findByIdAndUpdate(id, data, {
    new: true,
  }).lean();
  if (!updated) throw new NotFoundError('Admin not found');
  return updated;
};

/**
 * Delete an Admin record
 */
export const deleteAdmin = async (id: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Invalid admin ID');
  }
  const result = await AdminModel.findByIdAndDelete(id);
  if (!result) throw new NotFoundError('Admin not found');
};
