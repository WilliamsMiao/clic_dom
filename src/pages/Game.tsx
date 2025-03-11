import React from 'react';
import styled from 'styled-components';
import Sandbox from '../components/Sandbox';
import { CharacterCard } from '../components/CharacterCard';
import { useGameStore } from '../store/GameStore';
import { ResourceType } from '../types/GameTypes';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #0a0a0a;
  min-height: 100vh;
  color: white;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 20px;
`;

const CharacterArea = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`;

const BattleButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 20px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #357abd;
    transform: translateY(-2px);
  }
`;

const ResourceArea = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
  max-width: 800px;
`;

const ResourceCard = styled.div<{ resourceType: ResourceType; isSelected: boolean }>`
  width: 60px;
  height: 60px;
  background: #1a1a1a;
  border: 2px solid ${props => props.isSelected ? '#fff' : getResourceColor(props.resourceType)};
  border-radius: 8px;
  padding: 4px;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px ${props => getResourceColor(props.resourceType)}33;
    
    .resource-tooltip {
      display: block;
    }
  }

  ${props => props.isSelected && `
    background: #2a2a2a;
    box-shadow: 0 0 12px ${getResourceColor(props.resourceType)}66;
  `}
`;

const ResourceCharacter = styled.div<{ resourceType: ResourceType }>`
  font-size: 32px;
  color: ${props => getResourceColor(props.resourceType)};
  text-shadow: 0 0 8px ${props => getResourceColor(props.resourceType)}66;
  line-height: 50px;
  text-align: center;
  height: 100%;
`;

const ResourceAmount = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #4a9;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
`;

const ResourceTooltip = styled.div`
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

const TooltipContent = styled.div`
  color: #aaa;
  font-size: 12px;
  text-align: center;
`;

const CombineButton = styled.button<{ isAvailable: boolean }>`
  padding: 8px 16px;
  background: ${props => props.isAvailable ? '#4a9' : '#333'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: ${props => props.isAvailable ? 'pointer' : 'not-allowed'};
  margin: 10px 0;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.isAvailable ? '#5ba' : '#333'};
  }
`;

// 根据资源类型返回对应的颜色
const getResourceColor = (type: ResourceType): string => {
  switch (type) {
    case ResourceType.ECONOMY:
      return '#ffd700'; // 金 - 金色
    case ResourceType.WOOD:
      return '#8b4513'; // 木 - 褐色
    case ResourceType.WATER:
      return '#00ffff'; // 水 - 青色
    case ResourceType.FIRE:
      return '#ff4500'; // 火 - 橙红色
    case ResourceType.EARTH:
      return '#8b0000'; // 土 - 深红色
    case ResourceType.LIFE:
      return '#ff69b4'; // 生命 - 粉色
    case ResourceType.ENERGY:
      return '#00ff00'; // 能量 - 绿色
    default:
      return '#4a9';
  }
};

// 根据资源类型返回对应的类型名称
const getResourceTypeName = (type: ResourceType): string => {
  switch (type) {
    case ResourceType.ECONOMY:
      return '金';
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
    default:
      return '资源';
  }
};

export const Game: React.FC = () => {
  const { 
    characters, 
    selectedCharacter, 
    selectCharacter, 
    collectedResources,
    selectedResources,
    toggleResourceSelection,
    clearResourceSelection,
    combineResources,
    checkCombinationAvailable,
    toggleBattleMode
  } = useGameStore();

  const canCombine = checkCombinationAvailable() !== null;

  const handleResourceClick = (id: string) => {
    toggleResourceSelection(id);
  };

  const handleCombineClick = () => {
    if (canCombine) {
      combineResources();
    }
  };

  return (
    <GameContainer>
      <TopBar>
        <CharacterArea>
          {characters.map(char => (
            <CharacterCard
              key={char.id}
              character={char}
              isSelected={char.id === selectedCharacter}
              onSelect={() => selectCharacter(char.id)}
            />
          ))}
        </CharacterArea>
        <BattleButton onClick={toggleBattleMode}>
          开始战斗
        </BattleButton>
      </TopBar>
      <Sandbox />
      <ResourceArea>
        {collectedResources.map(resource => (
          <ResourceCard 
            key={resource.id}
            resourceType={resource.resourceType || ResourceType.ECONOMY}
            isSelected={selectedResources.includes(resource.id)}
            onClick={() => handleResourceClick(resource.id)}
          >
            <ResourceCharacter resourceType={resource.resourceType || ResourceType.ECONOMY}>
              {resource.character}
            </ResourceCharacter>
            {resource.resourceAmount && (
              <ResourceAmount>
                {resource.resourceAmount}
              </ResourceAmount>
            )}
            <ResourceTooltip className="resource-tooltip">
              <TooltipContent>
                {getResourceTypeName(resource.resourceType || ResourceType.ECONOMY)}
                {resource.description && ` - ${resource.description}`}
              </TooltipContent>
            </ResourceTooltip>
          </ResourceCard>
        ))}
      </ResourceArea>
      {selectedResources.length > 0 && (
        <CombineButton 
          isAvailable={canCombine}
          onClick={handleCombineClick}
        >
          组合
        </CombineButton>
      )}
    </GameContainer>
  );
}; 