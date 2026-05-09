import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  userId:    {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
    unique:   true,   // one admin record per user
  },
  addedBy:   {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    default:  null,   // null = seeded via script
  },
  role:      {
    type:     String,
    enum:     ['super_admin', 'admin', 'moderator'],
    default:  'admin',
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Admin || mongoose.model('Admin', adminSchema);