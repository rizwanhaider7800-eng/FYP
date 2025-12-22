import express from 'express';
import { createBidRequest, getBids, submitBid, awardBid } from '../controllers/bid.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const bidRouter = express.Router();

bidRouter.post('/', protect, createBidRequest);
bidRouter.get('/', protect, getBids);
bidRouter.post('/:id/submit', protect, authorize('supplier', 'wholesaler'), submitBid);
bidRouter.put('/:id/award', protect, awardBid);

export { bidRouter as default };