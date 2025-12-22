import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  description: {
    type: String,
    required: true
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'awarded', 'cancelled'],
    default: 'open'
  },
  bids: [{
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    estimatedDelivery: {
      type: Date,
      required: true
    },
    message: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  awardedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  closedAt: Date,
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

bidSchema.index({ expiresAt: 1, status: 1 });

export default mongoose.model('Bid', bidSchema);