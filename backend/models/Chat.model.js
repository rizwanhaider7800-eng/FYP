import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    sentAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastMessage: {
    type: String
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  }
}, {
  timestamps: true
});

chatSchema.index({ participants: 1, lastMessageAt: -1 });

export default mongoose.model('Chat', chatSchema);