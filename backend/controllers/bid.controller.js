import Bid from '../models/Bid.model.js';
import Notification from '../models/Notification.model.js';

export const createBidRequest = async (req, res, next) => {
  try {
    const { product, quantity, description, deliveryDate, expiresAt } = req.body;

    const bid = await Bid.create({
      customer: req.user.id,
      product,
      quantity,
      description,
      deliveryDate,
      expiresAt
    });

    res.status(201).json({
      success: true,
      data: bid
    });
  } catch (error) {
    next(error);
  }
};

export const getBids = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'customer' || req.user.role === 'retailer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'supplier' || req.user.role === 'wholesaler') {
      query.status = 'open';
    }

    const bids = await Bid.find(query)
      .populate('product', 'name images')
      .populate('customer', 'name email')
      .populate('bids.supplier', 'name businessDetails')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bids.length,
      data: bids
    });
  } catch (error) {
    next(error);
  }
};

export const submitBid = async (req, res, next) => {
  try {
    const { price, estimatedDelivery, message } = req.body;
    
    const bidRequest = await Bid.findById(req.params.id);

    if (!bidRequest) {
      return res.status(404).json({
        success: false,
        message: 'Bid request not found'
      });
    }

    if (bidRequest.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This bid request is no longer open'
      });
    }

    bidRequest.bids.push({
      supplier: req.user.id,
      price,
      estimatedDelivery,
      message
    });

    await bidRequest.save();

    // Notify customer
    await Notification.create({
      user: bidRequest.customer,
      type: 'bid',
      title: 'New Bid Received',
      message: `You have received a new bid for your request`,
      data: { bidId: bidRequest._id },
      link: `/bids/${bidRequest._id}`
    });

    res.status(200).json({
      success: true,
      data: bidRequest
    });
  } catch (error) {
    next(error);
  }
};

export const awardBid = async (req, res, next) => {
  try {
    const { bidId } = req.body;
    
    const bidRequest = await Bid.findById(req.params.id);

    if (!bidRequest) {
      return res.status(404).json({
        success: false,
        message: 'Bid request not found'
      });
    }

    if (bidRequest.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const selectedBid = bidRequest.bids.id(bidId);
    if (!selectedBid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    selectedBid.status = 'accepted';
    bidRequest.status = 'awarded';
    bidRequest.awardedTo = selectedBid.supplier;
    bidRequest.closedAt = Date.now();

    await bidRequest.save();

    res.status(200).json({
      success: true,
      data: bidRequest
    });
  } catch (error) {
    next(error);
  }
};