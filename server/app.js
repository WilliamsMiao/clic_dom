const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');
// 暂时注释掉其他不必要的导入
// const morgan = require('morgan');

// 加载环境变量
dotenv.config();

// 导入路由
const authRoutes = require('./routes/authRoutes');
const marketRoutes = require('./routes/marketRoutes');
const matchRoutes = require('./routes/matchRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const gameRoutes = require('./routes/gameRoutes');
const collectionsRoutes = require('./routes/collectionsRoutes');

// 导入数据库连接
const db = require('./config/database');

// 创建Express应用
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://yourdomain.com' 
      : 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// 中间件
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com' 
    : 'http://localhost:5173',
  credentials: true
}));
// app.use(morgan('dev'));  // 暂时注释掉
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 限制请求速率
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP在windowMs内最多100个请求
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// 简单的认证中间件 (临时)
app.use((req, res, next) => {
  req.user = {
    userId: 'user-1',
    username: '测试用户'
  };
  next();
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/collections', collectionsRoutes);

// 根路由
app.get('/', (req, res) => {
  res.send('汉字领域游戏 API 服务器正在运行');
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Socket.io连接处理
io.on('connection', (socket) => {
  console.log('用户已连接:', socket.id);

  // 处理匹配请求
  socket.on('requestMatch', (data) => {
    // 匹配逻辑将在matchController中实现
    console.log('匹配请求:', data);
  });

  // 处理游戏操作
  socket.on('gameAction', (data) => {
    // 游戏操作逻辑将在gameController中实现
    console.log('游戏操作:', data);
  });

  // 处理断开连接
  socket.on('disconnect', () => {
    console.log('用户已断开连接:', socket.id);
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

// 导出app用于测试
module.exports = app;