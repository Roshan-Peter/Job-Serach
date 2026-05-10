import ProfileService from '../services/ProfileService.js';
import ResumeService from '../services/ResumeService.js';

export default class ResumeController {
  static async createPage(req, res) {
    try {
      const user = req.session.user;

      if (!user) {
        return res.redirect('/login');
      }

      return res.render('resume/create', {
        user,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
  static async create(req, res) {
    try {
      const user = req.session.user;

      if (!user) {
        return res.status(401).json({ error: 'Login required' });
      }


      const resume = await ResumeService.createResume(user._id, req.body);

      return res.json({
        success: true,
        resume,
      });
    } catch (error) {
      console.error('Resume Create Error:', error);

      return res.status(500).json({
        error: error.message || 'Server error',
      });
    }
  }

  static async myResumes(req, res) {
    try {
      const user = req.session.user;

      const resumes = await ResumeService.getUserResumes(user._id);

      res.render('resume/my-resumes', {
        user,
        resumes,
      });
    } catch (err) {
      res.status(500).send('Server error');
    }
  }

  static async single(req, res) {
    try {
      const resume = await ResumeService.getResumeById(req.params.id);

      const profile = await ProfileService.getFullProfile(req.session.user._id)
      res.render('resume/view', {
        headline: profile.profile.headline,
        userName: req.session.user.name,
        resume,
      });
    } catch (err) {
      res.status(500).send('Server error');
    }
  }

  static async delete(req, res) {
    try {
      const user = req.session.user;

      if (!user) {
        return res.status(401).json({ error: 'Login required' });
      }

      const resumeId = req.params.id;

      const resume = await ResumeService.findOne(resumeId, user);

      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }

      await ResumeService.deleteResume(resumeId, user._id);

      return res.json({
        success: true,
        message: 'Resume deleted',
      });
    } catch (err) {
      return res.status(500).json({
        error: err.message,
      });
    }
  }
}
