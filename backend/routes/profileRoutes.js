let express = require('express');
let app = express();
let router = express.Router();
const jwt = require('jsonwebtoken');
let {authMiddleware}=require('../middleware/auth')
let User=require("../models/User")



router.post('/', authMiddleware, (req, res) => {
  res.json(req.user)
  
});
router.post('/updateAddress', authMiddleware, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { primaryAddress: req.body.address } },
      { new: true }
    );

    res.json(updatedUser.primaryAddress);
  } catch (err) {
    res.status(500).json({ error: "Failed to update address" });
  }
});

router.post('/checkprimaryAddress', authMiddleware, async (req, res) => {
  let user = await User.findOne({ _id: req.user.id }, { _id: 0, primaryAddress: 1 });
  console.log("primaryAddress:", user?.primaryAddress);
  res.json({ primaryAddress: user?.primaryAddress || [] });
});



module.exports = router;
