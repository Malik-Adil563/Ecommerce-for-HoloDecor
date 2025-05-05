const mongoose = require('mongoose');


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
