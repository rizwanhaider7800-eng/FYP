import express from 'express';
import { getNotifications, markAsRead, deleteNotification } from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const notifRouter = express.Router();

notifRouter.get('/', protect, getNotifications);
notifRouter.put('/:id/read', protect, markAsRead);
notifRouter.delete('/:id', protect, deleteNotification);

export { notifRouter as default };