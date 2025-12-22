import express from 'express';
import { createCoupon, getCoupons, validateCoupon, deleteCoupon } from '../controllers/coupon.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const couponRouter = express.Router();

couponRouter.post('/', protect, authorize('admin'), createCoupon);
couponRouter.get('/', protect, authorize('admin'), getCoupons);
couponRouter.post('/validate', protect, validateCoupon);
couponRouter.delete('/:id', protect, authorize('admin'), deleteCoupon);

export { couponRouter as default };