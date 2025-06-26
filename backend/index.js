const express = require('express');
const cors = require('cors');
const { run } = require('./models/mongo.js');
run();
const Products = require('./models/products.js');
const User = require('./models/Users.js');
const PaymentHistory = require('./models/PaymentHistory.js');
const Subscriber = require('./models/Subscriber.js');
const ContactMessage = require('./models/ContactMessage.js');
const Notification = require('./models/Notification.js');
const Admin = require('./models/Admin.js');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
const stripe = require("stripe")("sk_test_51PkqswRqTY1bRAbmAOPcjettpFGO7bYrOQPOgKfsmIbmz4kVPyRyEug8QX7LTISynPofxC6I5VSmOI6oqT3IIObQ00c0wnhs55");
const { v4: uuid } = require("uuid");
const axios = require('axios');
const app = express();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const http = require('http');
const { Server } = require('socket.io');
const otpStore = new Map();

const port = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ["http://localhost:3000", "https://holo-decor-ar-frontend.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
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
    if (!(name && email && password)) {
      return res.status(400).send("All fields are compulsory!");
    }
  
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(401).send("User already exists with this Email!");
  
      const encPass = await bcryptjs.hash(password, 10);
      const user = await User.create({ name, email, password: encPass });
  
      const token = jwt.sign({ id: user._id }, 'shhhh', { expiresIn: "2h" });
      user.token = token;
      user.password = undefined;
  
      // ✅ Setup transporter (fixed)
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
        user: 'holodecor7@gmail.com',
        pass: 'ovdtkfdzboilbmpy'
      }
      });
      const mailOptions = {
        from: 'HoloDecor <holodecor@gmail.com>',
        to: email,
        subject: '🎉 Welcome to HoloDecor!',
        html: `
          <h2>Welcome to HoloDecor, ${name}!</h2>
          <p>We're thrilled to have you on board. Here's what you can do on our platform:</p>
          <ul>
            <li>🛋️ Browse and purchase 3D furniture and decor items</li>
            <li>📱 Visualize items in your room using Augmented Reality (AR)</li>
            <li>🛒 Track orders </li>
            <li>🤖 Get personalized recommendations from our built-in AI chatbot</li>
            <li>⚡ Receive updates on latest offers and seasonal discounts</li>
          </ul>
          <p>Start exploring at <a href="https://holo-decor-ar-frontend.vercel.app/">HoloDecor</a></p>
          <br />
          <p>Happy decorating! ✨</p>
          <p>— Team HoloDecor</p>
        `
      };
  
      try {
        await transporter.sendMail(mailOptions);
      } catch (emailErr) {
        console.error("Error sending welcome email:", emailErr);
      }
  
      res.status(201).json({ user, token });
    } catch (err) {
      console.error(err);
      res.status(500).send("Something went wrong");
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

//Send reset link
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
        user: 'holodecor7@gmail.com',
        pass: 'ovdtkfdzboilbmpy'
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

//Reset password using token
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

//OTP Verification
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send("Email is required");

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 mins

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: 'holodecor7@gmail.com',
        pass: 'ovdtkfdzboilbmpy'
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

//verify otp
app.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    const stored = otpStore.get(email);
  
    if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
      return res.status(400).send("Invalid or expired OTP");
    }
  
    otpStore.delete(email);
    res.json({ success: true });
  });
  
// Get all users
app.get('/getAllUsers', async (req, res) => {
  const users = await User.find({}, '-password');
  res.json(users);
});

// Delete user
app.delete('/deleteUser/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.send('User deleted');
});

// Delete product
app.delete('/deleteProduct/:id', async (req, res) => {
  await Products.findByIdAndDelete(req.params.id);
  res.send('Product deleted');
});

