import express from 'express';
import { getSuppliers, getSupplierProfile } from '../controllers/supplier.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getSuppliers);
router.get('/:id', protect, getSupplierProfile);

export default router;