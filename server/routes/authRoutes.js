const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  updateMe, 
  changePassword 
} = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

// 公开路由
router.post('/register', register);
router.post('/login', login);

// 需要认证的路由
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);
router.put('/change-password', authenticate, changePassword);

module.exports = router; 