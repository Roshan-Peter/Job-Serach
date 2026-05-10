import mongoose from 'mongoose';

const JobApplySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
jobId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Job',
  required: true,
},
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  url: { type: String, required: false, trim: true },
  number: { type: String, required: false, trim: true },

coverLetter: {
  type: String,
  required: false,
  trim: true
},

status: {
  type: String,
  enum: ["pending", "reviewed", "accepted", "rejected"],
  default: "pending"
},

  resumeId: {
    type:    mongoose.Schema.Types.ObjectId,
    ref:     'Resume',
    default: null,
  },
  createdAt: { type: Date, default: Date.now },
});

JobApplySchema.index(
  { userId: 1, jobId: 1 },
  { unique: true }
);

export default mongoose.models.JobApply || mongoose.model('JobApply', JobApplySchema);
