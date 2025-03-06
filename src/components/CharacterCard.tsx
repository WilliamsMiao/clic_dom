import React from 'react';
import styled from 'styled-components';
import { Hanzi } from '../types/GameTypes';

interface Props {
  character: Hanzi;
  isSelected: boolean;
  onSelect: () => void;
}

const Card = styled.div<{ isSelected: boolean }>`
  width: 120px;
  height: 160px;
  background: ${props => props.isSelected ? '#2a2a2a' : '#1a1a1a'};
  border: 2px solid ${props => props.isSelected ? '#4a9' : '#333'};
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    border-color: #4a9;
  }
`;

const Character = styled.div`
  font-size: 48px;
  text-align: center;
  margin-bottom: 12px;
  color: #fff;
`;

const Stats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Stat = styled.div`
  display: flex;
  justify-content: space-between;
  color: #aaa;
  font-size: 14px;
`;

export const CharacterCard: React.FC<Props> = ({ character, isSelected, onSelect }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('character', character.id);
  };

  return (
    <Card
      isSelected={isSelected}
      onClick={onSelect}
      draggable
      onDragStart={handleDragStart}
    >
      <Character>{character.character}</Character>
      <Stats>
        <Stat>
          <span>生命</span>
          <span>{character.stats.health}</span>
        </Stat>
        <Stat>
          <span>能量</span>
          <span>{character.stats.energy}</span>
        </Stat>
        {character.stats.gathering && (
          <Stat>
            <span>采集</span>
            <span>{character.stats.gathering}</span>
          </Stat>
        )}
        {character.stats.speed && (
          <Stat>
            <span>速度</span>
            <span>{character.stats.speed}</span>
          </Stat>
        )}
      </Stats>
    </Card>
  );
}; 