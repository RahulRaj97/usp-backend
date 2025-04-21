import { Request, Response, NextFunction } from 'express';
import {
  listCompaniesAdmin as listCompaniesAdminService,
  createCompany,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from '../../services/companyService';
import { StatusCodes } from '../../utils/httpStatuses';

function parseJSONField<T>(maybeJson: any): T | undefined {
  if (!maybeJson) return undefined;
  if (typeof maybeJson === 'string') {
    try {
      return JSON.parse(maybeJson) as T;
    } catch {}
  }
  return maybeJson;
}

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
    const body: any = { ...req.body };
    const logoFile = (req.file as Express.Multer.File) || undefined;
    body.address = parseJSONField(body.address);
    const newCompany = await createCompany({
      ...body,
      logo: logoFile?.path ?? body.logo,
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
    const body: any = { ...req.body };
    const logoFile = (req.file as Express.Multer.File) || undefined;
    const documentFiles =
      (req.files as Record<string, Express.Multer.File[]>)?.documents || [];
    // parse JSON fields
    body.address = parseJSONField(body.address);
    // now call your existing updateCompany
    const updated = await updateCompany(
      req.params.id,
      body,
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
