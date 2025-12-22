import express from 'express';
import { getChats, getChat, sendMessage } from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const chatRouter = express.Router();

chatRouter.get('/', protect, getChats);
chatRouter.get('/:id', protect, getChat);
chatRouter.post('/:id/message', protect, sendMessage);

export { chatRouter as default };