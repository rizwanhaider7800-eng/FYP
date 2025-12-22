import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    required: true,
    enum: ['cement', 'bricks', 'steel', 'wood', 'tiles', 'sand', 'gravel', 'paint', 'electrical', 'plumbing', 'other']
  },
  subCategory: {
    type: String,
    trim: true
  },
  images: [{
    url: String,
    alt: String
  }],
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'ton', 'piece', 'bag', 'sqft', 'meter', 'liter', 'box']
  },
  pricing: {
    retailPrice: {
      type: Number,
      required: true
    },
    wholesalePrice: {
      type: Number,
      required: true
    },
    minWholesaleQuantity: {
      type: Number,
      default: 100
    }
  },
  inventory: {
    stock: {
      type: Number,
      required: true,
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 20
    },
    inStock: {
      type: Boolean,
      default: true
    }
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specifications: {
    brand: String,
    weight: String,
    dimensions: String,
    material: String,
    color: String,
    grade: String
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued'],
    default: 'active'
  }
}, {
  timestamps: true
});

productSchema.pre('save', function(next) {
  this.inventory.inStock = this.inventory.stock > 0;
  next();
});

productSchema.index({ name: 'text', description: 'text', category: 'text' });

export default mongoose.model('Product', productSchema);