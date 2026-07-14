const jwt = require('jsonwebtoken');
const db = require('../config/db');

async function protect(req, res, next) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_key_12345');
    const { rows } = await db.query('SELECT id, name, email, role, avatar, xp, streak FROM users WHERE id = $1', [decoded.id]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
}

async function optionalProtect(req, res, next) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_key_12345');
    const { rows } = await db.query('SELECT id, name, email, role, avatar, xp, streak FROM users WHERE id = $1', [decoded.id]);

    if (rows.length > 0) {
      req.user = rows[0];
    }
  } catch (error) {
    // Keep guest mode if token is malformed/expired
  }
  next();
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Role '${req.user?.role || 'none'}' is not authorized.` });
    }
    next();
  };
}

module.exports = { protect, optionalProtect, authorize };

