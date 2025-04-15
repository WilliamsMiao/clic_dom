import React from 'react';
import styled from 'styled-components';
import { useGameStore } from '../store/GameStore';
import { HanziCard } from './ui/HanziCard';

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h2`
  font-size: 20px;
  margin-bottom: 16px;
  color: #fff;
`;

const CharacterList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const CharacterPanel: React.FC = () => {
  const { characters, selectedCharacter, selectCharacter } = useGameStore();

  const handleDragStart = (e: React.DragEvent, character: any) => {
    e.dataTransfer.setData('hanzi', JSON.stringify(character));
  };

  return (
    <Panel>
      <Title>职能汉字</Title>
      <CharacterList>
        {characters.map((character) => (
          <div
            key={character.id}
            draggable
            onDragStart={(e) => handleDragStart(e, character)}
          >
            <HanziCard
              hanzi={character}
              isSelected={selectedCharacter === character.id}
              onClick={() => selectCharacter(character.id)}
            />
          </div>
        ))}
      </CharacterList>
    </Panel>
  );
}; 