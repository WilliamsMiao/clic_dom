// 资源类型
export enum ResourceType {
  LIFE = 'life',
  ENERGY = 'energy',
  ECONOMY = 'economy',
  DEFENSE = 'defense'
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
  RESOURCE = 'resource' // 资源格子
}

// 位置接口
export interface Position {
  x: number;
  y: number;
}

// 汉字属性
export interface HanziStats {
  health: number;
  energy: number;
  gathering?: number; // 采集效率
  speed?: number;    // 移动速度
}

// 汉字实体
export interface Hanzi {
  id: string;
  character: string;
  type: HanziType;
  stats: HanziStats;
  position?: Position;
  isWorking?: boolean;
  targetPosition?: Position;
  resourceAmount?: number;
  resourceType?: ResourceType;
}

// 格子接口
export interface Tile {
  type: TileType;
  position: Position;
  content?: Hanzi;
}

// 沙盘状态
export interface SandboxState {
  tiles: Tile[][];
  size: number;
} 