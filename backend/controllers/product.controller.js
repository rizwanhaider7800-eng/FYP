import Product from '../models/Product.model.js';
import Notification from '../models/Notification.model.js';

export const getProducts = async (req, res, next) => {
  try {
    const { 
      category, 
      search, 
      minPrice, 
      maxPrice, 
      inStock, 
      sort = '-createdAt',
      page = 1,
      limit = 20
    } = req.query;

    const query = { status: 'active' };

    // Apply filters
    if (category) query.category = category;
    if (inStock === 'true') query['inventory.inStock'] = true;
    if (search) {
      query.$text = { $search: search };
    }
    if (minPrice || maxPrice) {
      query['pricing.retailPrice'] = {};
      if (minPrice) query['pricing.retailPrice'].$gte = Number(minPrice);
      if (maxPrice) query['pricing.retailPrice'].$lte = Number(maxPrice);
    }

    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('supplier', 'name businessDetails')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: products
    });
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('supplier', 'name email phone businessDetails');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const images = req.files?.map(file => ({
      url: `/uploads/products/${file.filename}`,
      alt: req.body.name
    })) || [];

    const productData = {
      ...req.body,
      images,
      supplier: req.user.id
    };

    // Parse nested objects if sent as strings
    if (typeof productData.pricing === 'string') {
      productData.pricing = JSON.parse(productData.pricing);
    }
    if (typeof productData.inventory === 'string') {
      productData.inventory = JSON.parse(productData.inventory);
    }
    if (typeof productData.specifications === 'string') {
      productData.specifications = JSON.parse(productData.specifications);
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.supplier.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    const updateData = { ...req.body };

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: `/uploads/products/${file.filename}`,
        alt: req.body.name || product.name
      }));
      updateData.images = [...(product.images || []), ...newImages];
    }

    // Parse nested objects if sent as strings
    if (typeof updateData.pricing === 'string') {
      updateData.pricing = JSON.parse(updateData.pricing);
    }
    if (typeof updateData.inventory === 'string') {
      updateData.inventory = JSON.parse(updateData.inventory);
    }
    if (typeof updateData.specifications === 'string') {
      updateData.specifications = JSON.parse(updateData.specifications);
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.supplier.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getLowStockProducts = async (req, res, next) => {
  try {
    const query = {
      status: 'active',
      $expr: { $lte: ['$inventory.stock', '$inventory.lowStockThreshold'] }
    };

    // Filter by supplier if not admin
    if (req.user.role !== 'admin') {
      query.supplier = req.user.id;
    }

    const products = await Product.find(query)
      .populate('supplier', 'name email');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

export const updateStock = async (req, res, next) => {
  try {
    const { stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.supplier.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    product.inventory.stock = stock;
    await product.save();

    // Create low stock notification if needed
    if (stock <= product.inventory.lowStockThreshold) {
      await Notification.create({
        user: product.supplier,
        type: 'stock',
        title: 'Low Stock Alert',
        message: `Product "${product.name}" is running low on stock. Current stock: ${stock}`,
        data: { productId: product._id },
        link: `/products/${product._id}`
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};