import React from 'react';
import styled from 'styled-components';
import { Sandbox } from '../components/Sandbox';
import { CharacterCard } from '../components/CharacterCard';
import { useGameStore } from '../store/GameStore';

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #0a0a0a;
  min-height: 100vh;
  color: white;
`;

const CharacterArea = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`;

const ResourceArea = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
  max-width: 800px;
`;

const ResourceCard = styled.div`
  width: 80px;
  height: 100px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const ResourceCharacter = styled.div`
  font-size: 32px;
  color: #4a9;
`;

const ResourceAmount = styled.div`
  font-size: 12px;
  color: #aaa;
`;

export const Game: React.FC = () => {
  const { characters, selectedCharacter, selectCharacter, collectedResources } = useGameStore();

  return (
    <GameContainer>
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
      <Sandbox />
      <ResourceArea>
        {collectedResources.map(resource => (
          <ResourceCard key={resource.id}>
            <ResourceCharacter>{resource.character}</ResourceCharacter>
            <ResourceAmount>数量：{resource.resourceAmount}</ResourceAmount>
          </ResourceCard>
        ))}
      </ResourceArea>
    </GameContainer>
  );
}; 