// File: src/services/adminService.ts
// =====================================================================
import mongoose from 'mongoose';
import AdminModel, { IAdmin } from '../models/adminModel';
import { IUser } from '../models/userModel';
import { NotFoundError, BadRequestError } from '../utils/appError';
import { createUser, updateUser } from './userService';

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

export const createAdmin = async (data: {
  email: string;
  password: string;
  profileImage?: string;
  address?: IUser['address'];
}): Promise<IAdmin> => {
  // 1) Create the User with role='admin'
  const user = await createUser({ ...data, role: 'admin' });
  // 2) Create the Admin document
  const admin = await AdminModel.create({ user: user._id });
  // 3) Return the fully populated Admin
  return (await AdminModel.findById(admin._id).lean()) as IAdmin;
};

/**
 * Update an existing Admin + underlying User
 */
export const updateAdmin = async (
  adminId: string,
  data: {
    password?: string;
    profileImage?: string;
    address?: IUser['address'];
  },
): Promise<IAdmin> => {
  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new BadRequestError('Invalid admin ID');
  }
  const admin = await AdminModel.findById(adminId);
  if (!admin) throw new NotFoundError('Admin not found');

  // Build partial user update payload
  const userUpdates: Partial<IUser> = {};
  if (data.password) userUpdates.password = data.password;
  if (data.profileImage) userUpdates.profileImage = data.profileImage;
  if (data.address) userUpdates.address = data.address;

  // Apply to User
  if (Object.keys(userUpdates).length > 0) {
    await updateUser(admin.user.toString(), userUpdates);
  }

  // No extra AdminModel fields to change currently
  return (await AdminModel.findById(adminId).lean()) as IAdmin;
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
