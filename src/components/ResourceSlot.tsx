import React from 'react';
import styled from 'styled-components';
import { ResourceType } from '../types/GameTypes';

interface ResourceSlotProps {
  resourceType?: ResourceType;
  imageUrl?: string;
  onDrop: (resourceType: ResourceType, imageUrl?: string) => void;
  index: number;
  onClick?: () => void;
}

const SlotContainer = styled.div<{ hasContent?: boolean }>`
  width: 80px;
  height: 80px;
  border: 2px dashed #8b0000;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(26, 26, 26, 0.8);
  position: relative;
  transition: all 0.3s ease;
  cursor: ${props => props.hasContent ? 'pointer' : 'default'};

  &:hover {
    border-color: #ffd700;
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  }
`;

const ResourceIcon = styled.div<{ resourceType: ResourceType }>`
  font-size: 32px;
  color: ${props => {
    switch (props.resourceType) {
      case ResourceType.ECONOMY: return '#ffd700';
      case ResourceType.WOOD: return '#8b4513';
      case ResourceType.WATER: return '#00ffff';
      case ResourceType.FIRE: return '#ff4500';
      case ResourceType.EARTH: return '#8b0000';
      case ResourceType.LIFE: return '#ff69b4';
      case ResourceType.ENERGY: return '#00ff00';
      default: return '#ffffff';
    }
  }};
  text-shadow: 0 0 8px currentColor;
`;

const ResourceImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
`;

const SlotNumber = styled.div`
  position: absolute;
  top: -10px;
  left: -10px;
  width: 20px;
  height: 20px;
  background: #8b0000;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

const ResourceSlot: React.FC<ResourceSlotProps> = ({ resourceType, imageUrl, onDrop, index, onClick }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedResourceType = e.dataTransfer.getData('resourceType') as ResourceType;
    const droppedImageUrl = e.dataTransfer.getData('resourceImageUrl');
    onDrop(droppedResourceType, droppedImageUrl || undefined);
  };

  const handleClick = () => {
    if (resourceType && onClick) {
      onClick();
    }
  };

  return (
    <SlotContainer
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      hasContent={!!resourceType}
    >
      <SlotNumber>{index + 1}</SlotNumber>
      {imageUrl ? (
        <ResourceImage src={imageUrl} alt={resourceType || 'slot'} />
      ) : resourceType ? (
        <ResourceIcon resourceType={resourceType}>
          {(() => {
            switch (resourceType) {
              case ResourceType.ECONOMY: return '金';
              case ResourceType.WOOD: return '木';
              case ResourceType.WATER: return '水';
              case ResourceType.FIRE: return '火';
              case ResourceType.EARTH: return '土';
              case ResourceType.LIFE: return '命';
              case ResourceType.ENERGY: return '能';
              default: return '?';
            }
          })()}
        </ResourceIcon>
      ) : null}
    </SlotContainer>
  );
};

export default ResourceSlot; 