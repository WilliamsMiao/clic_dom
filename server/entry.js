// 最简单的入口文件，只是为了确保服务器能够启动
const express = require('express');
const cors = require('cors');

const app = express();

// 使用更详细的CORS配置
app.use(cors({
  origin: '*', // 在开发阶段允许所有来源
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 添加调试路由记录请求
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// 测试路由
app.get('/', (req, res) => {
  res.json({ message: '汉字领域游戏API服务器正在运行' });
});

// 排行榜测试路由 - 渔翁之战和二虎之争
app.get('/api/match/leaderboard', (req, res) => {
  const { type = 'fisherman' } = req.query;
  
  // 根据请求类型返回不同的排行榜数据
  if (type === 'tigers') {
    // 二虎之争排行榜数据
    const mockLeaderboard = Array(20).fill().map((_, index) => ({
      userId: `user-t${index + 1}`,
      username: `猛虎玩家${index + 1}`,
      avatar: `/avatars/tiger${index % 5 + 1}.png`,
      rank: index + 1,
      eloRating: 1600 - index * 20,
      wins: 15 + Math.floor(Math.random() * 40),
      losses: 3 + Math.floor(Math.random() * 15),
      winRate: 0.6 + Math.random() * 0.3
    }));
    return res.json(mockLeaderboard);
  } else {
    // 渔翁之战排行榜数据
    const mockLeaderboard = Array(20).fill().map((_, index) => ({
      userId: `user-f${index + 1}`,
      username: `渔翁玩家${index + 1}`,
      avatar: `/avatars/default${index % 5 + 1}.png`,
      rank: index + 1,
      eloRating: 1500 - index * 15,
      wins: 10 + Math.floor(Math.random() * 40),
      losses: 5 + Math.floor(Math.random() * 20),
      winRate: 0.5 + Math.random() * 0.4
    }));
    return res.json(mockLeaderboard);
  }
});

// 用户排名测试路由
app.get('/api/match/rank/:userId', (req, res) => {
  const { type = 'fisherman' } = req.query;
  const userId = req.params.userId === 'me' ? 'user-1' : req.params.userId;
  
  if (type === 'tigers') {
    return res.json({
      userId: userId,
      username: '当前玩家',
      avatar: '/avatars/tiger1.png',
      rank: 3,
      eloRating: 1520,
      wins: 32,
      losses: 8,
      winRate: 0.8
    });
  } else {
    return res.json({
      userId: userId,
      username: '当前玩家',
      avatar: '/avatars/default1.png',
      rank: 5,
      eloRating: 1420,
      wins: 24,
      losses: 12,
      winRate: 0.67
    });
  }
});

// 匹配队列路由
app.post('/api/match/join', (req, res) => {
  res.json({
    success: true,
    message: '已加入匹配队列'
  });
});

app.post('/api/match/leave', (req, res) => {
  res.json({
    success: true,
    message: '已离开匹配队列'
  });
});

// 收藏品路由
app.get('/api/collections/my', (req, res) => {
  const rarityTypes = ['COMMON', 'UNCOMMON', 'UNCOMMON', 'RARE', 'RARE', 'EPIC', 'LEGENDARY'];
  const collectionNames = [
    '青铜剑', '玉璧', '黄金面具', '龙形玉佩', '青花瓷碗', 
    '竹简', '玉玺', '铜镜', '青铜鼎', '瑞兽玉摆件',
    '紫砂壶', '唐三彩', '青铜酒器', '丝绸画卷', '金丝楠木箱'
  ];
  
  const mockCollections = Array(12).fill().map((_, index) => ({
    id: `collection-${index + 1}`,
    name: collectionNames[index % collectionNames.length],
    description: `这是一个珍贵的收藏品，拥有特殊能力。`,
    imageUrl: `/collections/item${index % 6 + 1}.png`,
    rarity: rarityTypes[index % rarityTypes.length],
    value: (index % rarityTypes.length + 1) * 100,
    acquiredAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
  }));
  
  res.json({
    success: true,
    items: mockCollections
  });
});

app.get('/api/collections/stats', (req, res) => {
  res.json({
    totalValue: 2850,
    percentile: 78,
    totalItems: 12,
    rarityDistribution: {
      common: 2,
      uncommon: 4,
      rare: 3,
      epic: 2,
      legendary: 1
    }
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`模拟API服务器运行在 http://localhost:${PORT}`);
});