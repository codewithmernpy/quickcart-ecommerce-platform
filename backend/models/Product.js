const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  category: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  sellerType: {
    type: String,
    enum: ['admin', 'seller'],
    default: 'admin'
  },
  images: [
    {
      type: String
    }
  ],
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        required: true
      },
      comment: {
        type: String
      }
    }
  ],
  averageRating: {
    type: Number,
    default: 0
    
  },
  deleted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Product', productSchema);
