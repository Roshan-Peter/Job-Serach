import AdminService from '../services/AdminService.js';
import ProfileService from '../services/ProfileService.js';
import UserService from '../services/UserService.js';

export default class ProfileController {
  // ─── show profile page ────────────────────────────────────────────────────
  static async showProfile(req, res) {
    try {
      const userId = req.session.user._id;
      const user = await UserService.findById(userId);
      const { profile, experience, education, jobs } = await ProfileService.getFullProfile(userId);

      return res.render('account/profile', {
        user: req.session.user,
        profile: profile || {},
        experience: experience || [],
        education: education || [],
        jobs: jobs || [],
        publicId: user.publicId,
        error: null,
        success: null,
      });
    } catch (err) {
      console.error('profile error', err);
      return res.status(500).render('error', { message: 'Failed to load profile' });
    }
  }

  // ─── update basic profile ─────────────────────────────────────────────────
  static async updateProfile(req, res) {
    try {
      await ProfileService.updateProfile(req.session.user._id, req.body);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ─── experience CRUD ──────────────────────────────────────────────────────
  static async addExperience(req, res) {
    try {
      const exp = await ProfileService.addExperience(req.session.user._id, req.body);
      return res.status(201).json({ success: true, data: exp });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async updateExperience(req, res) {
    try {
      const exp = await ProfileService.updateExperience(
        req.params.id,
        req.session.user._id,
        req.body
      );
      return res.json({ success: true, data: exp });
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  static async deleteExperience(req, res) {
    try {
      await ProfileService.deleteExperience(req.params.id, req.session.user._id);
      return res.json({ success: true });
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  // ─── education CRUD ───────────────────────────────────────────────────────
  static async addEducation(req, res) {
    try {
      const edu = await ProfileService.addEducation(req.session.user._id, req.body);
      return res.status(201).json({ success: true, data: edu });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async updateEducation(req, res) {
    try {
      const edu = await ProfileService.updateEducation(
        req.params.id,
        req.session.user._id,
        req.body
      );
      return res.json({ success: true, data: edu });
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  static async deleteEducation(req, res) {
    try {
      await ProfileService.deleteEducation(req.params.id, req.session.user._id);
      return res.json({ success: true });
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  // ─── jobs CRUD ────────────────────────────────────────────────────────────
  static async addJob(req, res) {
    try {
      const job = await ProfileService.addJob(req.session.user._id, req.body);
      return res.status(201).json({ success: true, data: job });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async updateJob(req, res) {
    try {
      const job = await ProfileService.updateJob(req.params.id, req.session.user._id, req.body);
      return res.json({ success: true, data: job });
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  static async deleteJob(req, res) {
    try {
      await ProfileService.deleteJob(req.params.id, req.session.user._id);
      return res.json({ success: true });
    } catch (err) {
      return res.status(err.status || 500).json({ error: err.message });
    }
  }

  static async getPublicProfile(req, res) {
    try {
      const { publicId } = req.params;

      const user = await UserService.findByPublicId(publicId);

      if (!user) {
        return res.status(404).render('404', {
          message: 'Profile not found',
        });
      }

      const Admin = await AdminService.findByUserId(user._id)

      if(Admin){
                return res.status(404).render('404', {
          message: 'Profile not found',
        });
      }

      const { profile, experience, education, jobs } = await ProfileService.getFullProfile(
        user._id
      );

      return res.render('public-profile.ejs', {
        userDetails: {
          name: user.name
        },
        profile: profile || {},
        experience: experience || [],
        education: education || [],
        jobs: jobs || [],
        publicId: user.publicId,
        error: null,
        success: null,
      });
    } catch (error) {
      console.error('Public profile error:', error);
      res.status(500).send('Server error');
    }
  }
}
