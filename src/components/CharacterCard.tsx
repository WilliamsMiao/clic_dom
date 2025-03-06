import React from 'react';
import styled from 'styled-components';
import { Hanzi } from '../types/GameTypes';

interface Props {
  character: Hanzi;
  isSelected: boolean;
  onSelect: () => void;
}

const Card = styled.div<{ isSelected: boolean }>`
  width: 60px;
  height: 60px;
  background: ${props => props.isSelected ? '#2a2a2a' : '#1a1a1a'};
  border: 2px solid ${props => props.isSelected ? '#4a9' : '#333'};
  border-radius: 8px;
  padding: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    border-color: #4a9;
    
    .stats-tooltip {
      display: block;
    }
  }

  &:after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 8px;
    border: 2px solid transparent;
    transition: all 0.3s ease;
    pointer-events: none;
  }

  ${props => props.isSelected && `
    &:after {
      border-color: #4a9;
      animation: pulse 2s infinite;
    }
  `}

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(74, 153, 153, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(74, 153, 153, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(74, 153, 153, 0);
    }
  }
`;

const Character = styled.div`
  font-size: 32px;
  text-align: center;
  color: #fff;
  line-height: 50px;
  height: 100%;
`;

const StatsTooltip = styled.div`
  display: none;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 8px;
  background: #2a2a2a;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 8px;
  width: 120px;
  z-index: 100;
  
  &:before {
    content: '';
    position: absolute;
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid #333;
  }
`;

const Stat = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #aaa;
  font-size: 12px;
  padding: 2px 4px;
  
  span:last-child {
    color: #fff;
  }
`;

export const CharacterCard: React.FC<Props> = ({ character, isSelected, onSelect }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('character', character.id);
  };

  const handleClick = () => {
    onSelect();
  };

  return (
    <Card
      isSelected={isSelected}
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
    >
      <Character>{character.character}</Character>
      <StatsTooltip className="stats-tooltip">
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
      </StatsTooltip>
    </Card>
  );
}; 