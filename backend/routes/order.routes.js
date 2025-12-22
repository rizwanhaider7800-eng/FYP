import express from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrder, 
  updateOrderStatus,
  cancelOrder,
  generateInvoice
} from '../controllers/order.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('admin', 'supplier', 'wholesaler'), updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.get('/:id/invoice', protect, generateInvoice);

export default router;