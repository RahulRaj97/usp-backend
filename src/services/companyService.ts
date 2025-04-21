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
  documentFiles?: Express.Multer.File[],
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

  if (documentFiles && documentFiles.length > 0) {
    const documentUrls = [];
    for (const file of documentFiles) {
      const documentUrl = await uploadFileBufferToS3(
        file.buffer,
        file.originalname,
        'company-documents',
        companyId,
        file.mimetype,
      );
      documentUrls.push(documentUrl);
    }

    if (companyData.documents && Array.isArray(companyData.documents)) {
      companyData.documents = companyData.documents.concat(documentUrls);
    } else {
      companyData.documents = documentUrls;
    }
  }

  const company = await companyModel.findByIdAndUpdate(companyId, companyData, {
    new: true,
  });

  if (!company) throw new NotFoundError('Company not found');
  return company;
};

export interface CompanyFilters {
  name?: string;
  country?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedCompanies {
  companies: ICompany[];
  totalPages: number;
  currentPage: number;
}

/**
 * Admin: list companies with optional filters, pagination & sorting
 */
export const listCompaniesAdmin = async (
  filters: CompanyFilters,
): Promise<PaginatedCompanies> => {
  const query: any = {};
  if (filters.name) {
    query.name = new RegExp(filters.name, 'i');
  }
  if (filters.country) {
    query['address.country'] = new RegExp(`^${filters.country}$`, 'i');
  }

  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
  const skip = (page - 1) * limit;

  const [companies, total] = await Promise.all([
    companyModel.find(query).skip(skip).limit(limit).lean(),
    companyModel.countDocuments(query),
  ]);

  return {
    companies,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
};

/**
 * Admin: create a new company
 */
export const createCompany = async (
  data: Partial<ICompany>,
): Promise<ICompany> => {
  return await companyModel.create(data);
};

/**
 * Admin: delete an existing company
 */
export const deleteCompany = async (id: string): Promise<void> => {
  const deleted = await companyModel.findByIdAndDelete(id);
  if (!deleted) throw new NotFoundError('Company not found');
};
