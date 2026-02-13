const express = require('express');
const jwt = require('jsonwebtoken');
const Seller = require('../models/Seller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, businessName, panCard } = req.body;

    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ message: 'Seller already exists' });
    }

    const seller = new Seller({
      email,
      password,
      name,
      businessName,
      panCard
    });

    await seller.save();
    res.json({ message: 'Seller registration submitted for verification' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await seller.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (seller.verificationStatus === 'rejected') {
      return res.status(403).json({ message: 'Your seller application has been rejected' });
    }

    if (seller.verificationStatus === 'pending') {
      return res.status(403).json({ message: 'Your application is pending approval' });
    }

    const token = jwt.sign(
      { id: seller._id, role: 'seller' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: seller._id,
        email: seller.email,
        name: seller.name,
        role: 'seller',
        businessName: seller.businessName
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/pending', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const sellers = await Seller.find({ verificationStatus: 'pending' });
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/verify/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { verificationStatus: status };

    if (status === 'approved') {
      updateData.isVerified = true;
    } else if (status === 'rejected') {
      updateData.isVerified = false;
    }

    const seller = await Seller.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(seller);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;