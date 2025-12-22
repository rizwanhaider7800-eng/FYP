import express from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrder, 
  updateOrderStatus,
  cancelOrder,
  generateInvoice,
  createCheckoutSession,
  verifyPayment,
  handleStripeWebhook
} from '../controllers/order.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/verify-payment', protect, verifyPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorize('admin', 'supplier', 'wholesaler'), updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.get('/:id/invoice', protect, generateInvoice);

export default router;