const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Middleware to check if user owns the resource
const checkOwnership = (resourceModel) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id || req.params.key;
      const resource = await resourceModel.findOne({ 
        _id: resourceId, 
        user: req.user._id 
      });

      if (!resource) {
        return res.status(403).json({ error: 'Access denied: Resource not found or not owned by user' });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({ error: 'Ownership verification failed' });
    }
  };
};

// Middleware to check if user is admin (optional)
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Admin access required' });
  }
};

module.exports = {
  authenticateToken,
  checkOwnership,
  requireAdmin
};
