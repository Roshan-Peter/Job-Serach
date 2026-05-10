import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  userId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
    unique:   true,
  },
  headline:  { type: String, default: '', trim: true },
  bio:       { type: String, default: '', trim: true },
  location:  { type: String, default: '', trim: true },
  website:   { type: String, default: '', trim: true },
  phone:     { type: String, default: '', trim: true },
  avatar:    { type: String, default: null },  // url or base64
  skills:    [{ type: String, trim: true }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

profileSchema.pre('save', async function () {
  this.updatedAt = new Date();
});

export default mongoose.models.Profile || mongoose.model('Profile', profileSchema);