import React from 'react';
import styled from 'styled-components';
import { Hanzi, CharacterClass } from '../types/GameTypes';

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
  width: 160px;
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

const Description = styled.div`
  color: #888;
  font-size: 11px;
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid #444;
`;

const ClassBadge = styled.div`
  position: absolute;
  top: -8px;
  left: -8px;
  background: #4a9;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
`;

// 获取职业名称
const getClassName = (characterClass?: CharacterClass): string => {
  switch (characterClass) {
    case CharacterClass.WORKER:
      return '工人';
    case CharacterClass.FARMER:
      return '农民';
    case CharacterClass.WARRIOR:
      return '战士';
    case CharacterClass.SCHOLAR:
      return '学者';
    default:
      return '未知';
  }
};

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
      {character.class && (
        <ClassBadge>{getClassName(character.class)}</ClassBadge>
      )}
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
        {character.stats.attack && (
          <Stat>
            <span>攻击</span>
            <span>{character.stats.attack}</span>
          </Stat>
        )}
        {character.stats.defense && (
          <Stat>
            <span>防御</span>
            <span>{character.stats.defense}</span>
          </Stat>
        )}
        {character.stats.wisdom && (
          <Stat>
            <span>智慧</span>
            <span>{character.stats.wisdom}</span>
          </Stat>
        )}
        {character.stats.range && (
          <Stat>
            <span>范围</span>
            <span>{character.stats.range}</span>
          </Stat>
        )}
        {character.description && (
          <Description>{character.description}</Description>
        )}
      </StatsTooltip>
    </Card>
  );
}; 