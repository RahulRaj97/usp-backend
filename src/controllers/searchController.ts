import { Request, Response, NextFunction } from 'express';
import { searchAll, searchAllAdmin } from '../services/searchService';

export const searchAllController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const keyword = String(req.query.keyword || '');
    if (req.user?.role === 'admin') {
      const results = await searchAllAdmin(keyword);
      res.status(200).json(results);
    }
    const results = await searchAll(keyword, req.user);
    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
};
