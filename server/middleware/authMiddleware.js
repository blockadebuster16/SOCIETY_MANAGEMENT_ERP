import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access Denied: Missing auth token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const verified = jwt.verify(token, env.jwtSecret);
    req.user = verified; // verified.id, verified.role
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: 'Invalid or expired authentication token' });
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access Denied: Insufficient permissions' });
    }
    next();
  };
};

