import User from '../models/User.model.js';
import Product from '../models/Product.model.js';

export const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await User.find({ 
      role: { $in: ['supplier', 'wholesaler'] },
      status: 'active'
    }).select('name email phone businessDetails ratings');

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    next(error);
  }
};

export const getSupplierProfile = async (req, res, next) => {
  try {
    const supplier = await User.findById(req.params.id)
      .select('name email phone businessDetails ratings');

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    const products = await Product.find({ supplier: req.params.id, status: 'active' })
      .select('name images pricing.retailPrice category');

    res.status(200).json({
      success: true,
      data: { supplier, products }
    });
  } catch (error) {
    next(error);
  }
};