// Update product
app.put('/updateProduct/:id', async (req, res) => {
  try {
    const updated = await Products.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update User
app.put('/updateUser/:id', async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send promotion to all users and subscribers
app.post('/sendPromotionToAllUsers', async (req, res) => {
  const { title, message } = req.body;

  try {
    const users = await User.find({}, 'email');
    const subscribers = await Subscriber.find({}, 'email');

    const allEmails = [
      ...new Set([
        ...users.map(u => u.email),
        ...subscribers.map(s => s.email)
      ])
    ];

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'holodecor7@gmail.com',
        pass: 'ovdtkfdzboilbmpy'
      }
    });

    for (const email of allEmails) {
      await transporter.sendMail({
        from: 'HoloDecor <holodecor@gmail.com>',
        to: email,
        subject: title,
        html: `<p>${message}</p>`
      });
    }

    res.send('Promotions sent to all users and subscribers');
  } catch (error) {
    console.error('Error sending promotions:', error);
    res.status(500).json({ error: 'Failed to send promotions' });
  }
});

//subscribers
app.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!email || !isValidEmail) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already subscribed' });
    }
    const subscriber = new Subscriber({ email });
    const saved = await subscriber.save();
    res.status(200).json(saved);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//fetching payment history
app.get('/getAllPayments', async (req, res) => {
  try {
    const records = await PaymentHistory.find();
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//deleting payment history
app.delete('/deletePayment/:id', async (req, res) => {
  try {
    await PaymentHistory.findByIdAndDelete(req.params.id);
    res.send('Payment record deleted');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//updating payment record
app.put('/updatePayment/:id', async (req, res) => {
  try {
    const updated = await PaymentHistory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//fetching subscribers
app.get('/getAllSubscribers', async (req, res) => {
  try {
    const subscribers = await Subscriber.find();
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//deleting subscribers
app.delete('/deleteSubscriber/:id', async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id);
    res.send('Subscriber deleted');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//updating subscribers
app.put('/updateSubscriber/:id', async (req, res) => {
  try {
    const updated = await Subscriber.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//saving message from contact us page
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const saved = await ContactMessage.create({ name, email, message });
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//fetching contact messages
app.get('/getAllMessages', async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//replying to contact messages
app.post('/replyMessage/:id', async (req, res) => {
  const { id } = req.params;
  const { replyMessage } = req.body;

  try {
    const message = await ContactMessage.findById(id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'holodecor7@gmail.com',
        pass: 'ovdtkfdzboilbmpy'
      }
    });

    await transporter.sendMail({
      from: 'HoloDecor <holodecor@gmail.com>',
      to: message.email,
      subject: 'Reply to your contact message',
      html: `<p>Dear ${message.name},</p><p>${replyMessage}</p><br><p>Best regards,<br>HoloDecor Support</p>`
    });

    // Update message status
    message.replied = true;
    message.replyMessage = replyMessage;
    await message.save();

    res.json({ success: true, message: 'Reply sent and saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//fetching admins
app.get('/getAdmins', async (req, res) => {
  try {
    const admins = await Admin.find().select('-__v'); // exclude __v field
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//adding product
app.post('/addProduct', async (req, res) => {
  const { title, price, image, description, category, productCode } = req.body;

  try {
    const newProduct = await Products.create({
      title,
      price,
      image,
      description,
      category,
      productCode
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: error.message });
  }
});

//posting real-time notifications
app.post('/sendNotification', async (req, res) => {
  const { title, message } = req.body;
  try {
    const newNotif = await Notification.create({ title, message });
    const io = req.app.get("io");
    io.emit('new-notification', newNotif);
    res.status(201).json(newNotif);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//fetching notifications
app.get('/getNotifications', async (req, res) => {
  try {
    const notifs = await Notification.find().sort({ createdAt: -1 });
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change Password after Login
app.post('/change-password', async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Wrong current password' });

    user.password = await bcryptjs.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

//change password by admin route
app.put('/changeUserPassword/:id', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(id, { password }, { new: true });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Stripe Payment
app.post("/payment", async (req, res) => {
  const { product, token, firstName, lastName, email, country, address } = req.body;
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
        name: `${firstName} ${lastName}`,
        address: {
          line1: address,
          country: country
        }
      }
    }, { idempotencyKey });
    const paymentRecord = new PaymentHistory({
      firstName,
      lastName,
      email,
      address,
      country,
      product,
      stripeTokenId: token.id,
    });

    await paymentRecord.save();

    res.status(200).json({ message: "Payment successful and saved", charge });

  } catch (err) {
    console.error("Payment error:", err.message);
    res.status(500).json({ error: err.message });
  }
});
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://holo-decor-ar-frontend.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});
app.set("io", io);
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}!`);
});