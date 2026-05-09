import User            from '../models/User.js';
import Job             from '../models/Job.js';
import AdminService    from '../services/AdminService.js';
import LoginLogService from '../services/LoginLogService.js';
import CompanyService  from '../services/CompanyService.js';

export default class AdminController {

  static async showDashboard(req, res) {
    try {
      const [users, jobs, logs, admins, companyCounts] = await Promise.all([
        User.find().select('-password').sort({ createdAt: -1 }).limit(10),
        Job.find().populate('postedBy', 'name email').sort({ createdAt: -1 }).limit(10),
        LoginLogService.findAll({ limit: 10 }),
        AdminService.findAll(),
        CompanyService.countByStatus(),
      ]);
      const [totalUsers, totalJobs] = await Promise.all([
        User.countDocuments(),
        Job.countDocuments(),
      ]);
      return res.render('admin/dashboard', {
        user: req.session.user,
        users, jobs, logs, admins,
        stats: {
          totalUsers,
          totalJobs,
          totalAdmins:   admins.length,
          totalCompanies: companyCounts.total,
          pendingCompanies: companyCounts.pending,
        },
        companyCounts,
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
        user: req.session.user, admins, users, error: null, success: null,
      });
    } catch (err) {
      return res.status(500).render('error', { message: 'Failed to load admins' });
    }
  }

  static async addAdmin(req, res) {
    const { userId, role } = req.body || {};
    try {
      await AdminService.add({ userId, addedBy: req.session.user._id, role: role || 'admin' });
      const [admins, users] = await Promise.all([
        AdminService.findAll(),
        User.find().select('name email').sort({ name: 1 }),
      ]);
      return res.render('admin/admins', {
        user: req.session.user, admins, users, error: null, success: 'Admin added successfully',
      });
    } catch (err) {
      const [admins, users] = await Promise.all([
        AdminService.findAll(),
        User.find().select('name email').sort({ name: 1 }),
      ]);
      return res.render('admin/admins', {
        user: req.session.user, admins, users, error: err.message, success: null,
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

  // ─── companies ────────────────────────────────────────────────────────────
  static async listCompanies(req, res) {
    try {
      const { status } = req.query; // ?status=pending|approved|rejected
      const [companies, counts] = await Promise.all([
        CompanyService.findAll({ status: status || null }),
        CompanyService.countByStatus(),
      ]);
      return res.render('admin/companies', {
        user: req.session.user,
        companies,
        counts,
        currentStatus: status || 'all',
      });
    } catch (err) {
      return res.status(500).render('error', { message: 'Failed to load companies' });
    }
  }

  static async showCompany(req, res) {
    try {
      const company = await CompanyService.findById(req.params.id);
      if (!company) return res.status(404).render('error', { message: 'Company not found' });
      return res.render('admin/company-detail', {
        user: req.session.user,
        company,
        error:   null,
        success: null,
      });
    } catch (err) {
      return res.status(500).render('error', { message: 'Failed to load company' });
    }
  }

  // ✅ approve
  static async approveCompany(req, res) {
    try {
      await CompanyService.updateStatus(req.params.id, { status: 'approved' });
      return res.json({ success: true, status: 'approved' });
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  // ✅ reject
  static async rejectCompany(req, res) {
    const { reason } = req.body || {};
    try {
      if (!reason || !reason.trim()) {
        return res.status(400).json({ error: 'Rejection reason is required' });
      }
      await CompanyService.updateStatus(req.params.id, {
        status: 'rejected',
        rejectionReason: reason.trim(),
      });
      return res.json({ success: true, status: 'rejected' });
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }
}