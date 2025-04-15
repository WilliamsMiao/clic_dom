// 添加新路由
const collectionsRoutes = require('./routes/collectionsRoutes');

// ...现有代码...

// 使用路由
app.use('/api/auth', authRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/collections', collectionsRoutes); // 添加这一行