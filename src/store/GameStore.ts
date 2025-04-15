import create from 'zustand';
import { HanziType, TileType, Position, Hanzi, SandboxState, Tile, ResourceType, HanziStats, COMBINATION_RULES, CombinationRule, CharacterClass, CHARACTER_TEMPLATES, City } from '../types/GameTypes';
import { useStore } from './index';

export interface GameState {

  resources: Record<number, number>;
  sandbox: SandboxState;
  characters: Hanzi[];
  selectedCharacter: string | null;
  collectedResources: Hanzi[];
  selectedResources: string[];
  
  // 操作方法
  initializeSandbox: () => void;
  moveCharacter: (characterId: string, position: Position) => void;
  startGathering: (characterId: string, position: Position) => void;
  selectCharacter: (characterId: string | null) => void;
  addCollectedResource: (resource: Hanzi) => void;
  clearTile: (position: Position) => void;
  toggleResourceSelection: (id: string) => void;
  clearResourceSelection: () => void;
  combineResources: () => void;
  checkCombinationAvailable: () => CombinationRule | null;
  toggleBattleMode: () => void;
}

// 生成随机资源
const generateRandomResource = (): { character: string, type: ResourceType } => {
  const resources = [
    { character: '金', type: ResourceType.ECONOMY },
    { character: '木', type: ResourceType.WOOD },
    { character: '火', type: ResourceType.FIRE }
  ];
  return resources[Math.floor(Math.random() * resources.length)];
};

// 生成资源汉字
const createResourceHanzi = (position: Position, resourceType: ResourceType): Hanzi => {
  const characterMap: Record<ResourceType, string> = {
    [ResourceType.ECONOMY]: '金',
    [ResourceType.WOOD]: '木',
    [ResourceType.WATER]: '水',
    [ResourceType.FIRE]: '火',
    [ResourceType.EARTH]: '土',
    [ResourceType.LIFE]: '命',
    [ResourceType.ENERGY]: '能'
  };

  return {
    id: `resource_${position.x}_${position.y}`,
    character: characterMap[resourceType],
    type: HanziType.RESOURCE,
    stats: {
      health: 100,
      energy: 100,
      gathering: 0,
      speed: 0
    },
    position,
    resourceAmount: Math.floor(Math.random() * 100) + 50,
    resourceType
  };
};

// 检查位置是否可用于生成资源
const isPositionAvailable = (tiles: Tile[][], x: number, y: number, size: number, isInCityRange: (x: number, y: number) => boolean): boolean => {
  if (x < 0 || x >= size || y < 0 || y >= size) return false;
  if (isInCityRange(x, y)) return false;
  return tiles[y][x].type === TileType.EMPTY;
};

// 生成团状资源
const generateResourceCluster = (
  tiles: Tile[][],
  size: number,
  resourceType: ResourceType,
  maxCount: number,
  isInCityRange: (x: number, y: number) => boolean
): Tile[][] => {
  const newTiles = [...tiles.map(row => [...row])];
  let count = 0;
  const maxClusters = 1; // 由于团更大了，改为最多生成1个团
  let clustersCreated = 0;

  while (clustersCreated < maxClusters && count < maxCount) {
    // 随机选择一个起始点
    const startX = Math.floor(Math.random() * size);
    const startY = Math.floor(Math.random() * size);

    if (!isPositionAvailable(newTiles, startX, startY, size, isInCityRange)) continue;

    // 开始生成团状资源
    const clusterSize = Math.floor(Math.random() * 5) + 4; // 4-8个相连的资源
    let clusterCount = 0;
    const queue = [{ x: startX, y: startY }];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // 上下左右

    while (queue.length > 0 && clusterCount < clusterSize && count < maxCount) {
      const current = queue.shift()!;
      if (!isPositionAvailable(newTiles, current.x, current.y, size, isInCityRange)) continue;

      // 在当前位置生成资源
      const resourceHanzi = createResourceHanzi({ x: current.x, y: current.y }, resourceType);
      newTiles[current.y][current.x] = {
        type: TileType.RESOURCE,
        position: { x: current.x, y: current.y },
        content: resourceHanzi
      };
      clusterCount++;
      count++;

      // 随机选择相邻位置
      const shuffledDirections = directions.sort(() => Math.random() - 0.5);
      for (const [dx, dy] of shuffledDirections) {
        const newX = current.x + dx;
        const newY = current.y + dy;
        if (isPositionAvailable(newTiles, newX, newY, size, isInCityRange)) {
          queue.push({ x: newX, y: newY });
        }
      }
    }

    if (clusterCount > 0) clustersCreated++;
  }

  return newTiles;
};

// 创建空战斗地图
const createEmptyBattleMap = (size: number): Tile[][] => {
  return Array(size).fill(null).map((_, y) =>
    Array(size).fill(null).map((_, x) => ({
      type: TileType.EMPTY,
      position: { x, y }
    }))
  );
};

