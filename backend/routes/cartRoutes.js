const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose'); 

const router = express.Router();


router.post('/', authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
  

    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }
   
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);

    if (itemIndex!=-1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    
    res.sendStatus(200);
  } catch (err) {
    console.log('Add to Cart error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});


router.put('/:productId', authMiddleware, async (req, res) => {
  const { quantity } = req.body;
  try {
    const cart = await Cart.findOne({ user: req.user.id });
   

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === req.params.productId
    );

    

    const product = await Product.findById(req.params.productId);
    if (!product || product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    
    if (quantity < 1) {
      
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== req.params.productId
      );
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    cart.updatedAt = Date.now();
    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    res.status(200).json(updatedCart);
  } catch (err) {
    console.error('Update Cart error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});


router.delete('/:productId', authMiddleware, async (req, res) => {
  try {
    const productId = new mongoose.Types.ObjectId(req.params.productId);

    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id },
      {
        $pull: { items: { product: productId } },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    ).populate('items.product');

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.status(200).json(cart);
  } catch (err) {
    console.error('Remove from Cart error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});


router.get('/', authMiddleware, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    
    res.status(200).json(cart);
  } catch (err) {
    console.error('Cart fetch error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
