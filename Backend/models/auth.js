import mongoose from 'mongoose';
import User from '../models/user.js'; // Import User model to ensure it exists
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,        // no duplicate usernames
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


export default User;