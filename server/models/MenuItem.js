const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    category: {
      type: String,
      required: true,
      enum: ['Meals', 'Snacks', 'Beverages', 'Desserts']
    },
    imageUrl: {
      type: String,
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    totalQuantity: {
      type: Number,
      default: 100,
      min: 0
    },
    remainingQuantity: {
      type: Number,
      default: 100,
      min: 0
    },
    ratings: [
      {
        type: Number,
        min: 1,
        max: 5
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
