# 汉字采集游戏 (Chinese Character Collection Game)

一个基于 React 和 Canvas 的汉字采集游戏。玩家可以通过拖放"工"字角色来采集地图上的资源汉字。

## 功能特点

- 30x30 的资源采集沙盘
- 可拖拽的工人角色
- 自动采集相邻格子的资源
- 动态采集动画效果
- 资源收集系统

## 技术栈

- React
- TypeScript
- Styled Components
- Zustand (状态管理)
- Canvas API

## 开发环境设置

1. 克隆仓库：
```bash
git clone [repository-url]
cd hanzi-game
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 在浏览器中打开 http://localhost:3000

## 游戏玩法

1. 页面顶部显示可用的角色卡片
2. 将"工"字角色拖放到游戏沙盘中的任意位置
3. 角色会自动采集周围四个相邻格子的资源
4. 采集成功后会显示动画效果
5. 收集到的资源会显示在底部的资源栏中

## 开发计划

- [ ] 添加更多角色类型
- [ ] 实现资源组合系统
- [ ] 添加战斗系统
- [ ] 增加更多动画效果

## 许可证

MIT 