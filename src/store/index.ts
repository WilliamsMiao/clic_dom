import { create } from 'zustand';

interface ResourceState {
  resources: {
    [key: string]: number;
  };
  warriors: {
    [key: string]: number;
  };
  updateResources: (resource: string, amount: number) => void;
  updateWarriors: (warrior: string, amount: number) => void;
}

export const useStore = create<ResourceState>((set) => ({
  resources: {
    金: 0,
    木: 0,
    水: 0,
    火: 0,
    土: 0,
  },
  warriors: {
    金兵: 0,
    木兵: 0,
    水兵: 0,
    火兵: 0,
    土兵: 0,
  },
  updateResources: (resource, amount) =>
    set((state) => ({
      resources: {
        ...state.resources,
        [resource]: Math.max(0, (state.resources[resource] || 0) + amount),
      },
    })),
  updateWarriors: (warrior, amount) =>
    set((state) => ({
      warriors: {
        ...state.warriors,
        [warrior]: Math.max(0, (state.warriors[warrior] || 0) + amount),
      },
    })),
})); 