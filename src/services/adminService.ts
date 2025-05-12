// File: src/services/adminService.ts
// =====================================================================
import mongoose from 'mongoose';
import AdminModel, { IAdmin } from '../models/adminModel';
import userModel from '../models/userModel';
import { NotFoundError, BadRequestError } from '../utils/appError';

interface CreateAdminInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profileImage?: string;
  address?: object;
}

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

export interface AdminFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export async function listAdmins(filters: AdminFilters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const skip = (page - 1) * limit;

  const query: any = {};

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, 'i');
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex }
    ];
  }

  const [admins, total] = await Promise.all([
    AdminModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('user', 'email profileImage'),
    AdminModel.countDocuments(query)
  ]);

  return {
    admins,
    totalPages: Math.ceil(total / limit),
    currentPage: page
  };
}

export const createAdmin = async (data: CreateAdminInput): Promise<IAdmin> => {
  const { email, password, firstName, lastName, phone, profileImage, address } =
    data;
  if (await userModel.findOne({ email }))
    throw new BadRequestError('Email already in use');
  const user = await userModel.create({
    email,
    password,
    role: 'admin',
    profileImage,
    address,
  });
  await AdminModel.create({
    user: user._id,
    firstName,
    lastName,
    phone,
  });
  // now fetch & return with your automatic populate hook
  const admin = await AdminModel.findOne({ user: user._id }).lean();
  return admin as any; // or keep as IAdmin
};

interface UpdateAdminInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: string;
  address?: object;
  password?: string;
}

export const updateAdmin = async (
  adminId: string,
  data: UpdateAdminInput,
): Promise<IAdmin> => {
  const admin = await AdminModel.findById(adminId);
  if (!admin) throw new NotFoundError('Admin not found');

  if (data.firstName !== undefined) admin.firstName = data.firstName;
  if (data.lastName !== undefined) admin.lastName = data.lastName;
  if (data.phone !== undefined) admin.phone = data.phone;
  await admin.save();

  const userUpdates: any = {};
  if (data.profileImage) userUpdates.profileImage = data.profileImage;
  if (data.address) userUpdates.address = data.address;
  if (data.password) userUpdates.password = data.password;

  if (Object.keys(userUpdates).length) {
    await userModel.findByIdAndUpdate(admin.user, userUpdates);
  }

  const updatedAdmin = await AdminModel.findById(adminId).lean();
  if (!updatedAdmin) throw new NotFoundError('Admin not found');
  return updatedAdmin;
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
