import React from 'react';
import styled from 'styled-components';
import { useGameStore } from '../../store/GameStore';
import { HanziCard } from './HanziCard';

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  margin: 20px;
`;

export const GameBoard: React.FC = () => {
  const { characters, selectedCharacter, selectCharacter } = useGameStore();

  return (
    <Board>
      {characters.map((character) => (
        <HanziCard
          key={character.id}
          hanzi={character}
          isSelected={selectedCharacter === character.id}
          onClick={() => selectCharacter(character.id)}
        />
      ))}
    </Board>
  );
}; 