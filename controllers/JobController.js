import JobService from '../services/JobService.js';

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
      return res.render('jobs/show', { job, user: req.session.user || null });
    } catch (err) {
      console.error('job show error', err);
      return res.status(500).render('error', { message: 'Failed to load job' });
    }
  }

  // ─── create form ──────────────────────────────────────────────────────────
  static showCreate(req, res) {
    return res.render('jobs/create', { error: null, form: {} });
  }

  // ─── handle create ────────────────────────────────────────────────────────
  static async create(req, res) {

  const isJson = req.headers.accept?.includes('application/json');

  // check login
  if (!req.session?.user) {
    const message = 'Please login first';

    if (isJson) {
      return res.status(401).json({ error: message });
    }

    return res.redirect('/login');
  }

  const {
    title,
    company,
    location,
    type,
    experience,
    salaryMin,
    salaryMax,
    salaryCurrency,
    salaryPeriod,
    description,
    requirements,
    skills,
    applyType,
    externalUrl,
  } = req.body || {};

  const form = {
    title,
    company,
    location,
    type,
    experience,
    salaryMin,
    salaryMax,
    salaryCurrency,
    salaryPeriod,
    description,
    requirements,
    skills,
    applyType,
    externalUrl,
  };

  try {

    // validation
    if (
      !title ||
      !company ||
      !location ||
      !type ||
      !experience ||
      !description ||
      !applyType
    ) {
      const message = 'Please fill in all required fields';

      if (isJson) {
        return res.status(400).json({ error: message });
      }

      return res.status(400).render('jobs/create', {
        error: message,
        form,
      });
    }

    // external apply validation
    if (applyType === 'external' && !externalUrl) {

      const message = 'External apply URL is required';

      if (isJson) {
        return res.status(400).json({ error: message });
      }

      return res.status(400).render('jobs/create', {
        error: message,
        form,
      });
    }

    // parse arrays
    const requirementsArr = requirements
      ? requirements
          .split('\n')
          .map(r => r.trim())
          .filter(Boolean)
      : [];

    const skillsArr = skills
      ? skills
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      : [];

    const job = await JobService.create({
      title,
      company,
      location,
      type,
      experience,

      salary: {
        min: salaryMin ? Number(salaryMin) : null,
        max: salaryMax ? Number(salaryMax) : null,
        currency: salaryCurrency || 'USD',
        period: salaryPeriod || 'yearly',
      },

      description,

      requirements: requirementsArr,
      skills: skillsArr,

      applyType,

      externalUrl:
        applyType === 'external'
          ? externalUrl
          : null,

      postedBy: req.session.user._id,
    });

    if (isJson) {
      return res.status(201).json({
        success: true,
        redirect: `/jobs/${job._id}`,
      });
    }

    return res.redirect(`/jobs/${job._id}`);

  } catch (err) {

    console.error('job create error:', err);

    const message =
      err.message || 'Failed to create job posting';

    if (isJson) {
      return res.status(500).json({
        error: message,
      });
    }

    return res.status(500).render('jobs/create', {
      error: message,
      form,
    });
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
}