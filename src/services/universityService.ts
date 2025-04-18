// src/services/universityService.ts
import universityModel, { IUniversity } from '../models/universityModel';
import { uploadFileBufferToS3 } from './s3UploadHelpter';
import { NotFoundError } from '../utils/appError';

export const createUniversity = async (
  data: any,
  logoFile?: Express.Multer.File,
): Promise<IUniversity> => {
  let logoUrl: string | undefined;

  const university = await universityModel.create({
    name: data.name,
    website: data.website,
    contactEmail: data.contactEmail,
    phone: data.phone,
    address: data.address,
    description: data.description,
  });

  if (logoFile) {
    logoUrl = await uploadFileBufferToS3(
      logoFile.buffer,
      logoFile.originalname,
      'universities',
      university.id,
      logoFile.mimetype,
    );
    university.logo = logoUrl;
    await university.save();
  }

  return university;
};

export const getAllUniversities = async (): Promise<IUniversity[]> => {
  return await universityModel.find();
};

export const getUniversityById = async (
  id: string,
): Promise<IUniversity | null> => {
  return await universityModel.findById(id);
};

export const updateUniversity = async (
  id: string,
  data: any,
  logoFile?: Express.Multer.File,
): Promise<IUniversity | null> => {
  const updateData = { ...data };

  if (logoFile) {
    const logoUrl = await uploadFileBufferToS3(
      logoFile.buffer,
      logoFile.originalname,
      'universities',
      id,
      logoFile.mimetype,
    );
    updateData.logo = logoUrl;
  }

  return await universityModel.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteUniversity = async (id: string): Promise<void> => {
  await universityModel.findByIdAndDelete(id);
};

// =====================================================================
// 1. Extend src/services/universityService.ts with admin wrappers
// =====================================================================

/**
 * Filters and pagination for admin listing
 */
export interface AdminUniversityFilters {
  name?: string;
  country?: string;
  page?: number;
  limit?: number;
}

/** Admin: list universities with optional name/country filters */
export const listUniversitiesAdmin = async (
  filters: AdminUniversityFilters = {},
) => {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 10;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (filters.name) {
    query.name = new RegExp(filters.name, 'i');
  }
  if (filters.country) {
    query['address.country'] = new RegExp(`^${filters.country}$`, 'i');
  }

  const [items, total] = await Promise.all([
    universityModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
    universityModel.countDocuments(query),
  ]);

  return {
    universities: items,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
};

/** Admin: get one university by ID */
export const adminGetUniversityById = async (
  id: string,
): Promise<IUniversity> => {
  const uni = await universityModel.findById(id);
  if (!uni) throw new NotFoundError('University not found');
  return uni;
};

/** Admin: create university (reuse existing createUniversity logic) */
export const adminCreateUniversity = async (
  data: any,
  logoFile?: Express.Multer.File,
): Promise<IUniversity> => {
  // import and call the existing createUniversity
  const createUniversity = require('./universityService').createUniversity;
  return await createUniversity(data, logoFile);
};

/** Admin: update university */
export const adminUpdateUniversity = async (
  id: string,
  data: any,
  logoFile?: Express.Multer.File,
): Promise<IUniversity> => {
  const updateUniversity = require('./universityService').updateUniversity;
  const updated = await updateUniversity(id, data, logoFile);
  if (!updated) throw new NotFoundError('University not found');
  return updated;
};

/** Admin: delete university */
export const adminDeleteUniversity = async (id: string): Promise<void> => {
  const result = await universityModel.findByIdAndDelete(id);
  if (!result) throw new NotFoundError('University not found');
};
