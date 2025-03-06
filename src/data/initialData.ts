import { Hanzi, HanziType } from '../types/GameTypes';

export const initialCharacters: Hanzi[] = [
  {
    id: 'gong',
    character: '工',
    type: HanziType.BASIC,
    stats: {
      health: 100,
      energy: 80,
      attack: 5,
      defense: 3,
      level: 1,
      experience: 0
    }
  },
  {
    id: 'nong',
    character: '农',
    type: HanziType.BASIC,
    stats: {
      health: 120,
      energy: 60,
      attack: 3,
      defense: 4,
      level: 1,
      experience: 0
    }
  },
  {
    id: 'bing',
    character: '兵',
    type: HanziType.BASIC,
    stats: {
      health: 150,
      energy: 100,
      attack: 8,
      defense: 5,
      level: 1,
      experience: 0
    }
  },
  {
    id: 'jiang',
    character: '将',
    type: HanziType.BASIC,
    stats: {
      health: 200,
      energy: 120,
      attack: 10,
      defense: 8,
      level: 1,
      experience: 0
    }
  }
]; 