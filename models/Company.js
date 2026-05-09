import mongoose from "mongoose";
import { randomBytes } from "crypto";

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  website: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^[0-9+\-\s()]{7,20}$/.test(v);
      },
      message: "Invalid phone number format"
    }
  },
  industry: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: String,
    required: true,
    enum: ["1-10", "11-50", "51-200", "201-500", "500+"]
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    minlength: 20
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  publicId: {
    type: String,
    unique: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ async hook, no next parameter needed
companySchema.pre("save", async function () {
  if (!this.publicId) {
    const random = randomBytes(4).toString("hex").toUpperCase();
    const time   = Date.now().toString(36).toUpperCase();
    this.publicId = `CMP-${time}-${random}`;
  }
});

export default mongoose.model("Company", companySchema);