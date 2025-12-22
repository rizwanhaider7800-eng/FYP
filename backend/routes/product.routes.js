import express from 'express';
import { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  getLowStockProducts,
  updateStock
} from '../controllers/product.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { uploadMultiple } from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/low-stock', protect, authorize('admin', 'supplier', 'wholesaler'), getLowStockProducts);
router.get('/:id', getProduct);

router.post('/', protect, authorize('admin', 'supplier', 'wholesaler'), uploadMultiple, createProduct);
router.put('/:id', protect, authorize('admin', 'supplier', 'wholesaler'), uploadMultiple, updateProduct);
router.delete('/:id', protect, authorize('admin', 'supplier', 'wholesaler'), deleteProduct);
router.patch('/:id/stock', protect, authorize('admin', 'supplier', 'wholesaler'), updateStock);

export default router;