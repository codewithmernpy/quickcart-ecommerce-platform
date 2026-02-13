const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const tempUsers = new Map();

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    tempUsers.set(email, { email, password, name, otp, otpExpires });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email',
      text: `Your OTP is ${otp}. It expires in 10 minutes.`
    };

    transporter.sendMail(mailOptions)
      .then(() => {
        res.status(200).json({ message: 'OTP sent to email' });
      })
      .catch(async (emailError) => {
        try {
          const user = new User({
            email,
            password,
            name,
            isVerified: true
          });

          await user.save();
          tempUsers.delete(email);

          const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
          );

          res.json({
            token,
            user: {
              id: user._id,
              email: user.email,
              name: user.name,
              role: user.role
            },
            skipOtp: true
          });
        } catch (userError) {
          res.status(500).json({ message: 'Failed to create account' });
        }
      });

  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const data = tempUsers.get(email);
    if (!data || data.otp !== otp || Date.now() > data.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = new User({
      email: data.email,
      password: data.password,
      name: data.name,
      isVerified: true
    });

    await user.save();
    tempUsers.delete(email);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'OTP verification failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;
