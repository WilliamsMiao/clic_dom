import create from 'zustand';
import { HanziType, TileType, Position, Hanzi, SandboxState, Tile, ResourceType, HanziStats, COMBINATION_RULES, CombinationRule, CharacterClass, CHARACTER_TEMPLATES, City } from '../types/GameTypes';

interface GameState {
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
    city
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

export const useGameStore = create<GameState>((set, get) => ({
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
    set(state => {
      // 查找是否已存在相同类型的资源
      const existingResourceIndex = state.collectedResources.findIndex(
        r => r.character === resource.character && r.resourceType === resource.resourceType
      );

      if (existingResourceIndex >= 0) {
        // 如果存在，合并资源数量
        const updatedResources = [...state.collectedResources];
        const existingResource = updatedResources[existingResourceIndex];
        updatedResources[existingResourceIndex] = {
          ...existingResource,
          resourceAmount: (existingResource.resourceAmount || 0) + (resource.resourceAmount || 0)
        };
        return { collectedResources: updatedResources };
      } else {
        // 如果不存在，添加新资源
        return {
          collectedResources: [...state.collectedResources, resource]
        };
      }
    });
  },

  clearTile: (position) => {
    set(state => {
      const newTiles = [...state.sandbox.tiles];
      newTiles[position.y][position.x] = {
        type: TileType.EMPTY,
        position
      };
      return {
        sandbox: {
          ...state.sandbox,
          tiles: newTiles
        }
      };
    });
  },

  // 切换资源选择状态
  toggleResourceSelection: (id: string) => {
    set(state => {
      const isSelected = state.selectedResources.includes(id);
      let newSelectedResources: string[];
      
      if (isSelected) {
        newSelectedResources = state.selectedResources.filter(resourceId => resourceId !== id);
      } else {
        newSelectedResources = [...state.selectedResources, id];
      }

      return { selectedResources: newSelectedResources };
    });
  },

  // 清除资源选择
  clearResourceSelection: () => {
    set({ selectedResources: [] });
  },

  // 检查是否可以组合
  checkCombinationAvailable: () => {
    const state = get();
    const selectedResources = state.collectedResources.filter(
      resource => state.selectedResources.includes(resource.id)
    );

    // 统计每种资源类型的数量
    const resourceCounts = new Map<ResourceType, number>();
    selectedResources.forEach(resource => {
      if (resource.resourceType) {
        const count = resourceCounts.get(resource.resourceType) || 0;
        resourceCounts.set(resource.resourceType, count + 1);
      }
    });

    // 检查是否满足任何组合规则
    return COMBINATION_RULES.find(rule => {
      return rule.inputs.every(input => {
        const count = resourceCounts.get(input.type) || 0;
        return count >= input.count;
      });
    }) || null;
  },

  // 组合资源
  combineResources: () => {
    const state = get();
    const rule = state.checkCombinationAvailable();
    
    if (!rule) return;

    // 获取选中的资源
    const selectedResources = state.collectedResources.filter(
      resource => state.selectedResources.includes(resource.id)
    );

    // 按类型分组
    const resourcesByType = new Map<ResourceType, Hanzi[]>();
    selectedResources.forEach(resource => {
      if (resource.resourceType) {
        const resources = resourcesByType.get(resource.resourceType) || [];
        resourcesByType.set(resource.resourceType, [...resources, resource]);
      }
    });

    // 检查是否有足够的资源
    const hasEnoughResources = rule.inputs.every(input => {
      const resources = resourcesByType.get(input.type) || [];
      return resources.length >= input.count;
    });

    if (!hasEnoughResources) return;

    // 移除用于组合的资源
    const usedResourceIds = new Set<string>();
    rule.inputs.forEach(input => {
      const resources = resourcesByType.get(input.type) || [];
      const usedResources = resources.slice(0, input.count);
      usedResources.forEach(resource => usedResourceIds.add(resource.id));
    });

    // 创建新的资源
    const newResource: Hanzi = {
      id: `combined_${Date.now()}_${Math.random()}`,
      character: rule.output.character,
      type: HanziType.RESOURCE,
      stats: rule.output.stats,
      resourceType: rule.output.type,
      resourceAmount: 1,
      canCombine: true
    };

    set(state => ({
      collectedResources: [
        ...state.collectedResources.filter(resource => !usedResourceIds.has(resource.id)),
        newResource
      ],
      selectedResources: []
    }));
  },
})); 