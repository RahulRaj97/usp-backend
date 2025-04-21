import { Request, Response, NextFunction } from 'express';
import {
  listCompaniesAdmin as listCompaniesAdminService,
  createCompany,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from '../../services/companyService';
import { StatusCodes } from '../../utils/httpStatuses';

export const listCompaniesAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      name,
      country,
      page = '1',
      limit = '10',
    } = req.query as Record<string, string>;

    const result = await listCompaniesAdminService({
      name,
      country,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};

export const getCompanyAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const company = await getCompanyById(req.params.id);
    res.status(StatusCodes.OK).json(company);
  } catch (err) {
    next(err);
  }
};

export const createCompanyAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const logoFile = (req.file as Express.Multer.File) || undefined;
    const newCompany = await createCompany({
      ...req.body,
      logo: logoFile?.path || req.body.logo,
    });
    res.status(StatusCodes.CREATED).json(newCompany);
  } catch (err) {
    next(err);
  }
};

export const updateCompanyAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const logoFile = (req.file as Express.Multer.File) || undefined;
    const documentFiles =
      (req.files as Record<string, Express.Multer.File[]>)?.documents || [];
    const updated = await updateCompany(
      req.params.id,
      req.body,
      logoFile,
      documentFiles,
    );
    res.status(StatusCodes.OK).json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteCompanyAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await deleteCompany(req.params.id);
    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (err) {
    next(err);
  }
};
