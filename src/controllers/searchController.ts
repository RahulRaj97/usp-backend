import { Request, Response, NextFunction } from 'express';
import { searchAll } from '../services/searchService';

export const searchAllController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const keyword = (req.query.keyword as string) || '';
    const results = await searchAll(keyword, req.user);
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};
