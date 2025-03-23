// src/services/companyService.ts
import companyModel, { ICompany } from '../models/companyModel';
import { NotFoundError } from '../utils/appError';
import { uploadFileBufferToS3 } from './s3UploadHelpter';

export const createComapny = async (
  companyData: ICompany,
): Promise<ICompany> => {
  return await companyModel.create(companyData);
};

export const getCompanyById = async (companyId: string) => {
  const company = await companyModel.findById(companyId);
  if (!company) throw new NotFoundError('Company not found');
  return company;
};

export const getAllCompanies = async () => {
  return await companyModel.find();
};

export const updateCompany = async (
  companyId: string,
  companyData: Partial<ICompany>,
  logoFile?: Express.Multer.File,
) => {
  if (logoFile) {
    const logoUrl = await uploadFileBufferToS3(
      logoFile.buffer,
      logoFile.originalname,
      'companies',
      companyId,
      logoFile.mimetype,
    );
    companyData.logo = logoUrl;
  }

  const company = await companyModel.findByIdAndUpdate(companyId, companyData, {
    new: true,
  });

  if (!company) throw new NotFoundError('Company not found');
  return company;
};
