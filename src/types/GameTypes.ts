// 资源类型
export enum ResourceType {
  LIFE = 'LIFE',
  ENERGY = 'ENERGY',
  ECONOMY = 'ECONOMY',
  WOOD = 'WOOD',
  WATER = 'WATER',
  FIRE = 'FIRE',
  EARTH = 'EARTH'
}

// 汉字类型
export enum HanziType {
  BASIC = 'basic',      // 基础汉字
  WORKER = 'worker',    // 工作型汉字
  RESOURCE = 'resource' // 资源型汉字
}

// 格子类型
export enum TileType {
  EMPTY = 'empty',      // 空格子
  RESOURCE = 'resource', // 资源格子
  CITY = 'city'        // 主城格子
}

// 位置接口
export interface Position {
  x: number;
  y: number;
}

// 角色职业类型
export enum CharacterClass {
  WORKER = 'worker',     // 工人，擅长采集
  FARMER = 'farmer',     // 农民，提供资源加成
  WARRIOR = 'warrior',   // 战士，保护其他角色
  SCHOLAR = 'scholar'    // 学者，提升组合效率
}

// 汉字属性
export interface HanziStats {
  health: number;      // 生命值
  energy: number;      // 能量值
  gathering?: number;  // 采集效率
  speed?: number;     // 移动速度
  defense?: number;   // 防御力
  attack?: number;    // 攻击力
  wisdom?: number;    // 智慧（影响组合效率）
  range?: number;     // 作用范围
}

// 组合规则类型
export interface CombinationRule {
  inputs: {
    type: ResourceType;
    count: number;
  }[];
  output: {
    character: string;
    type: ResourceType;
    stats: HanziStats;
  };
}

// 组合规则集
export const COMBINATION_RULES: CombinationRule[] = [
  {
    // 金木 -> 斧
    inputs: [
      { type: ResourceType.ECONOMY, count: 2 }, // 金
      { type: ResourceType.WOOD, count: 1 }     // 木
    ],
    output: {
      character: '斧',
      type: ResourceType.ECONOMY,
      stats: {
        health: 80,
        energy: 100,
        gathering: 15
      }
    }
  },
  {
    // 水火 -> 汽
    inputs: [
      { type: ResourceType.WATER, count: 1 },
      { type: ResourceType.FIRE, count: 1 }
    ],
    output: {
      character: '汽',
      type: ResourceType.ENERGY,
      stats: {
        health: 60,
        energy: 120,
        speed: 8
      }
    }
  },
  {
    // 土水 -> 泥
    inputs: [
      { type: ResourceType.EARTH, count: 1 },
      { type: ResourceType.WATER, count: 1 }
    ],
    output: {
      character: '泥',
      type: ResourceType.EARTH,
      stats: {
        health: 100,
        energy: 80,
        gathering: 12
      }
    }
  }
];

// 采集范围类型
export interface CollectionRange {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// 角色模板
export const CHARACTER_TEMPLATES: Record<CharacterClass, {
  character: string;
  stats: HanziStats;
  description: string;
  collectionRange: CollectionRange;
}> = {
  [CharacterClass.WORKER]: {
    character: '工',
    stats: {
      health: 100,    // 标准生命值
      energy: 120,    // 较高能量值以支持持续采集
      gathering: 12,  // 标准采集效率
      speed: 5,       // 中等移动速度
      wisdom: 5       // 基础智慧值
    },
    description: '基础采集者，擅长在较大范围内采集资源，能量充沛',
    collectionRange: {
      top: 2,
      right: 2,
      bottom: 2,
      left: 2
    }
  },
  [CharacterClass.FARMER]: {
    character: '农',
    stats: {
      health: 120,    // 较高生命值
      energy: 100,    // 标准能量值
      gathering: 20,  // 最高采集效率
      speed: 4,       // 较慢移动速度
      wisdom: 8       // 较高智慧值，利于资源组合
    },
    description: '专业采集者，采集效率最高，但范围较小，适合精耕细作',
    collectionRange: {
      top: 1,
      right: 1,
      bottom: 1,
      left: 1
    }
  },
  [CharacterClass.WARRIOR]: {
    character: '兵',
    stats: {
      health: 150,    // 最高生命值
      energy: 130,    // 较高能量值
      gathering: 8,   // 较低采集效率
      speed: 7,       // 最快移动速度
      attack: 15,     // 高攻击力
      defense: 12     // 高防御力
    },
    description: '战斗专家，能保护其他角色，移动速度最快，但采集效率较低',
    collectionRange: {
      top: 1,
      right: 1,
      bottom: 1,
      left: 1
    }
  },
  [CharacterClass.SCHOLAR]: {
    character: '士',
    stats: {
      health: 80,     // 最低生命值
      energy: 150,    // 最高能量值
      gathering: 6,   // 最低采集效率
      speed: 4,       // 较慢移动速度
      wisdom: 20,     // 最高智慧值
      defense: 5      // 基础防御力
    },
    description: '智慧之士，大幅提升周围角色的能力，增加资源组合效率，但较为脆弱',
    collectionRange: {
      top: 1,
      right: 1,
      bottom: 1,
      left: 1
    }
  }
};

// 汉字实体
export interface Hanzi {
  id: string;
  character: string;
  type: HanziType;
  class?: CharacterClass;
  stats: HanziStats;
  position?: Position;
  isWorking?: boolean;
  targetPosition?: Position;
  resourceAmount?: number;
  resourceType?: ResourceType;
  canCombine?: boolean;
  description?: string;
  collectionRange?: CollectionRange;
}

// 格子接口
export interface Tile {
  type: TileType;
  position: Position;
  content?: Hanzi;
}

// 主城类型
export interface City {
  position: Position;    // 主城中心位置
  health: number;       // 主城血量
  size: number;        // 主城大小
}

// 沙盘状态
export interface SandboxState {
  size: number;
  tiles: Tile[][];
  city: City;
  battleMode: boolean;  // 是否处于战斗模式
  battleTiles: Tile[][]; // 战斗地图的瓦片
} 