// backend/models/Products.js
const mongoose = require('mongoose');

const userInSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  rating: {
    rate: Number,
    count: Number
  },
  productCode: Number,
  id: Number
});

const Products = mongoose.model("Products", userInSchema, 'products');
module.exports = Products;
