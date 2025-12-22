import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: false
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
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
    price: {
      type: Number,
      required: true
    },
    priceType: {
      type: String,
      enum: ['retail', 'wholesale'],
      required: true
    }
  }],
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    shippingCost: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  couponApplied: {
    code: String,
    discount: Number
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'Pakistan' },
    phone: { type: String, required: true }
  },
  paymentDetails: {
    method: {
      type: String,
      enum: ['card', 'upi', 'cod', 'credit'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  tracking: {
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    actualDelivery: Date
  },
  invoiceUrl: String,
  notes: String,
  statusHistory: [{
    status: String,
    updatedAt: { type: Date, default: Date.now },
    note: String
  }]
}, {
  timestamps: true
});

orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD${Date.now()}${count + 1}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);