import Coupon from '../models/Coupon.model.js';

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);

    res.status(201).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    next(error);
  }
};

export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');

    res.status(200).json({
      success: true,
      data: coupons
    });
  } catch (error) {
    next(error);
  }
};

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderTotal, userRole } = req.body;

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired coupon'
      });
    }

    if (coupon.minOrderValue && orderTotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ${coupon.minOrderValue} required`
      });
    }

    if (coupon.applicableFor !== 'all' && coupon.applicableFor !== userRole) {
      return res.status(400).json({
        success: false,
        message: 'Coupon not applicable for your user type'
      });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit exceeded'
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }

    res.status(200).json({
      success: true,
      data: { coupon, discount }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon deleted'
    });
  } catch (error) {
    next(error);
  }
};