import { Request, Response, NextFunction } from 'express';
import {
  markAsRead,
  markAllAsRead,
  getNotificationsForUser,
} from '../services/notificationService';
import { StatusCodes } from '../utils/httpStatuses';

export const listNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const result = await getNotificationsForUser(req.user!.id, page, limit);
    res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const notif = await markAsRead(req.params.id, req.user!.id);
    if (!notif) res.status(404).json({ message: 'Not found' });
    res.status(StatusCodes.OK).json(notif);
  } catch (err) {
    next(err);
  }
};

export const markAllNotificationsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await markAllAsRead(req.user!.id);
    res.status(StatusCodes.OK).json({ message: 'All marked as read' });
  } catch (err) {
    next(err);
  }
};
