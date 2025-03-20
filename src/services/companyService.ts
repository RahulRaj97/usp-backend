import companyModel, { ICompany } from 'models/companyModel';
import { NotFoundError } from '../utils/appError';

export const createComapny = async (
  companyData: ICompany,
): Promise<ICompany> => {
  const company = await companyModel.create(companyData);
  return company;
};

export const getCompanyById = async (companyId: string) => {
  const company = await companyModel.findById(companyId);
  if (!company) throw new NotFoundError('Company not found');
  return company;
};

export const updateCompany = async (
  companyId: string,
  companyData: Partial<ICompany>,
) => {
  const company = await companyModel.findByIdAndUpdate(companyId, companyData, {
    new: true,
  });
  if (!company) throw new NotFoundError('Company not found');
  return company;
};
