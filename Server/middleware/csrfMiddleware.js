const { verifyToken } = require('../config/csrf');

const csrfProtection = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'];
  const cookieToken = req.cookies['csrf-token'];

  if (!token || !cookieToken || token !== cookieToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  if (!verifyToken(token)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
};

module.exports = { csrfProtection };
