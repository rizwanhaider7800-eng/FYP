import express from 'express';
import { createReview, getProductReviews, updateReview, deleteReview } from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadMultiple } from '../middleware/upload.middleware.js';

const reviewRouter = express.Router();

reviewRouter.post('/', protect, uploadMultiple, createReview);
reviewRouter.get('/product/:productId', getProductReviews);
reviewRouter.put('/:id', protect, updateReview);
reviewRouter.delete('/:id', protect, deleteReview);

export { reviewRouter as default };