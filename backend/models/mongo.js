// mongo.js
const mongoose = require('mongoose');

const uri = "mongodb+srv://madil4329:Camb673adil@holodecorcluster.d6sp8jk.mongodb.net/Ecommerce?retryWrites=true&w=majority&appName=holodecorcluster";

async function run() {
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected successfully.");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err?.cause || err);
    process.exit(1);
  }
}

module.exports = { run };
