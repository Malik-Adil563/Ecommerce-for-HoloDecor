// backend/models/Products.js
const mongoose = require('mongoose');
// Connect to the MongoDB cluster and specify the database 'adilm09'
mongoose.connect('mongodb+srv://adilm09:Camb786@cluster0.kb3vcsh.mongodb.net/ecommerce?retryWrites=true&w=majority')
  .then(() => {
    console.log('Connected to MongoDB products');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

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

const Products = mongoose.model("Products", userInSchema, 'catProducts');
module.exports = Products;
