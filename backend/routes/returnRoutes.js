const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const Return = require('../models/Return');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');
const router = express.Router();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { orderId, productId, reason, type } = req.body;

    const order = await Order.findById(orderId).populate('items.product');
    if (!order || order.user.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    console.log('Creating return for product seller:', product.seller);

    const deliveryDate = order.createdAt;
    const daysDiff = (Date.now() - deliveryDate) / (1000 * 60 * 60 * 24);
    if (daysDiff > 7) {
      return res.status(400).json({ message: 'Return period expired' });
    }

    const returnRequest = new Return({
      order: orderId,
      user: req.user.id,
      product: productId,
      seller: product.seller,
      reason,
      type
    });

    await returnRequest.save();
    console.log('Return request created:', returnRequest._id);

    order.status = `pending ${type}`;
    await order.save();

    const user = await User.findById(req.user.id);
    const seller = await Seller.findById(product.seller);

    if (seller) {
      await new Notification({
        user: product.seller,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Request`,
        message: `New ${type} request for ${product.name}`,
        type: 'return'
      }).save();
    }

    if (seller && seller.email) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: seller.email,
        subject: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Request`,
        text: `You have received a new ${type} request for product "${product.name}" from customer ${user.name}.\n\nReason: ${reason}\n\nPlease log in to your seller dashboard to review and respond to this request.`
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (emailErr) {
        console.error('Email send failed:', emailErr);
      }
    }

    res.status(201).json(returnRequest);
  } catch (err) {
    console.error('Return creation error:', err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const returns = await Return.find({ user: req.user.id })
      .populate('order')
      .populate('product');
    res.json(returns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/debug/all', authMiddleware, async (req, res) => {
  try {
    const returns = await Return.find({})
      .populate('product', 'name seller')
      .populate('user', 'name')
      .sort({ requestDate: -1 });

    res.json({
      total: returns.length,
      returns: returns.map(r => ({
        id: r._id,
        seller: r.seller,
        productSeller: r.product?.seller,
        user: r.user?.name,
        product: r.product?.name,
        type: r.type,
        status: r.status,
        requestDate: r.requestDate
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/debug/seller', authMiddleware, async (req, res) => {
  try {
    console.log('Debug - req.user:', req.user);

    const products = await Product.find({ seller: req.user.id });
    console.log('Debug - Products by seller:', products.length);

    const returns = await Return.find({ seller: req.user.id });
    console.log('Debug - Returns for seller:', returns.length);

    res.json({
      user: req.user,
      productsCount: products.length,
      returnsCount: returns.length,
      products: products.map(p => ({ id: p._id, name: p.name, seller: p.seller })),
      returns: returns.map(r => ({ id: r._id, seller: r.seller, type: r.type }))
    });
  } catch (err) {
    console.error('Debug error:', err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/seller', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching returns for seller:', req.user.id, 'role:', req.user.role);

    const query = { seller: req.user.id };

    const returns = await Return.find(query)
      .populate('order')
      .populate('product')
      .populate('user', 'name email')
      .sort({ requestDate: -1 });

    console.log('Found returns:', returns.length);
    console.log('Return seller IDs:', returns.map(r => r.seller.toString()));

    res.json(returns);
  } catch (err) {
    console.error('Error fetching seller returns:', err);
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/seller', authMiddleware, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    console.log('=== RETURN REQUEST UPDATE ===');
    console.log('Return ID:', req.params.id);
    console.log('Return Status:', status);
    console.log('Admin Notes:', adminNotes);

    const returnRequest = await Return.findById(req.params.id)
      .populate('product')
      .populate('user', 'name email');

    if (!returnRequest || returnRequest.seller.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Return request not found' });
    }

    console.log('Return request found for order:', returnRequest.order);
    console.log('Return type:', returnRequest.type);

    returnRequest.status = status;
    returnRequest.responseDate = new Date();
    if (adminNotes) returnRequest.adminNotes = adminNotes;

    await returnRequest.save();
    console.log('Return request updated successfully');

    const order = await Order.findById(returnRequest.order);
    if (order) {
      console.log('Found order with current status:', order.status);

      if (status === 'approved') {
        const newOrderStatus = returnRequest.type === 'return' ? 'return approved' : 'replacement approved';
        console.log('Setting order status to:', newOrderStatus);
        order.status = newOrderStatus;
      } else if (status === 'rejected') {
        console.log('Setting order status to return/replacement rejected');
        order.status = returnRequest.type === 'return' ? 'return rejected' : 'replacement rejected';
      }

      await order.save();
      console.log('Order status updated to:', order.status);
    } else {
      console.log('Order not found for return request');
    }

    await new Notification({
      user: returnRequest.user._id,
      title: `${returnRequest.type.charAt(0).toUpperCase() + returnRequest.type.slice(1)} ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your ${returnRequest.type} request for ${returnRequest.product.name} has been ${status}`,
      type: 'return'
    }).save();

    if (returnRequest.user.email) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: returnRequest.user.email,
        subject: `${returnRequest.type.charAt(0).toUpperCase() + returnRequest.type.slice(1)} Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        text: `Your ${returnRequest.type} request for "${returnRequest.product.name}" has been ${status}.${adminNotes ? `\n\nNotes: ${adminNotes}` : ''}\n\nThank you for shopping with us.`
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
      } catch (emailErr) {
        console.error('Email send failed:', emailErr);
      }
    }

    res.json(returnRequest);
  } catch (err) {
    console.error('Error in return request update:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;