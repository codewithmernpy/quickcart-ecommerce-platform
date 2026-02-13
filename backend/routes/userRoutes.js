const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    
    const users = await User.find().select('-password -otp -otpExpires');
    console.log(users)
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalSalesResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
   const totalProducts = await Product.countDocuments({ deleted: false });
    res.json({
      totalUsers,
      totalOrders,
      totalSales: totalSalesResult[0]?.total || 0,
      totalProducts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/manageAdmin',authMiddleware,adminMiddleware,async(req,res)=>{
  const email=req.body.email
  console.log("email",email)
  try{
     const isFound=await User.updateOne({'email':email},{$set:{'role':'admin'}})
     console.log(isFound)
     res.json("successful")
  }
  catch{
    console.log("some error occured")
  }
 
})

module.exports = router;
