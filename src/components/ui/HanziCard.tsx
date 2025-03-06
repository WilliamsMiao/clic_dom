import React from 'react';
import styled from 'styled-components';
import { Hanzi } from '../../types/GameTypes';

interface Props {
  hanzi: Hanzi;
  isSelected?: boolean;
  onClick?: () => void;
}

const Card = styled.div<{ isSelected?: boolean }>`
  width: 120px;
  padding: 12px;
  background: ${props => props.isSelected ? '#2a4365' : '#1a365d'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const Character = styled.div`
  font-size: 32px;
  text-align: center;
  color: #fff;
  margin-bottom: 8px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  font-size: 12px;
  color: #cbd5e0;
`;

const Stat = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const HanziCard: React.FC<Props> = ({ hanzi, isSelected, onClick }) => {
  return (
    <Card isSelected={isSelected} onClick={onClick}>
      <Character>{hanzi.character}</Character>
      <Stats>
        <Stat>生命: {hanzi.stats.health}</Stat>
        <Stat>能量: {hanzi.stats.energy}</Stat>
        <Stat>采集: {hanzi.stats.gathering}</Stat>
        <Stat>速度: {hanzi.stats.speed}</Stat>
      </Stats>
    </Card>
  );
}; 