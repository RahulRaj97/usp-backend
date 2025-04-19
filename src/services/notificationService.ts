import NotificationModel, { INotification } from '../models/notificationModel';
import { getIo } from '../socket';

export const createNotification = async (opts: {
  recipientId: string;
  actorId?: string;
  type?: INotification['type'];
  title: string;
  message: string;
  data?: Record<string, any>;
}): Promise<INotification> => {
  const notif = await NotificationModel.create({
    recipient: opts.recipientId,
    actor: opts.actorId,
    type: opts.type ?? 'info',
    title: opts.title,
    message: opts.message,
    data: opts.data,
  });

  // Real‑time push
  try {
    getIo().to(`user:${opts.recipientId}`).emit('notification', notif);
  } catch (_) {
    /* no‑op if socket not ready */
  }

  return notif;
};

export const getNotificationsForUser = async (
  userId: string,
  page = 1,
  limit = 20,
) => {
  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    NotificationModel.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    NotificationModel.countDocuments({ recipient: userId }),
  ]);
  return {
    notifications,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
};

export const markAsRead = async (notifId: string, userId: string) => {
  return NotificationModel.findOneAndUpdate(
    { _id: notifId, recipient: userId },
    { isRead: true },
    { new: true },
  ).lean();
};

export const markAllAsRead = async (userId: string) => {
  await NotificationModel.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true },
  );
};
