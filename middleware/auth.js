// ✅ middleware/auth.js
export function requireAuth(req, res, next) {
  if (req.session.user) return next();
  return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
}

export function requireGuest(req, res, next) {
  if (!req.session.user) return next();
  return res.redirect('/dashboard');
}

export function requireConfirmedEmail(req, res, next) {
  if (req.session.user && req.session.user.isEmailConfirmed) return next();
  return res.redirect('/confirm-otp?email=' + encodeURIComponent(req.session.user?.email || ''));
}