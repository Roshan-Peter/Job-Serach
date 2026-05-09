import LoginLog from '../models/LoginLog.js';

export default class LoginLogService {
  static async record({ email, userId = null, status, reason = null, req }) {
    try {
      await LoginLog.create({
        email,
        userId,
        status,
        reason,
        ip: req.ip || req.headers['x-forwarded-for'] || null,
        userAgent: req.headers['user-agent'] || null,
      });
    } catch (err) {
      // never let logging break the auth flow
      console.error('LoginLogService.record error:', err);
    }
  }

  static async findByUser(userId, { limit = 20 } = {}) {
    return LoginLog.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  }

  static async findAll({ limit = 50, skip = 0 } = {}) {
    return LoginLog.find().sort({ createdAt: -1 }).limit(limit).skip(skip);
  }
}