// 创建初始沙盘状态
const createInitialSandbox = (): SandboxState => {
  const size = 30;
  const edgeBuffer = 3;
  const citySize = 3;
  
  // 随机生成主城位置（确保主城不会出现在边缘3格范围内）
  const cityPosition = {
    x: Math.floor(Math.random() * (size - 2 * edgeBuffer - citySize)) + edgeBuffer,
    y: Math.floor(Math.random() * (size - 2 * edgeBuffer - citySize)) + edgeBuffer
  };

  const city: City = {
    position: cityPosition,
    health: 1000,
    size: citySize
  };

  // 检查位置是否在主城范围内
  const isInCityRange = (x: number, y: number): boolean => {
    const dx = Math.abs(x - cityPosition.x);
    const dy = Math.abs(y - cityPosition.y);
    return dx <= Math.floor(citySize/2) && dy <= Math.floor(citySize/2);
  };

  // 初始化空地图
  let tiles: Tile[][] = Array(size).fill(null).map((_, y) =>
    Array(size).fill(null).map((_, x) => ({
      type: TileType.EMPTY,
      position: { x, y }
    }))
  );

  // 设置主城区域
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isInCityRange(x, y)) {
        tiles[y][x] = {
          type: TileType.CITY,
          position: { x, y }
        };
      }
    }
  }

  // 生成团状的土和水资源
  tiles = generateResourceCluster(tiles, size, ResourceType.EARTH, 8, isInCityRange); // 最多8个土资源
  tiles = generateResourceCluster(tiles, size, ResourceType.WATER, 8, isInCityRange); // 最多8个水资源

  // 生成其他随机资源
  tiles = tiles.map((row, y) => row.map((tile, x) => {
    if (tile.type !== TileType.EMPTY) return tile;
    
    if (Math.random() < 0.03) {
      const resource = generateRandomResource();
      return {
        type: TileType.RESOURCE,
        position: { x, y },
        content: createResourceHanzi({ x, y }, resource.type)
      };
    }
    return tile;
  }));

  return {
    size,
    tiles,
    city,
    battleMode: false,
    battleTiles: createEmptyBattleMap(size)
  };
};

// 初始角色
const initialCharacters: Hanzi[] = Object.entries(CHARACTER_TEMPLATES).map(([className, template]) => ({
  id: `${className}_1`,
  character: template.character,
  type: HanziType.WORKER,
  class: className as CharacterClass,
  stats: template.stats,
  description: template.description,
  collectionRange: template.collectionRange
}));

const getResourceTypeName = (type: ResourceType | undefined): string => {
  if (!type) return '未知';
  switch (type) {
    case ResourceType.WOOD:
      return '木';
    case ResourceType.WATER:
      return '水';
    case ResourceType.FIRE:
      return '火';
    case ResourceType.EARTH:
      return '土';
    case ResourceType.LIFE:
      return '生命';
    case ResourceType.ENERGY:
      return '能量';
    case ResourceType.ECONOMY:
      return '经济';
    default:
      return '未知';
  }
};

export const useGameStore = create<GameState>((set, get) => ({
  resources: {},
  sandbox: createInitialSandbox(),
  characters: initialCharacters,
  selectedCharacter: null,
  collectedResources: [],
  selectedResources: [],

  initializeSandbox: () => {
    set({ sandbox: createInitialSandbox() });
  },

  moveCharacter: (characterId, position) => {
    set(state => ({
      characters: state.characters.map(char =>
        char.id === characterId
          ? { ...char, position, isWorking: false, targetPosition: undefined }
          : char
      )
    }));
  },

  startGathering: (characterId, position) => {
    set(state => ({
      characters: state.characters.map(char =>
        char.id === characterId
          ? { ...char, isWorking: true, targetPosition: position }
          : char
      )
    }));
  },

  selectCharacter: (characterId) => {
    set({ selectedCharacter: characterId });
  },

  addCollectedResource: (resource) => {
    set(state => ({
      collectedResources: [...state.collectedResources, resource]
    }));
    // 同时更新资源合成界面的资源数量
    const store = useStore.getState();
    store.updateResources(getResourceTypeName(resource.resourceType), 1);
  },

  clearTile: (position) => {
    set(state => ({
      sandbox: {
        ...state.sandbox,
        tiles: state.sandbox.tiles.map((row, y) =>
          row.map((tile, x) =>
            x === position.x && y === position.y
              ? { ...tile, type: TileType.EMPTY, content: undefined }
              : tile
          )
        )
      }
    }));
  },

  toggleResourceSelection: (id) => {
    set(state => ({
      selectedResources: state.selectedResources.includes(id)
        ? state.selectedResources.filter(resId => resId !== id)
        : [...state.selectedResources, id]
    }));
  },

  clearResourceSelection: () => {
    set({ selectedResources: [] });
  },

  checkCombinationAvailable: () => {
    const state = get();
    const selectedResources = state.collectedResources.filter(res =>
      state.selectedResources.includes(res.id)
    );

    return COMBINATION_RULES.find(rule => {
      const resourceCounts = selectedResources.reduce((acc, res) => {
        if (res.resourceType) {
          acc[res.resourceType] = (acc[res.resourceType] || 0) + 1;
        }
        return acc;
      }, {} as Record<ResourceType, number>);

      return rule.inputs.every(input =>
        resourceCounts[input.type] >= input.count
      );
    }) || null;
  },
  combineResources: () => {
    const state = get();
    const rule = state.checkCombinationAvailable();
    if (!rule) return;

    // 创建新的组合汉字
    // 创建新的组合汉字
    const newHanzi: Hanzi = {
      id: `combined_${Date.now()}`,
      character: rule.output.character,
      type: HanziType.RESOURCE,
      stats: rule.output.stats,
      resourceType: rule.output.type
    };

    // 移除已使用的资源
    const usedResourceTypes = new Map<ResourceType, number>();
    const remainingResources = state.collectedResources.filter(res => {
      if (!state.selectedResources.includes(res.id)) return true;
      if (!res.resourceType) return false;

      const count = usedResourceTypes.get(res.resourceType) || 0;
      const required = rule.inputs.find(input => input.type === res.resourceType)?.count || 0;

      if (count < required) {
        usedResourceTypes.set(res.resourceType, count + 1);
        return false;
      }
      return true;
    });

    set({
      collectedResources: [...remainingResources, newHanzi],
      selectedResources: []
    });
  },

  toggleBattleMode: () => {
    set(state => ({
      sandbox: {
        ...state.sandbox,
        battleMode: !state.sandbox.battleMode
      }
    }));
  }
})); 