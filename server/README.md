# 汉字游戏后端服务

这是一个基于 Node.js、Express 和 Socket.io 的游戏后端服务，为汉字游戏提供 API 接口和实时通信功能。

## 技术栈

- **Node.js**: JavaScript 运行时环境
- **Express**: Web 应用框架
- **Socket.io**: 实时通信库
- **Sequelize**: ORM 工具
- **MySQL**: 关系型数据库
- **Redis**: 内存数据库，用于缓存和实时数据
- **JWT**: 用户认证
- **Docker**: 容器化部署

## 功能模块

- **用户认证**: 注册、登录、JWT 鉴权
- **匹配系统**: 玩家匹配、ELO 评分系统
- **市场交易**: 物品上架、购买、交易
- **资源管理**: 资源生成、采集、消耗
- **战斗系统**: 士兵与将军战斗、元素相克
- **建筑系统**: 建筑建造、升级、管理

## 开发环境设置

### 前提条件

- Node.js 14+
- MySQL 8+
- Redis 6+

### 安装依赖

```bash
npm install
```

### 环境变量配置

复制 `.env.example` 文件并重命名为 `.env`，然后根据你的环境配置相应的变量：

```bash
cp .env.example .env
```

### 数据库初始化

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE hanzi_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 运行数据库迁移
node scripts/initDb.js
```

### 启动开发服务器

```bash
npm run dev
```

## API 文档

### 认证 API

- `POST /api/auth/register`: 用户注册
- `POST /api/auth/login`: 用户登录
- `GET /api/auth/me`: 获取当前用户信息
- `PUT /api/auth/me`: 更新用户信息
- `PUT /api/auth/change-password`: 修改密码

### 匹配 API

- `POST /api/match/join`: 加入匹配队列
- `POST /api/match/leave`: 离开匹配队列
- `GET /api/match/leaderboard`: 获取排行榜
- `GET /api/match/rank/:userId`: 获取用户排名

### 市场 API

- `GET /api/market/items`: 获取市场物品列表
- `POST /api/market/items`: 上架物品
- `DELETE /api/market/items/:itemId`: 下架物品
- `POST /api/market/items/:itemId/buy`: 购买物品

### 资源 API

- `GET /api/resources`: 获取资源列表
- `POST /api/resources/collect`: 采集资源

### 游戏 API

- `GET /api/game/soldiers`: 获取士兵列表
- `GET /api/game/generals`: 获取将军列表
- `GET /api/game/buildings`: 获取建筑列表
- `POST /api/game/buildings`: 建造建筑
- `PUT /api/game/buildings/:buildingId`: 升级建筑

## 部署

### 使用 Docker

```bash
# 构建 Docker 镜像
docker build -t hanzi-game-server .

# 运行容器
docker run -p 3000:3000 --env-file .env hanzi-game-server
```

### 使用 Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

MIT 