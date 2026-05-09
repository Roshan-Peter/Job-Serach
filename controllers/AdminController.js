import User         from '../models/User.js';
import Job          from '../models/Job.js';
import AdminService from '../services/AdminService.js';
import LoginLogService from '../services/LoginLogService.js';

export default class AdminController {

  static async showDashboard(req, res) {
    try {
      const [users, jobs, logs, admins] = await Promise.all([
        User.find().select('-password').sort({ createdAt: -1 }).limit(10),
        Job.find().populate('postedBy', 'name email').sort({ createdAt: -1 }).limit(10),
        LoginLogService.findAll({ limit: 10 }),
        AdminService.findAll(),
      ]);
      const [totalUsers, totalJobs] = await Promise.all([
        User.countDocuments(),
        Job.countDocuments(),
      ]);
      return res.render('admin/dashboard', {
        user: req.session.user,
        users, jobs, logs, admins,
        stats: { totalUsers, totalJobs, totalAdmins: admins.length },
      });
    } catch (err) {
      console.error('admin dashboard error', err);
      return res.status(500).render('error', { message: 'Failed to load admin dashboard' });
    }
  }

  // ─── users ────────────────────────────────────────────────────────────────
  static async listUsers(req, res) {
    try {
      const [users, adminRecords] = await Promise.all([
        User.find().select('-password').sort({ createdAt: -1 }),
        AdminService.findAll(),
      ]);
      // map userId → adminRecord for quick lookup in the view
      const adminMap = {};
      adminRecords.forEach(a => { adminMap[String(a.userId._id)] = a; });
      return res.render('admin/users', { user: req.session.user, users, adminMap });
    } catch (err) {
      return res.status(500).render('error', { message: 'Failed to load users' });
    }
  }

  static async deleteUser(req, res) {
    try {
      if (String(req.params.id) === String(req.session.user._id)) {
        return res.status(400).json({ error: 'You cannot delete yourself' });
      }
      await User.findByIdAndDelete(req.params.id);
      // also remove from admin table if present
      await AdminService.remove(req.params.id, req.session.user._id).catch(() => {});
      return res.redirect('/admin/users');
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  // ─── admin management ─────────────────────────────────────────────────────
  static async listAdmins(req, res) {
    try {
      const [admins, users] = await Promise.all([
        AdminService.findAll(),
        User.find().select('name email').sort({ name: 1 }),
      ]);
      return res.render('admin/admins', {
        user: req.session.user,
        admins,
        users,
        error: null,
        success: null,
      });
    } catch (err) {
      return res.status(500).render('error', { message: 'Failed to load admins' });
    }
  }

  static async addAdmin(req, res) {
    const { userId, role } = req.body || {};
    try {
      await AdminService.add({
        userId,
        addedBy: req.session.user._id,
        role: role || 'admin',
      });
      const [admins, users] = await Promise.all([
        AdminService.findAll(),
        User.find().select('name email').sort({ name: 1 }),
      ]);
      return res.render('admin/admins', {
        user: req.session.user, admins, users,
        error: null, success: 'Admin added successfully',
      });
    } catch (err) {
      const [admins, users] = await Promise.all([
        AdminService.findAll(),
        User.find().select('name email').sort({ name: 1 }),
      ]);
      return res.render('admin/admins', {
        user: req.session.user, admins, users,
        error: err.message, success: null,
      });
    }
  }

  static async removeAdmin(req, res) {
    try {
      await AdminService.remove(req.params.userId, req.session.user._id);
      return res.redirect('/admin/admins');
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  static async updateRole(req, res) {
    const { role } = req.body || {};
    try {
      await AdminService.updateRole(req.params.userId, role);
      return res.json({ success: true });
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  // ─── jobs ─────────────────────────────────────────────────────────────────
  static async listJobs(req, res) {
    try {
      const jobs = await Job.find().populate('postedBy', 'name email').sort({ createdAt: -1 });
      return res.render('admin/jobs', { user: req.session.user, jobs });
    } catch (err) {
      return res.status(500).render('error', { message: 'Failed to load jobs' });
    }
  }

  static async deleteJob(req, res) {
    try {
      await Job.findByIdAndDelete(req.params.id);
      return res.redirect('/admin/jobs');
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}