const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
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
    const cart = await Cart.findOne({ user: req.user.id })
    const popu = await Cart.findOne({ user: req.user.id }).populate('items.product')
    console.log(cart)
    console.log(popu.items[0].product)
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const { address } = req.body;


    const items = popu.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    console.log("items", items)
    const total = items.reduce((acc, item) => acc + item.quantity * item.price, 0);


    for (const item of popu.items) {
      const product = await Product.findById(item.product._id);




      product.stock -= item.quantity;
      await product.save();
    }


    const user = await User.findById(req.user.id);
    const isDuplicate = user.addresses.some(
      (a) => JSON.stringify(a) === JSON.stringify(address)
    );
    if (!isDuplicate) {
      user.addresses.push(address);
      await user.save();
    }

    const order = new Order({
      user: req.user.id,
      items,
      total,
      address,
    });

    await order.save();
    await Cart.deleteOne({ user: req.user.id });

    const customer = await User.findById(req.user.id);

    const sellerIds = [...new Set(popu.items.map(item => item.product.seller.toString()))];

    for (const sellerId of sellerIds) {
      const seller = await User.findById(sellerId);
      const sellerProducts = popu.items.filter(item => item.product.seller.toString() === sellerId);

      await new Notification({
        user: sellerId,
        title: 'New Order Received',
        message: `New order from ${customer.name} for ${sellerProducts.length} product(s)`,
        type: 'order'
      }).save();

      if (seller && seller.email) {
        const productList = sellerProducts.map(item =>
          `${item.product.name} (Qty: ${item.quantity})`
        ).join('\n');

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: seller.email,
          subject: 'New Order Received - QuickCart',
          text: `You have received a new order!\n\nCustomer: ${customer.name}\nEmail: ${customer.email}\n\nProducts:\n${productList}\n\nPlease log in to your seller dashboard to manage this order.`
        };

        try {
          await transporter.sendMail(mailOptions);
        } catch (emailErr) {
          console.error('Email send failed:', emailErr);
        }
      }
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/seller-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product')
      .populate('user', 'name email');

    const sellerOrders = orders.filter(order =>
      order.items.some(item =>
        item.product && item.product.seller &&
        item.product.seller.toString() === req.user.id
      )
    );

    res.json(sellerOrders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('items.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.put('/:id/seller', authMiddleware, async (req, res) => {
  const { status, rejectionNotes } = req.body;
  console.log('=== SELLER ORDER UPDATE ===');
  console.log('Order ID:', req.params.id);
  console.log('New Status:', status);
  console.log('Rejection Notes:', rejectionNotes);

  try {
    const order = await Order.findById(req.params.id).populate('items.product').populate('user');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('Current Order Status:', order.status);

    const hasSellerProducts = order.items.some(item =>
      item.product && item.product.seller &&
      item.product.seller.toString() === req.user.id
    );

    if (!hasSellerProducts) {
      return res.status(403).json({ message: 'Unauthorized to update this order' });
    }

    const oldStatus = order.status;
    order.status = status;
    if (status === 'rejected' && rejectionNotes) {
      order.rejectionNotes = rejectionNotes;
    }

    console.log('Updating order status from', oldStatus, 'to', status);
    await order.save();
    console.log('Order saved successfully with status:', order.status);

    if (oldStatus !== status) {
      let notificationMessage = '';
      if (status === 'rejected') {
        notificationMessage = `Your order has been rejected. ${rejectionNotes ? 'Reason: ' + rejectionNotes : ''}`;
      } else if (status === 'processing') {
        notificationMessage = 'Your order has been approved and is now being processed.';
      } else if (status === 'returned') {
        notificationMessage = 'Your return request has been approved.';
      } else if (status === 'replaced') {
        notificationMessage = 'Your replacement request has been approved.';
      } else if (status === 'return approved') {
        notificationMessage = 'Your return request has been approved.';
      } else if (status === 'replacement approved') {
        notificationMessage = 'Your replacement request has been approved.';
      } else if (status === 'return rejected') {
        notificationMessage = 'Your return request has been rejected.';
      } else if (status === 'replacement rejected') {
        notificationMessage = 'Your replacement request has been rejected.';
      } else if (status === 'delivered' && (oldStatus === 'pending return' || oldStatus === 'pending replacement')) {
        notificationMessage = 'Your return/replacement request has been rejected.';
      } else {
        notificationMessage = `Your order status has been updated to ${status}.`;
      }

      console.log('Sending notification:', notificationMessage);

      await new Notification({
        user: order.user._id,
        title: 'Order Status Update',
        message: notificationMessage,
        type: 'order'
      }).save();
    }

    console.log('Final order status before response:', order.status);
    res.json(order);
  } catch (err) {
    console.error('Error updating seller order:', err);
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { status, rejectionNotes } = req.body;
  console.log(status)
  try {
    const order = await Order.findById(req.params.id).populate('user');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const oldStatus = order.status;
    order.status = status;
    if (status === 'rejected' && rejectionNotes) {
      order.rejectionNotes = rejectionNotes;
    }
    await order.save();

    if (oldStatus !== status) {
      let notificationMessage = '';
      if (status === 'rejected') {
        notificationMessage = `Your order has been rejected. ${rejectionNotes ? 'Reason: ' + rejectionNotes : ''}`;
      } else if (status === 'processing') {
        notificationMessage = 'Your order has been approved and is now being processed.';
      } else {
        notificationMessage = `Your order status has been updated to ${status}.`;
      }

      await new Notification({
        user: order.user._id,
        title: 'Order Status Update',
        message: notificationMessage,
        type: 'order'
      }).save();
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
