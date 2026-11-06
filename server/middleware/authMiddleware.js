const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chalchitra_secret');
      
      // Handle admin tokens
      if (decoded.role === 'admin') {
        if (decoded.id) {
          req.user = await User.findById(decoded.id).select('-password');
        }
        if (!req.user) {
          req.user = { _id: decoded.id, role: 'admin', username: decoded.username || 'Admin' };
        }
        return next();
      }

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found, authorization denied' });
      }
      return next();
    } catch (error) {
      console.error('[Auth Middleware Error]', error.message);
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Admin role required' });
};

module.exports = { protect, adminOnly };
