const mongoose = require('mongoose');

// Connect to the MongoDB cluster and specify the database 'adilm09'
mongoose.connect('mongodb+srv://adilm09:Camb786@cluster0.kb3vcsh.mongodb.net/internee/ecommerce?retryWrites=true&w=majority')
  .then(() => {
    console.log('Connected to MongoDB products');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

// Define the schema for the 'users' collection
const userSchema = new mongoose.Schema({
    name:{
        type : String,
        required : true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }, 
    token:{
        type: String,
        default: null
    }
}, {timestamps: true})

const User = mongoose.model("User", userSchema, 'users');

module.exports = User;
