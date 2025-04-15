import React from 'react';
import styled from 'styled-components';
import { ResourceType } from '../types/GameTypes';

interface ResourceCardProps {
  resourceType: ResourceType;
  count: number;
  isSelected?: boolean;
  isDisabled?: boolean;
  onClick: () => void;
  imageUrl?: string;
}

const CardContainer = styled.div<{ resourceType: ResourceType; isDisabled?: boolean }>`
  display: flex;
  align-items: center;
  background: #1a1a1a;
  border: 2px solid ${props => props.isDisabled ? '#555' : getResourceColor(props.resourceType)};
  border-radius: 8px;
  padding: 8px;
  margin: 4px;
  cursor: ${props => props.isDisabled ? 'not-allowed' : 'grab'};
  opacity: ${props => props.isDisabled ? 0.6 : 1};
  transition: all 0.3s ease;
  user-select: none;
  width: 150px;
  box-sizing: border-box;
  
  &:hover {
    transform: ${props => props.isDisabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.isDisabled ? 'none' : `0 0 12px ${getResourceColor(props.resourceType)}66`};
  }
`;

const ResourceIcon = styled.div<{ resourceType: ResourceType }>`
  font-size: 24px;
  color: ${props => getResourceColor(props.resourceType)};
  text-shadow: 0 0 8px currentColor;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #222;
  margin-right: 10px;
`;

const ResourceImage = styled.img`
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 10px;
`;

const ResourceInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ResourceName = styled.div`
  font-size: 14px;
  color: #ccc;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
`;

const ResourceCount = styled.div`
  font-size: 12px;
  color: #ffd700;
  margin-top: 2px;
`;

const getResourceColor = (type: ResourceType): string => {
  switch (type) {
    case ResourceType.ECONOMY: return '#ffd700';
    case ResourceType.WOOD: return '#8b4513';
    case ResourceType.WATER: return '#00ffff';
    case ResourceType.FIRE: return '#ff4500';
    case ResourceType.EARTH: return '#8b0000';
    case ResourceType.LIFE: return '#ff69b4';
    case ResourceType.ENERGY: return '#00ff00';
    default: return '#ffffff';
  }
};

const getResourceName = (type: ResourceType): string => {
  switch (type) {
    case ResourceType.ECONOMY: return '金';
    case ResourceType.WOOD: return '木';
    case ResourceType.WATER: return '水';
    case ResourceType.FIRE: return '火';
    case ResourceType.EARTH: return '土';
    case ResourceType.LIFE: return '生命';
    case ResourceType.ENERGY: return '能量';
    default: return '未知';
  }
};

const ResourceCard: React.FC<ResourceCardProps> = ({ resourceType, count, isDisabled, onClick, imageUrl }) => {
  const handleDragStart = (e: React.DragEvent) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('resourceType', resourceType);
    if (imageUrl) {
        e.dataTransfer.setData('resourceImageUrl', imageUrl);
    }
  };

  return (
    <CardContainer
      resourceType={resourceType}
      isDisabled={isDisabled}
      onClick={onClick}
      draggable={!isDisabled}
      onDragStart={handleDragStart}
    >
      {imageUrl ? (
        <ResourceImage src={imageUrl} alt={getResourceName(resourceType)} />
      ) : (
        <ResourceIcon resourceType={resourceType}>
          {getResourceName(resourceType)}
        </ResourceIcon>
      )}
      <ResourceInfo>
        <ResourceName>{getResourceName(resourceType)}</ResourceName>
        <ResourceCount>数量: {count}</ResourceCount>
      </ResourceInfo>
    </CardContainer>
  );
};

export default ResourceCard; 