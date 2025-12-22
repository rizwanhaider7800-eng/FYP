import Review from '../models/Review.model.js';
import Product from '../models/Product.model.js';

export const createReview = async (req, res, next) => {
  try {
    const { product, rating, comment, order } = req.body;

    const images = req.files?.map(file => ({
      url: `/uploads/reviews/${file.filename}`
    })) || [];

    const review = await Review.create({
      product,
      user: req.user.id,
      rating,
      comment,
      images,
      order,
      verified: !!order
    });

    // Update product rating
    const reviews = await Review.find({ product, status: 'approved' });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    
    await Product.findByIdAndUpdate(product, {
      'ratings.average': avgRating,
      'ratings.count': reviews.length
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ 
      product: req.params.productId,
      status: 'approved'
    })
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ 
      product: req.params.productId,
      status: 'approved'
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    review = await Review.findByIdAndUpdate(
      req.params.id,
      { rating: req.body.rating, comment: req.body.comment },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};