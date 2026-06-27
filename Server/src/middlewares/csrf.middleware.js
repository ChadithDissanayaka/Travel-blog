// src/middlewares/csrf.middleware.js

/**
 * Middleware to protect against Cross-Site Request Forgery (CSRF) attacks.
 * Uses the Double-Submit Cookie pattern.
 */
const csrfProtection = (req, res, next) => {
  // Safe methods do not require CSRF validation
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies ? req.cookies._csrf : null;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'CSRF token validation failed.' });
  }

  next();
};

module.exports = { csrfProtection };
