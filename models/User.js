import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, 
  isEmailConfirmed: { type: Boolean, default: false },    // <- new
  emailConfirmedAt: { type: Date, default: null }, 
  createdAt: { type: Date, default: Date.now },
    publicId: {
    type: String,
    unique: true,
    index: true
  },
});


export default mongoose.models.User || mongoose.model('User', userSchema);