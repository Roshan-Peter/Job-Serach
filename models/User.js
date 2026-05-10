import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  isEmailConfirmed: { type: Boolean, default: false },
  emailConfirmedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  publicId: {
    type: String,
    unique: true,
    index: true,
  },

  twoFactorSecret: { type: String, default: null }, // TOTP secret
  twoFactorEnabled: { type: Boolean, default: false },
});

export default mongoose.models.User || mongoose.model('User', userSchema);
