const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * 验证JWT令牌中间件
 */
exports.authenticate = (req, res, next) => {
  // 简单模拟认证，总是成功
  req.user = {
    userId: 'user-1',
    username: '测试用户'
  };
  next();
};

exports.optionalAuth = (req, res, next) => {
  // 简单模拟可选认证，总是成功
  req.user = {
    userId: 'user-1',
    username: '测试用户'
  };
  next();
};