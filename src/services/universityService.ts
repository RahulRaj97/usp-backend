// src/services/universityService.ts
import universityModel, { IUniversity } from '../models/universityModel';
import { uploadFileBufferToS3 } from './s3UploadHelpter';

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
