import mongoose from 'mongoose';

const loginLogSchema = new mongoose.Schema({
  email:     { type: String, required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status:    { type: String, enum: ['success', 'failed'], required: true },
  reason:    { type: String, default: null },       // why it failed
  ip:        { type: String, default: null },
  userAgent: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

// auto-delete logs older than 90 days
loginLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export default mongoose.models.LoginLog || mongoose.model('LoginLog', loginLogSchema);