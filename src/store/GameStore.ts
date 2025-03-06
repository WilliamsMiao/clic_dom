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
    { character: '木', type: ResourceType.DEFENSE },
    { character: '水', type: ResourceType.ENERGY },
    { character: '火', type: ResourceType.ENERGY },
    { character: '土', type: ResourceType.DEFENSE }
  ];
  return resources[Math.floor(Math.random() * resources.length)];
};

// 创建初始沙盘状态
const createInitialSandbox = (): SandboxState => {
  const size = 30;
  const tiles: Tile[][] = Array(size).fill(null).map((_, y) =>
    Array(size).fill(null).map((_, x) => {
      const position = { x, y };
      // 30%概率生成资源格子
      if (Math.random() < 0.3) {
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
    set(state => ({
      collectedResources: [...state.collectedResources, resource]
    }));
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