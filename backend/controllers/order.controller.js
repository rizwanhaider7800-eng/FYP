import Order from '../models/Order.model.js';
import Product from '../models/Product.model.js';
import User from '../models/User.model.js';
import Notification from '../models/Notification.model.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';

let stripe;
const initStripe = () => {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items provided' });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      }

      if (product.inventory.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.inventory.stock}`
        });
      }

      let priceType = 'retail';
      let price = product.pricing.retailPrice;

      if (item.quantity >= product.pricing.minWholesaleQuantity) {
        priceType = 'wholesale';
        price = product.pricing.wholesalePrice;
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price,
        priceType
      });

      subtotal += price * item.quantity;

      // Update product stock
      product.inventory.stock -= item.quantity;
      await product.save();
    }

    const tax = subtotal * 0.05;
    const shippingCost = subtotal > 10000 ? 0 : 500;
    let discount = 0;

    const total = subtotal + tax + shippingCost - discount;

    const order = new Order({
      customer: req.user.id,
      items: orderItems,
      pricing: {
        subtotal,
        discount,
        tax,
        shippingCost,
        total
      },
      shippingAddress,
      paymentDetails: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'pending'
      }
    });

    await order.save();

    await order.populate('items.product customer');

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};


export const getOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};

    // Filter by role
    if (req.user.role === 'customer' || req.user.role === 'retailer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'supplier' || req.user.role === 'wholesaler') {
      // Get orders containing supplier's products
      const products = await Product.find({ supplier: req.user.id }).select('_id');
      const productIds = products.map(p => p._id);
      query['items.product'] = { $in: productIds };
    }

    if (status) query.orderStatus = status;

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && order.customer._id.toString() !== req.user.id) {
      // Check if user is supplier of any product in order
      const hasProduct = order.items.some(
        item => item.product.supplier.toString() === req.user.id
      );
      
      if (!hasProduct) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this order'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      note,
      updatedAt: Date.now()
    });

    await order.save();

    // Create notification for customer
    await Notification.create({
      user: order.customer,
      type: 'order',
      title: 'Order Status Updated',
      message: `Your order #${order.orderNumber} status has been updated to ${status}`,
      data: { orderId: order._id },
      link: `/orders/${order._id}`
    });

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (order.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 'inventory.stock': item.quantity }
      });
    }

    order.orderStatus = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      note: 'Cancelled by customer',
      updatedAt: Date.now()
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const generateInvoice = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('items.product', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (order.customer._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this invoice'
      });
    }

    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order.orderNumber}.pdf`);

    doc.pipe(res);

    // Invoice Header
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Order Number: ${order.orderNumber}`, { align: 'right' });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();

    // Customer Details
    doc.fontSize(12).text('Bill To:');
    doc.fontSize(10).text(order.customer.name);
    doc.text(order.customer.email);
    doc.text(order.customer.phone);
    doc.text(`${order.shippingAddress.street}, ${order.shippingAddress.city}`);
    doc.text(`${order.shippingAddress.state}, ${order.shippingAddress.zipCode}`);
    doc.moveDown();

    // Items Table
    doc.fontSize(12).text('Order Items:');
    doc.moveDown(0.5);

    order.items.forEach((item, index) => {
      doc.fontSize(10).text(
        `${index + 1}. ${item.product.name} - Qty: ${item.quantity} x ${item.price} = ${item.quantity * item.price}`
      );
    });

    doc.moveDown();

    // Totals
    doc.text(`Subtotal: ${order.pricing.subtotal}`, { align: 'right' });
    doc.text(`Tax: ${order.pricing.tax}`, { align: 'right' });
    doc.text(`Shipping: ${order.pricing.shippingCost}`, { align: 'right' });
    if (order.pricing.discount > 0) {
      doc.text(`Discount: -${order.pricing.discount}`, { align: 'right' });
    }
    doc.fontSize(12).text(`Total: ${order.pricing.total}`, { align: 'right' });

    doc.end();
  } catch (error) {
    next(error);
  }
};

