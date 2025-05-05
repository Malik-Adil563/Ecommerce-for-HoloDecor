const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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

module.exports = mongoose.model("Product", productSchema, 'products');
