/**
 * 游戏计算工具函数
 * 用于各种游戏内计算
 */

// 计算两点之间的距离
const calculateDistance = (pos1, pos2) => {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
};

// 计算曼哈顿距离（格子距离）
const calculateManhattanDistance = (pos1, pos2) => {
  return Math.abs(pos2.x - pos1.x) + Math.abs(pos2.y - pos1.y);
};

// 检查两个位置是否相邻
const isAdjacent = (pos1, pos2) => {
  return calculateManhattanDistance(pos1, pos2) === 1;
};

// 获取相邻位置
const getAdjacentPositions = (pos) => {
  return [
    { x: pos.x, y: pos.y - 1 }, // 上
    { x: pos.x + 1, y: pos.y }, // 右
    { x: pos.x, y: pos.y + 1 }, // 下
    { x: pos.x - 1, y: pos.y }  // 左
  ];
};

// 检查位置是否在地图范围内
const isInMapBounds = (pos, mapSize) => {
  return pos.x >= 0 && pos.x < mapSize && pos.y >= 0 && pos.y < mapSize;
};

// 计算战斗伤害
const calculateDamage = (attacker, defender, isCritical = false) => {
  // 基础伤害
  let baseDamage = attacker.attack - defender.defense * 0.5;
  
  // 确保最小伤害
  baseDamage = Math.max(1, baseDamage);
  
  // 暴击伤害
  if (isCritical) {
    baseDamage *= 1.5;
  }
  
  // 元素相克加成
  const elementMultiplier = getElementMultiplier(attacker.elementType, defender.elementType);
  baseDamage *= elementMultiplier;
  
  // 随机波动 (±10%)
  const randomFactor = 0.9 + Math.random() * 0.2;
  
  // 最终伤害
  const finalDamage = Math.floor(baseDamage * randomFactor);
  
  return {
    damage: finalDamage,
    isCritical,
    elementMultiplier
  };
};

// 获取元素相克倍率
const getElementMultiplier = (attackerElement, defenderElement) => {
  // 五行相生相克关系
  // 金克木，木克土，土克水，水克火，火克金
  const elementRelations = {
    '金': { '木': 1.5, '水': 1.0, '火': 0.7, '土': 1.0, '金': 1.0 },
    '木': { '金': 0.7, '水': 1.0, '火': 1.0, '土': 1.5, '木': 1.0 },
    '水': { '金': 1.0, '木': 1.0, '火': 1.5, '土': 0.7, '水': 1.0 },
    '火': { '金': 1.5, '木': 1.0, '水': 0.7, '土': 1.0, '火': 1.0 },
    '土': { '金': 1.0, '木': 0.7, '水': 1.5, '火': 1.0, '土': 1.0 }
  };
  
  // 如果元素关系未定义，返回1.0（无加成）
  if (!elementRelations[attackerElement] || !elementRelations[attackerElement][defenderElement]) {
    return 1.0;
  }
  
  return elementRelations[attackerElement][defenderElement];
};

// 计算升级所需经验
const calculateExpForLevel = (level) => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// 计算资源产出
const calculateResourceProduction = (buildings, resourceType, timeInMinutes) => {
  return buildings
    .filter(building => 
      building.type === '资源' && 
      building.productionType === resourceType && 
      building.isConstructed && 
      building.isActive
    )
    .reduce((total, building) => {
      return total + Math.floor(building.productionRate * timeInMinutes);
    }, 0);
};

// 计算建筑建造/升级时间
const calculateBuildingTime = (buildingType, level) => {
  // 基础时间（分钟）
  let baseTime;
  
  switch (buildingType) {
    case '主城':
      baseTime = 30;
      break;
    case '资源':
      baseTime = 10;
      break;
    case '军事':
      baseTime = 15;
      break;
    case '防御':
      baseTime = 20;
      break;
    case '研究':
      baseTime = 25;
      break;
    case '特殊':
      baseTime = 30;
      break;
    default:
      baseTime = 15;
  }
  
  // 每级增加时间
  return Math.floor(baseTime * Math.pow(1.5, level - 1));
};

// 计算建筑建造/升级所需资源
const calculateBuildingCost = (buildingType, level) => {
  // 基础成本
  let baseCost;
  
  switch (buildingType) {
    case '主城':
      baseCost = { gold: 1000, wood: 1000, water: 500, fire: 500, earth: 500 };
      break;
    case '资源':
      baseCost = { gold: 200, wood: 300, water: 100, fire: 100, earth: 100 };
      break;
    case '军事':
      baseCost = { gold: 300, wood: 200, water: 100, fire: 200, earth: 100 };
      break;
    case '防御':
      baseCost = { gold: 200, wood: 200, water: 100, fire: 100, earth: 300 };
      break;
    case '研究':
      baseCost = { gold: 400, wood: 200, water: 200, fire: 200, earth: 100 };
      break;
    case '特殊':
      baseCost = { gold: 500, wood: 300, water: 200, fire: 200, earth: 200 };
      break;
    default:
      baseCost = { gold: 300, wood: 200, water: 100, fire: 100, earth: 100 };
  }
  
  // 每级增加成本
  const multiplier = Math.pow(1.5, level - 1);
  
  return {
    gold: Math.floor(baseCost.gold * multiplier),
    wood: Math.floor(baseCost.wood * multiplier),
    water: Math.floor(baseCost.water * multiplier),
    fire: Math.floor(baseCost.fire * multiplier),
    earth: Math.floor(baseCost.earth * multiplier)
  };
};

module.exports = {
  calculateDistance,
  calculateManhattanDistance,
  isAdjacent,
  getAdjacentPositions,
  isInMapBounds,
  calculateDamage,
  getElementMultiplier,
  calculateExpForLevel,
  calculateResourceProduction,
  calculateBuildingTime,
  calculateBuildingCost
}; 