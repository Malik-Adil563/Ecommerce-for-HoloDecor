const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const stripe = require("stripe")("sk_test_51PkqswRqTY1bRAbmAOPcjettpFGO7bYrOQPOgKfsmIbmz4kVPyRyEug8QX7LTISynPofxC6I5VSmOI6oqT3IIObQ00c0wnhs55");
const { v4: uuid } = require("uuid");
const axios = require('axios');

const User = require('./models/users');
const Product = require('./models/products');

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ["http://localhost:3000", "https://holo-decor-ar-frontend.vercel.app"],
    credentials: true
}));
app.use(cookieParser());

// MongoDB connection
mongoose.connect('mongodb+srv://adilm09:Camb786@cluster0.kb3vcsh.mongodb.net/internee/ecommerce?retryWrites=true&w=majority')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Test Route
app.get('/', (req, res) => {
    res.send("Welcome to AR Decor Backend");
});

// Get all products
app.get('/getProducts', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get product by productCode
app.get('/getProduct/:productCode', async (req, res) => {
    try {
        const product = await Product.findOne({ productCode: req.params.productCode });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get products by category
app.get('/getProductsByCategory/:category', async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.category });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User Registration
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (!(name && email && password)) return res.status(400).send('All fields are required');

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(401).send('User already exists');

    const hashedPass = await bcryptjs.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPass });

    const token = jwt.sign({ id: user._id }, 'shhhh', { expiresIn: "2h" });
    user.token = token;
    user.password = undefined;

    res.status(201).json({ user, token });
});

// User Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!(email && password)) return res.status(400).send('All fields are required');

    const user = await User.findOne({ email });
    if (user && await bcryptjs.compare(password, user.password)) {
        const token = jwt.sign({ id: user._id }, 'shhhh', { expiresIn: "2h" });
        user.token = token;
        user.password = undefined;

        return res.status(200).cookie("token", token, {
            httpOnly: true,
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        }).json({ success: true, token, user });
    }
    res.status(400).send('Invalid credentials');
});

// Wall detection route
app.post('/detect-wall', async (req, res) => {
    try {
        const { image } = req.body;
        const response = await axios.post(
            'https://14cf3993-0a8a-4fcc-a670-81d92d092b65-00-3ib9bcwcj2mzr.sisko.replit.dev/detect-wall',
            { image }
        );
        res.status(200).json({ wallDetected: !!response.data.wallDetected });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Stripe Payment
app.post("/payment", async (req, res) => {
    const { product, token } = req.body;
    const idempotencyKey = uuid();

    try {
        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
        });

        const charge = await stripe.charges.create({
            amount: product.price * 100,
            currency: 'pkr',
            customer: customer.id,
            receipt_email: token.email,
            description: `Purchase of ${product.name}`,
            shipping: {
                name: token.card.name,
                address: {
                    country: token.card.country,
                    line1: token.card.address_line1
                }
            }
        }, { idempotencyKey });

        res.status(200).json(charge);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
