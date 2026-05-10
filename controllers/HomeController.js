export default class HomeController {
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  index() {
    const stats = {
      jobs: 128,
      companies: 42,
      users: 560,
      active: 18,
    };

    const featuredJobs = [
      {
        title: 'Frontend Developer',
        company: 'TechNova',
        location: 'Remote',
        type: 'Full-time',
      },
      {
        title: 'Backend Engineer',
        company: 'CloudSync',
        location: 'Toronto',
        type: 'Contract',
      },
      {
        title: 'UI/UX Designer',
        company: 'DesignHub',
        location: 'New York',
        type: 'Part-time',
      },
    ];
    return this.res.render('index', { featuredJobs, stats });
  }

  static about(req, res) {
    try {
      // 🔥 SAMPLE DATA (replace later with DB queries)
      const stats = {
        jobs: 128,
        companies: 42,
        users: 560,
        active: 18,
      };

      res.render('about', {
        stats,
        user: req.session.user || null,
      });
    } catch (error) {
      console.error('About page error:', error);
      res.status(500).send('Server Error');
    }
  }





  static getPrivacyPolicyPage  (req, res) {
  try {

    // 🔥 This can later come from DB (Mongo collection)
    const policy = {
      title: "Privacy Policy",
      lastUpdated: "May 2026",

      sections: [
        {
          heading: "1. Information We Collect",
          content:
            "We collect information such as name, email, and activity data to improve user experience and platform security."
        },
        {
          heading: "2. How We Use Your Data",
          content:
            "Your data is used for authentication, job matching, communication, and improving platform performance."
        },
        {
          heading: "3. Data Security",
          content:
            "We use secure session-based authentication, encryption, and monitoring to protect your data."
        },
        {
          heading: "4. Cookies & Sessions",
          content:
            "We use sessions stored in MongoDB to maintain login state and improve user experience."
        },
        {
          heading: "5. Third-Party Services",
          content:
            "We may integrate email services and analytics tools in the future."
        },
        {
          heading: "6. Your Rights",
          content:
            "You can request account deletion, data correction, or export of your information anytime."
        }
      ]
    };

    res.render("privacy", {
      policy,
      user: req.session.user || null
    });

  } catch (error) {
    console.error("Privacy page error:", error);
    res.status(500).send("Server Error");
  }
}

static getContactPage (req, res){
  const pageData = {
    title: "Contact Us",
    subtitle: "We’d love to hear from you",
    email: "support@jobplatform.com",
    phone: "+1 000 000 0000",
    address: "Ontario, Canada"
  };

  res.render("contact", {
    pageData,
    user: req.session.user || null,
    success: req.query.success || null,
    error: req.query.error || null
  });
}


static async submitContactForm (req, res) {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.redirect("/contact?error=All fields are required");
    }

    // 🔥 For now just log (later save to DB or send email)
    console.log("Contact Form:", { name, email, message });

    return res.redirect("/contact?success=Message sent successfully");

  } catch (error) {
    console.error(error);
    return res.redirect("/contact?error=Something went wrong");
  }
};
}
