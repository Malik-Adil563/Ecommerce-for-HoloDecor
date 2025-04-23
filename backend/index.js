const express = require('express');
const cors = require('cors');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
const stripe = require("stripe")("sk_test_51PkqswRqTY1bRAbmAOPcjettpFGO7bYrOQPOgKfsmIbmz4kVPyRyEug8QX7LTISynPofxC6I5VSmOI6oqT3IIObQ00c0wnhs55");
const { v4: uuid } = require("uuid");

const Products = require('./models/Products');
const User = require('./models/users');

const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');
const { createCanvas, loadImage } = require('canvas');

const app = express();
const port = 8000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(cookieParser());

let model;

// Load MobileNet model from @tensorflow-models/mobilenet
const loadModel = async () => {
    model = await mobilenet.load({ version: 2, alpha: 1.0 });
    console.log('MobileNet model loaded');
};
loadModel();

// Route to check if image contains a wall
app.post('/check-wall', async (req, res) => {
    try {
        const imageData = req.body.image;
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const image = await loadImage(buffer);
        const canvas = createCanvas(224, 224);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, 224, 224);

        const input = tf.browser.fromPixels(canvas);
        const batched = input.expandDims(0).toFloat().div(tf.scalar(127)).sub(tf.scalar(1));

        const predictions = await model.classify(batched);
        console.log('Predictions:', predictions);

        // Example class indexes that may represent wall-like objects
        const wallClasses = [401, 894, 721, 701, 819]; // Replace with actual if needed

        const isWall = predictions.some(prediction => wallClasses.includes(prediction.classId));

        res.json({ isWall });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to process image' });
    }
});

// Routes for Products
app.get('/getProducts', async (req, res) => {
    try {
        const products = await Products.find();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/getProduct/:productCode', async (req, res) => {
    try {
        const { productCode } = req.params;
        const product = await Products.findOne({ productCode });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/getProductsByCategory/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const products = await Products.find({ category });
        if (!products) return res.status(404).json({ error: 'No products found' });
        res.json(products);
    } catch (error) {
        console.error('Error fetching products by category:', error);
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
        console.error('Error during login:', error);
        return res.status(500).send('Internal Server Error');
    }
});

// Payment Route
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
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}!`);
});