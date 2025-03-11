const { Sequelize } = require('sequelize');
const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

// MySQL连接配置
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// 测试数据库连接
const testDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL数据库连接成功');
  } catch (error) {
    console.error('无法连接到MySQL数据库:', error);
  }
};

// Redis客户端配置
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_PASSWORD ? process.env.REDIS_PASSWORD + '@' : ''}${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

// 连接Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis连接成功');
  } catch (error) {
    console.error('无法连接到Redis:', error);
  }
};

// 错误处理
redisClient.on('error', (err) => {
  console.error('Redis错误:', err);
});

// 初始化数据库连接
const initializeDatabase = async () => {
  await testDatabaseConnection();
  await connectRedis();
};

// 导出
module.exports = {
  sequelize,
  redisClient,
  initializeDatabase
}; 