import React from 'react';
import styled from 'styled-components';
import { useGameStore } from '../../store/GameStore';
import { ResourceType } from '../../types/GameTypes';

const Bar = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 20px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
`;

const Resource = styled.div`
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const resourceIcons: Record<ResourceType, string> = {
  [ResourceType.LIFE]: '❤️',
  [ResourceType.ENERGY]: '⚡',
  [ResourceType.ECONOMY]: '💰',
  [ResourceType.DEFENSE]: '🛡️'
};

export const ResourceBar: React.FC = () => {
  const { resources } = useGameStore();

  return (
    <Bar>
      {Object.entries(resources).map(([type, value]) => (
        <Resource key={type}>
          <span>{resourceIcons[type as ResourceType]}</span>
          <span>{value}</span>
        </Resource>
      ))}
    </Bar>
  );
}; 