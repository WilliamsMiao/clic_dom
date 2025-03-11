const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * 验证JWT令牌中间件
 */
const authenticate = async (req, res, next) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }
    
    // 提取令牌
    const token = authHeader.split(' ')[1];
    
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: '用户账号已被禁用'
      });
    }
    
    // 将用户信息添加到请求对象
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '认证令牌已过期'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌'
      });
    }
    
    console.error('认证错误:', error);
    
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 检查管理员权限中间件
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
  
  next();
};

/**
 * 可选认证中间件
 * 如果提供了有效令牌，则添加用户信息到请求对象
 * 如果没有提供令牌或令牌无效，则继续处理请求
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    
    if (user && user.isActive) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // 忽略令牌错误，继续处理请求
    next();
  }
};

module.exports = {
  authenticate,
  isAdmin,
  optionalAuth
}; 