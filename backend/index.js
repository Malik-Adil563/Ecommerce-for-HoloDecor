const express = require('express');
const cors = require('cors');
const { run } = require('./models/mongo.js');
run();
const Products = require('./models/products.js');
const User = require('./models/Users.js');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
const stripe = require("stripe")("sk_test_51PkqswRqTY1bRAbmAOPcjettpFGO7bYrOQPOgKfsmIbmz4kVPyRyEug8QX7LTISynPofxC6I5VSmOI6oqT3IIObQ00c0wnhs55");
const { v4: uuid } = require("uuid");
const axios = require('axios');
const app = express();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const otpStore = new Map();

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
  
    // Send Welcome Email
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "holodecor@gmail.com",
          pass: "fyatolmfruarvbkw" // Use your Gmail App Password
        }
      });
  
      const mailOptions = {
        from: 'HoloDecor <holodecor@gmail.com>',
        to: email,
        subject: '🎉 Welcome to HoloDecor!',
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2 style="color: #4CAF50;">Welcome to HoloDecor, ${name}!</h2>
            <p>We’re thrilled to have you on board. Here’s what you can now enjoy:</p>
            <ul>
              <li>🛋️ Explore stylish decor items right from your home.</li>
              <li>📱 Use AR to visualize furniture directly in your space.</li>
              <li>🖼️ Wall detection lets you preview items like paintings before buying.</li>
              <li>💬 Ask our intelligent chatbot for smart recommendations.</li>
              <li>💳 Shop easily with secure Stripe payments.</li>
              <li>📦 Track orders and manage your decor journey from your dashboard.</li>
            </ul>
            <p style="margin-top: 20px;">Start exploring now: <a href="https://holo-decor-ar-frontend.vercel.app/">Visit HoloDecor</a></p>
            <p>Happy decorating!<br><strong>— The HoloDecor Team</strong></p>
          </div>
        `
      };
  
      await transporter.sendMail(mailOptions);
      console.log("Welcome email sent!");
    } catch (err) {
      console.error("Error sending welcome email:", err);
    }
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

// Step 1: Send reset link
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found!");

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `https://holo-decor-ar-frontend.vercel.app/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "holodecor@gmail.com",
        pass: "fyatolmfruarvbkw" // Use app password, not your actual Gmail password
      }
    });

    const mailOptions = {
      from: 'HoloDecor <yourgmail@gmail.com>',
      to: email,
      subject: 'Reset Your Password',
      html: `<p>Hi ${user.name},</p><p>Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link will expire in 1 hour.</p>`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Reset link sent to your email!" });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending reset link");
  }
});

// Step 2: Reset password using token
app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).send("Invalid or expired token");

    user.password = await bcryptjs.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to reset password");
  }
});

//OTP Verficivation
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send("Email is required");

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 mins

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "holodecor@gmail.com",
        pass: "fyatolmfruarvbkw" // App password
      }
    });

    await transporter.sendMail({
      from: 'HoloDecor <holodecor@gmail.com>',
      to: email,
      subject: 'Your OTP Code',
      html: `<h3>Your OTP is: ${otp}</h3><p>It expires in 5 minutes.</p>`
    });

    res.json({ message: "OTP sent to your email!" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to send OTP");
  }
});

app.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    const stored = otpStore.get(email);
  
    if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
      return res.status(400).send("Invalid or expired OTP");
    }
  
    otpStore.delete(email);
    res.json({ success: true });
  });

  app.get("/test-email", async (req, res) => {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "holodecor@gmail.com",
          pass: "fyatolmfruarvbkw"
        }
      });
  
      await transporter.sendMail({
        from: "HoloDecor <holodecor@gmail.com>",
        to: "adilmalik6734@gmail.com",
        subject: "Test Email",
        html: "<h2>Welcome to HoloDecor!</h2><p>This is a test email.</p>"
      });
  
      res.send("✅ Test email sent");
    } catch (err) {
      console.error("❌ Email error:", err);
      res.status(500).send("❌ Failed to send test email");
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