export const createCheckoutSession = async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items provided' });
    }

    // Calculate order details
    let subtotal = 0;
    const orderItems = [];
    const lineItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product).lean();
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      }

      if (product.inventory.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.inventory.stock}`
        });
      }

      let price = product.pricing.retailPrice;
      if (item.quantity >= product.pricing.minWholesaleQuantity) {
        price = product.pricing.wholesalePrice;
      }

      // Store only plain data for metadata
      orderItems.push({
        product: product._id.toString(),
        quantity: parseInt(item.quantity),
        price: parseFloat(price)
      });

      subtotal += price * item.quantity;

      // Create Stripe line items - Skip images as they're local paths, not valid URLs
      lineItems.push({
        price_data: {
          currency: 'pkr',
          product_data: {
            name: String(product.name || 'Product'),
            description: String(product.description || '').substring(0, 100)
          },
          unit_amount: Math.round(price * 100)
        },
        quantity: item.quantity
      });
    }

    const tax = subtotal * 0.05;
    const shippingCost = subtotal > 10000 ? 0 : 500;

    // Add tax as line item
    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'pkr',
          product_data: {
            name: 'Tax (5%)'
          },
          unit_amount: Math.round(tax * 100)
        },
        quantity: 1
      });
    }

    // Add shipping as line item
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'pkr',
          product_data: {
            name: 'Shipping Cost'
          },
          unit_amount: Math.round(shippingCost * 100)
        },
        quantity: 1
      });
    }

    // Sanitize shipping address to plain object
    const sanitizedAddress = {
      street: String(shippingAddress.street || ''),
      city: String(shippingAddress.city || ''),
      state: String(shippingAddress.state || ''),
      zipCode: String(shippingAddress.zipCode || ''),
      country: String(shippingAddress.country || 'Pakistan'),
      phone: String(shippingAddress.phone || '')
    };

    // Get user email safely
    const userEmail = String(req.user.email || '');
    const userId = String(req.user.id || req.user._id || '');

    // Create Stripe checkout session
    const stripeInstance = initStripe();
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
        orderItems: JSON.stringify(orderItems),
        shippingAddress: JSON.stringify(sanitizedAddress),
        subtotal: String(subtotal),
        tax: String(tax),
        shippingCost: String(shippingCost)
      }
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }

    // Retrieve the session from Stripe
    const stripeInstance = initStripe();
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    // Check if order already exists for this session
    const existingOrder = await Order.findOne({ 'paymentDetails.transactionId': sessionId });
    if (existingOrder) {
      return res.status(200).json({
        success: true,
        data: existingOrder,
        message: 'Order already created'
      });
    }

    // Create order from session metadata
    const metadata = session.metadata;
    const orderItems = JSON.parse(metadata.orderItems);
    const shippingAddress = JSON.parse(metadata.shippingAddress);

    // Add priceType to each item based on quantity and fetch product details
    const enrichedItems = [];
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        continue; // Skip if product not found
      }

      const priceType = item.quantity >= product.pricing.minWholesaleQuantity ? 'wholesale' : 'retail';
      
      enrichedItems.push({
        product: item.product,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        priceType: priceType
      });

      // Update product stock
      product.inventory.stock -= item.quantity;
      await product.save();
    }

    const order = new Order({
      customer: metadata.userId,
      items: enrichedItems,
      pricing: {
        subtotal: parseFloat(metadata.subtotal),
        discount: 0,
        tax: parseFloat(metadata.tax),
        shippingCost: parseFloat(metadata.shippingCost),
        total: session.amount_total / 100
      },
      shippingAddress,
      paymentDetails: {
        method: 'card',
        status: 'paid',
        transactionId: sessionId,
        paidAt: new Date()
      }
    });

    await order.save();
    await order.populate('items.product customer');

    // Create notification
    await Notification.create({
      user: metadata.userId,
      type: 'order',
      title: 'Order Confirmed',
      message: `Your order #${order.orderNumber} has been confirmed and payment received`,
      data: { orderId: order._id },
      link: `/orders/${order._id}`
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const stripeInstance = initStripe();
    event = stripeInstance.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Find and update order
    const order = await Order.findOne({ 'paymentDetails.transactionId': session.id });
    if (order && order.paymentDetails.status !== 'paid') {
      order.paymentDetails.status = 'paid';
      order.paymentDetails.paidAt = new Date();
      await order.save();
    }
  }

  res.json({ received: true });
};