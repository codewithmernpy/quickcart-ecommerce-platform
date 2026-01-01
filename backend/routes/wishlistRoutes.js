const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const router = express.Router();


router.post('/', authMiddleware, async (req, res) => {
  const { productId } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) wishlist = new Wishlist({ user: req.user.id, products: [] });
    console.log("wishlist",wishlist.products)
    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      wishlist.updatedAt = Date.now();
      await wishlist.save();
    }

    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.delete('/:productId', authMiddleware, async (req, res) => {
  console.log("received",req.params.productId)
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    wishlist.products = wishlist.products.filter(id => id.toString() !== req.params.productId);
    wishlist.updatedAt = Date.now();
    await wishlist.save();

    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/', authMiddleware, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

