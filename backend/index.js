const express = require('express');
const cors = require('cors');
const User = require('./models/Products');
const Products = require('./models/users');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
const stripe = require("stripe")("sk_test_51PkqswRqTY1bRAbmAOPcjettpFGO7bYrOQPOgKfsmIbmz4kVPyRyEug8QX7LTISynPofxC6I5VSmOI6oqT3IIObQ00c0wnhs55");
const { v4: uuid } = require("uuid");
const axios = require('axios');
const app = express();

// Vercel uses this variable to set the correct port
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ["http://localhost:3000", "https://holo-decor-ar-frontend.vercel.app/"], // Add your actual frontend URL
    methods: ["GET", "POST"],
    credentials: true,
    origin: true
}));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.json("Hello");
  });

// Route to get all products
app.get('/getProducts', async (req, res) => {
    try {
        const products = await Products.find();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: error.message });
    }
});

// Wall detection route (updated for Replit)
// Add a route for wall detection
app.post('/detect-wall', async (req, res) => {
    try {
        const { image } = req.body;  // Expecting image data in the request body
        
        // Send image to the Python Flask server
        const response = await axios.post('https://14cf3993-0a8a-4fcc-a670-81d92d092b65-00-3ib9bcwcj2mzr.sisko.replit.dev/detect-wall', { image });
        
        if (response.data.wallDetected) {
            res.status(200).json({ wallDetected: true });
        } else {
            res.status(200).json({ wallDetected: false });
        }
    } catch (error) {
        console.error('Error detecting wall:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get single product
app.get('/getProduct/:productCode', async (req, res) => {
    try {
        const { productCode } = req.params;
        const product = await Products.findOne({ productCode });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get products by category
app.get('/getProductsByCategory/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const products = await Products.find({ category });
        if (!products) return res.status(404).json({ error: 'No products found' });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User Registration
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (!(name && email && password)) return res.status(400).send('All fields are compulsory!');

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(401).send('User already exists with this Email!');

    const encPass = await bcryptjs.hash(password, 10);
    const user = await User.create({ name, email, password: encPass });

    const token = jwt.sign({ id: user._id }, 'shhhh', { expiresIn: "2h" });
    user.token = token;
    user.password = undefined;

    res.status(201).json({ user, token });
});

// User Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!(email && password)) return res.status(400).send('All fields are compulsory!');

    try {
        const user = await User.findOne({ email });
        if (user && (await bcryptjs.compare(password, user.password))) {
            const token = jwt.sign({ id: user._id }, 'shhhh', { expiresIn: "2h" });
            user.token = token;
            user.password = undefined;

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            };
            return res.status(200).cookie("token", token, options).json({ success: true, token, user });
        } else {
            return res.status(400).send('Invalid credentials!');
        }
    } catch (error) {
        return res.status(500).send('Internal Server Error');
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
                name: `${token.card.first_name} ${token.card.last_name}`,
                address: {
                    country: token.card.country,
                    line1: token.card.address
                }
            }
        }, { idempotencyKey });

        res.status(200).json(charge);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}!`);
});
