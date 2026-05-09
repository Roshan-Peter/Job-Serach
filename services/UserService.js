import User from '../models/User.js';
import bcrypt from 'bcrypt';
import { randomBytes } from "crypto";


const SALT_ROUNDS = 10;

export default class UserService {
  static async findAll({ limit = 50, skip = 0 } = {}) {
    return User.find().select('-password').limit(limit).skip(skip);
  }

  static async findById(id) {
    return User.findById(id).select('-password');
  }

  static async findByEmail(email) {
    return User.findOne({ email });
  }

  static async create({ name, email, password }) {
    const existing = await User.findOne({ email });
    if (existing) {
      const err = new Error('Email already in use');
      err.status = 409;
      throw err;
    }
    const publicId = await this.makePublicId();
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ name, email, password: hash, publicId });
    const obj = user.toObject();
    delete obj.password;
    return obj;
  }

  static async update(id, updates) {
    const data = { ...updates };
    if (data.email) {
      const existing = await User.findOne({ email: data.email, _id: { $ne: id } });
      if (existing) {
        const err = new Error('Email already in use');
        err.status = 409;
        throw err;
      }
    }
    if (data.password) {
      data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }
    const user = await User.findByIdAndUpdate(id, data, { new: true }).select('-password');
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return user;
  }

  static async remove(id) {
    const user = await User.findByIdAndDelete(id).select('-password');
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    return user;
  }

  // authenticate: returns user object without password on success
  static async authenticate(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }
    const obj = user.toObject();
    delete obj.password;
    return obj;
  }


  static async confirmEmail(email) {
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
    user.isEmailConfirmed = true;       
    user.emailConfirmedAt = new Date();  
    await user.save();
    const obj = user.toObject();
    delete obj.password;
    return obj;
  }



  static async makePublicId() {
  const random = randomBytes(4).toString('hex').toUpperCase(); // 8‑hex chars
  const time   = Date.now().toString(36).toUpperCase();        // compact timestamp
  return `USR-${time}-${random}`;
}
}
