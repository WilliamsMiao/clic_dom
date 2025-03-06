import create from 'zustand';
import { HanziType, TileType, Position, Hanzi, SandboxState, Tile, ResourceType, HanziStats } from '../types/GameTypes';

interface GameState {
  sandbox: SandboxState;
  characters: Hanzi[];
  selectedCharacter: string | null;
  collectedResources: Hanzi[];
  
  // 操作方法
  initializeSandbox: () => void;
  moveCharacter: (characterId: string, position: Position) => void;
  startGathering: (characterId: string, position: Position) => void;
  selectCharacter: (characterId: string | null) => void;
  addCollectedResource: (resource: Hanzi) => void;
  clearTile: (position: Position) => void;
}

// 生成随机资源
const generateRandomResource = (): { character: string, type: ResourceType } => {
  const resources = [
    { character: '金', type: ResourceType.ECONOMY },
    { character: '木', type: ResourceType.WOOD },
    { character: '水', type: ResourceType.WATER },
    { character: '火', type: ResourceType.FIRE },
    { character: '土', type: ResourceType.EARTH }
  ];
  return resources[Math.floor(Math.random() * resources.length)];
};

// 创建初始沙盘状态
const createInitialSandbox = (): SandboxState => {
  const size = 30;
  const tiles: Tile[][] = Array(size).fill(null).map((_, y) =>
    Array(size).fill(null).map((_, x) => {
      const position = { x, y };
      // 10%概率生成资源格子
      if (Math.random() < 0.1) {
        const resource = generateRandomResource();
        const resourceHanzi: Hanzi = {
          id: `resource_${x}_${y}`,
          character: resource.character,
          type: HanziType.RESOURCE,
          stats: {
            health: 100,
            energy: 100,
            gathering: 0,
            speed: 0
          },
          position,
          resourceAmount: Math.floor(Math.random() * 100) + 50,
          resourceType: resource.type
        };
        return {
          type: TileType.RESOURCE,
          position,
          content: resourceHanzi
        };
      }
      return { 
        type: TileType.EMPTY,
        position
      };
    })
  );

  return {
    size,
    tiles
  };
};

// 初始角色
const initialCharacters: Hanzi[] = [
  {
    id: 'worker_1',
    character: '工',
    type: HanziType.WORKER,
    stats: {
      health: 100,
      energy: 100,
      gathering: 10,
      speed: 5
    }
  }
];

export const useGameStore = create<GameState>((set) => ({
  sandbox: createInitialSandbox(),
  characters: initialCharacters,
  selectedCharacter: null,
  collectedResources: [],

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
  }
})); 