const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const authMiddleware = require('../../middleware/auth.middleware');

// In unauthenticated development mode, login and registration are bypassed
router.post('/register', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Registration is disabled in unauthenticated development mode. Using active demo profile.',
    data: { user: req.user }
  });
});

router.post('/login', authMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Login is disabled in unauthenticated development mode. Using active demo profile.',
    data: { user: req.user, token: 'dev-mode-token' }
  });
});

// Profile and context routes (powered by authMiddleware demo identity)
router.get('/me', authMiddleware, authController.getMe);
router.get('/logs', authMiddleware, authController.getMyLogs);
router.patch('/profile', authMiddleware, authController.updateProfile);
router.patch('/password', authMiddleware, authController.updatePassword);

module.exports = router;


