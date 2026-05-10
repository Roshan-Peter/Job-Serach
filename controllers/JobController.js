import JobApplyService from '../services/JobApplyService.js';
import JobService from '../services/JobService.js';
import ProfileService from '../services/ProfileService.js';
import ResumeService from '../services/ResumeService.js';
import UserService from '../services/UserService.js';

export default class JobController {

  // ─── list all jobs (public) ───────────────────────────────────────────────
  static async index(req, res) {
    try {
      const jobs = await JobService.findAll();
      return res.render('jobs/index', { jobs, user: req.session.user || null });
    } catch (err) {
      console.error('jobs index error', err);
      return res.status(500).render('error', { message: 'Failed to load jobs' });
    }
  }

  // ─── show single job ──────────────────────────────────────────────────────
  static async show(req, res) {
    try {
      const job = await JobService.findById(req.params.id);
      if (!job) return res.status(404).render('error', { message: 'Job not found' });
            let resumes = [];
      let hasApplied = false;

      if (req.session.user) {
        const JobApplyService = (await import('../services/JobApplyService.js')).default;
        const ResumeService   = (await import('../services/ResumeService.js')).default;

        [resumes, hasApplied] = await Promise.all([
          ResumeService.getUserResumes(req.session.user._id),
          JobApplyService.hasUserApplied(req.session.user._id, job._id),
        ]);
      }

      const pid = await UserService.findByEmail(job.postedBy.email)

      return res.render('jobs/show', {
        publicId: pid.publicId,
        job,
        user:       req.session.user || null,
        resumes,     
        hasApplied,   
      });
    } catch (err) {
      console.error('job show error', err);
      return res.status(500).render('error', { message: 'Failed to load job' });
    }
  }

  // ─── create form ──────────────────────────────────────────────────────────
  static showCreate(req, res) {
    return res.render('jobs/create', { error: null, form: {} });
  }

 static async create(req, res) {
    const isJson = req.headers.accept?.includes('application/json');
    const {
      title, company, location, type, experience,
      salaryMin, salaryMax, salaryCurrency, salaryPeriod,
      description, requirements, skills,
      applyType, externalUrl,
    } = req.body || {};

    const form = { title, company, location, type, experience, salaryMin, salaryMax, salaryCurrency, salaryPeriod, description, requirements, skills, applyType, externalUrl };

    try {
      if (!title || !company || !location || !type || !experience || !description || !applyType) {
        const message = 'Please fill in all required fields';
        if (isJson) return res.status(400).json({ error: message });
        return res.status(400).render('jobs/create', { error: message, form });
      }

      if (applyType === 'external' && !externalUrl) {
        const message = 'External apply URL is required';
        if (isJson) return res.status(400).json({ error: message });
        return res.status(400).render('jobs/create', { error: message, form });
      }

      const requirementsArr = requirements
        ? requirements.split('\n').map(r => r.trim()).filter(Boolean) : [];
      const skillsArr = skills
        ? skills.split(',').map(s => s.trim()).filter(Boolean) : [];

      const job = await JobService.create({
        title, company, location, type, experience,
        salary: {
          min:      salaryMin      ? Number(salaryMin)  : null,
          max:      salaryMax      ? Number(salaryMax)  : null,
          currency: salaryCurrency || 'USD',
          period:   salaryPeriod   || 'yearly',
        },
        description,
        requirements: requirementsArr,
        skills:       skillsArr,
        applyType,
        externalUrl:  applyType === 'external' ? externalUrl : null,
        postedBy:     req.session.user._id,
      });

      if (isJson) return res.status(201).json({ success: true, redirect: `/jobs/${job._id}` });
      return res.redirect(`/jobs/${job._id}`);
    } catch (err) {
      console.error('job create error', err);
      const message = err.message || 'Failed to create job posting';
      if (isJson) return res.status(500).json({ error: message });
      return res.status(500).render('jobs/create', { error: message, form });
    }
  }

  // ─── delete ───────────────────────────────────────────────────────────────
  static async remove(req, res) {
    try {
      await JobService.remove(req.params.id, req.session.user._id);
      return res.redirect('/dashboard');
    } catch (err) {
      console.error('job delete error', err);
      return res.status(err.status || 500).json({ error: err.message });
    }
  }


 static async applyForJob(req, res) {
  try {

    const user = req.session.user;

    if (!user) {
      return res.status(401).json({
        error: 'Login required'
      });
    }

    console.log(user)

    if (!req.params.id) {
      return res.status(400).json({
        error: "Job ID missing in URL"
      });
    }

    const application = await JobApplyService.applyForJob({
      userId: user._id,
      jobId: req.params.id,   // MUST NOT be undefined
      ...req.body,
    });

    return res.json({
      success: true,
      message: 'Application submitted',
      application,
    });

  } catch (error) {

    return res.status(error.status || 500).json({
      error: error.message || 'Server error'
    });

  }
}

static async getMyApplications(req, res) {
  try {

    const user = req.session.user;

    if (!user) {
      return res.status(401).json({ error: 'Login required' });
    }

    const applications =
      await JobApplyService.getUserApplications(user._id);

    return res.json({
      success: true,
      applications,
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Server error'
    });
  }
}


static async myJobPostings(req,res) {
 try {

      const user = req.session.user;

      if (!user) {
        return res.status(401).render("404", {
          message: "Login required"
        });
      }

      const jobs = await JobApplyService.getPostedJobs(user)

      return res.render("account/my-jobs-posting", {
        user,
        jobs
      });

    } catch (error) {
      console.error("My Job Postings Error:", error);
      return res.status(500).send("Server error");
    }
  }



  static async viewApplicants(req, res) {
    try {

      const user = req.session.user;

      if (!user) {
        return res.status(401).render("404", {
          message: "Login required"
        });
      }

      const jobId = req.params.id;

      const job =  JobService.findJob(jobId, user)

      if (!job) {
        return res.status(403).render("404", {
          message: "Unauthorized or Job not found"
        });
      }

      const applications =
        await JobApplyService.getJobApplications(jobId);

      return res.render("account/job-applicants", {
        user,
        job,
        applications
      });

    } catch (error) {
      console.error("View Applicants Error:", error);
      return res.status(500).send("Server error");
    }
  }



  static async viewApplicationDetail(req, res) {
    try {

      const user = req.session.user;

      if (!user) {
        return res.status(401).render("404", {
          message: "Login required"
        });
      }

      const application =
        await JobApplyService.getApplicationById(req.params.id);

      if (!application) {
        return res.status(404).render("404", {
          message: "Application not found"
        });
      }

      // Only job owner can view
      if (application.jobId.postedBy.toString() !== user._id.toString()) {
        return res.status(403).render("404", {
          message: "Unauthorized"
        });
      }


      return res.render("account/application-detail", {
        user,
        app: application
      });

    } catch (error) {
      console.error("Application Detail Error:", error);
      return res.status(500).send("Server error");
    }
  }
static async showResume(req, res) {
  try {

    const resume = await ResumeService.getResumeById(req.params.id);

    if (!resume) {
      return res.status(404).render('error', {
        message: 'Resume not found'
      });
    }

    const embed = req.query.embed === 'true';

    const mainUser = await UserService.findById(resume.userId.toString())
    const profile = await ProfileService.getById(mainUser._id)

    return res.render('resume/show', {
      userName:mainUser.name,
      headline: profile.headline,
      resume,
      embed,
      user: req.session.user || null,
    });

  } catch (err) {

    return res.status(500).render('error', {
      message: err.message || 'Failed to load resume'
    });
  }
}

}