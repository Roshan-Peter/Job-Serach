import Admin from '../models/Admin.js';
import User  from '../models/User.js';

export default class AdminService {

  // check if a userId is in the admin table
  static async isAdmin(userId) {
    const record = await Admin.findOne({ userId });
    return !!record;
  }

  // get full admin record with user details
  static async findByUserId(userId) {
    return Admin.findOne({ userId }).populate('userId', 'name email isEmailConfirmed createdAt');
  }

  // list all admins
  static async findAll() {
    return Admin.find()
      .populate('userId',  'name email isEmailConfirmed createdAt')
      .populate('addedBy', 'name email')
      .sort({ createdAt: -1 });
  }

  // add a user as admin by their userId
  static async add({ userId, addedBy = null, role = 'admin' }) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    const existing = await Admin.findOne({ userId });
    if (existing) {
      const err = new Error('User is already an admin');
      err.status = 409;
      throw err;
    }

    return Admin.create({ userId, addedBy, role });
  }

  // remove admin by userId
  static async remove(userId, requesterId) {
    if (String(userId) === String(requesterId)) {
      const err = new Error('You cannot remove yourself from admin');
      err.status = 400;
      throw err;
    }
    const record = await Admin.findOneAndDelete({ userId });
    if (!record) {
      const err = new Error('Admin record not found');
      err.status = 404;
      throw err;
    }
    return record;
  }

  // update role
  static async updateRole(userId, role) {
    const record = await Admin.findOneAndUpdate(
      { userId },
      { role },
      { new: true }
    ).populate('userId', 'name email');
    if (!record) {
      const err = new Error('Admin record not found');
      err.status = 404;
      throw err;
    }
    return record;
  }
}