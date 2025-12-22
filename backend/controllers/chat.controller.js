import Chat from '../models/Chat.model.js';

export const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ participants: req.user.id })
      .populate('participants', 'name avatar')
      .populate('product', 'name images')
      .sort('-lastMessageAt');

    res.status(200).json({
      success: true,
      data: chats
    });
  } catch (error) {
    next(error);
  }
};

export const getChat = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name avatar')
      .populate('product', 'name images')
      .populate('messages.sender', 'name avatar');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    if (!chat.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    chat.messages.push({
      sender: req.user.id,
      message
    });

    chat.lastMessage = message;
    chat.lastMessageAt = Date.now();

    await chat.save();

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    next(error);
  }
};