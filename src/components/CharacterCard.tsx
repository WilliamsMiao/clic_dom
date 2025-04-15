import React from 'react';
import styled from 'styled-components';

// 角色类定义
export enum CharacterClass {
  UNKNOWN = 'unknown',
  FARMER = 'farmer',
  WARRIOR = 'warrior',
  SCHOLAR = 'scholar',
  STRATEGIST = 'strategist', // 谋士
  ARCHER = 'archer',         // 弓箭手
  PHYSICIAN = 'physician',   // 医师
  ASSASSIN = 'assassin',     // 刺客
  MERCHANT = 'merchant',      // 商人
  WORKER = 'worker'          // 工人
}

// 角色定义
export interface Character {
  id: string;
  character: string;
  hp: number;
  maxHp: number;
  class?: CharacterClass; // 添加职业属性
  level?: number;         // 添加等级属性
  skills?: Skill[];       // 添加技能属性
  attributes?: {          // 添加属性
    strength?: number;    // 力量
    intellect?: number;   // 智力
    agility?: number;     // 敏捷
    luck?: number;        // 幸运
  };
}

// 技能定义
export interface Skill {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  currentCooldown?: number;
  type: 'active' | 'passive';
  effect: () => void;
}

interface Props {
  character: Character;
  isSelected: boolean;
  isPlayer: boolean;
  onSelect: () => void;
}

// 样式组件
const Card = styled.div<{ isSelected: boolean; isPlayer: boolean }>`
  background-color: ${props => props.isPlayer ? '#f3e5ab' : '#e2c9a1'};
  border: 2px solid ${props => props.isSelected ? '#e67e22' : '#8d6e63'};
  border-radius: 10px;
  padding: 15px;
  width: 250px;
  max-width: 100%;
  box-shadow: ${props => props.isSelected ? '0 0 15px rgba(230, 126, 34, 0.5)' : '0 5px 15px rgba(0, 0, 0, 0.1)'};
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${props => props.isSelected ? '0 5px 20px rgba(230, 126, 34, 0.6)' : '0 8px 20px rgba(0, 0, 0, 0.15)'};
  }
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: ${props => props.isPlayer ? 
      'linear-gradient(90deg, #e67e22, #f39c12, #e67e22)' : 
      'linear-gradient(90deg, #7f8c8d, #95a5a6, #7f8c8d)'};
  }
`;

const CharacterName = styled.h3`
  font-size: 18px;
  color: #5d4037;
  margin: 0 0 10px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before,
  &::after {
    content: "◆";
    color: #8d6e63;
    margin: 0 8px;
    font-size: 14px;
  }
`;

const CharacterImage = styled.div<{ isPlayer: boolean }>`
  width: 100px;
  height: 100px;
  margin: 0 auto 15px;
  background-color: ${props => props.isPlayer ? '#f9e7c4' : '#e8d9b5'};
  border: 2px solid #8d6e63;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const CharacterAvatar = styled.img`
  width: 90%;
  height: 90%;
  object-fit: cover;
`;

const HealthBar = styled.div`
  background-color: #ddd;
  height: 15px;
  border-radius: 8px;
  margin-top: 10px;
  overflow: hidden;
  position: relative;
  border: 1px solid #8d6e63;
`;

const HealthFill = styled.div<{ percent: number }>`
  background: linear-gradient(90deg, #27ae60, #2ecc71);
  width: ${props => props.percent}%;
  height: 100%;
  transition: width 0.5s;
  
  ${props => props.percent < 30 && `
    background: linear-gradient(90deg, #c0392b, #e74c3c);
  `}
  
  ${props => props.percent >= 30 && props.percent < 60 && `
    background: linear-gradient(90deg, #f39c12, #f1c40f);
  `}
`;

const HealthText = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5d4037;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 0 0 2px #fff;
`;

const ClassBadge = styled.div`
  display: inline-block;
  background-color: #8d6e63;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 8px;
`;

const CharacterStats = styled.div`
  font-size: 13px;
  color: #5d4037;
  margin-top: 12px;
  
  p {
    margin: 4px 0;
    display: flex;
    justify-content: space-between;
  }
  
  span {
    color: #8d6e63;
    font-weight: bold;
  }
`;

const CharacterSkills = styled.div`
  margin-top: 10px;
  border-top: 1px dashed #d7ccc8;
  padding-top: 8px;
`;

const SkillItem = styled.div`
  font-size: 12px;
  color: #5d4037;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
`;

const SkillIcon = styled.div`
  width: 16px;
  height: 16px;
  background-color: #8d6e63;
  border-radius: 50%;
  margin-right: 5px;
  flex-shrink: 0;
`;

// 获取角色职业的中文名称
const getCharacterClassName = (charClass?: CharacterClass): string => {
  if (!charClass) return '未知';
  
  switch (charClass) {
    case CharacterClass.FARMER:
      return '农民';
    case CharacterClass.WARRIOR:
      return '战士';
    case CharacterClass.SCHOLAR:
      return '学者';
    case CharacterClass.STRATEGIST:
      return '谋士';
    case CharacterClass.WORKER:
      return '工人';
    case CharacterClass.PHYSICIAN:
      return '医师';
    case CharacterClass.ASSASSIN:
      return '刺客';
    case CharacterClass.MERCHANT:
      return '商人';
    default:
      return '未知';
  }
};

export const CharacterCard: React.FC<Props> = ({ character, isSelected, isPlayer, onSelect }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('character', character.id);
  };

  const handleClick = () => {
    onSelect();
  };

  // 计算血量百分比
  const healthPercent = Math.floor((character.hp / character.maxHp) * 100);
  
  // 默认角色头像
  const defaultAvatar = isPlayer ? '/assets/player-avatar.png' : '/assets/opponent-avatar.png';

  return (
    <Card
      isSelected={isSelected}
      isPlayer={isPlayer}
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
    >
      {character.class && (
        <ClassBadge>
          {getCharacterClassName(character.class)}
        </ClassBadge>
      )}
      
      <CharacterName>
        {character.character || (isPlayer ? '己方' : '敌方')}
      </CharacterName>
      
      <CharacterImage isPlayer={isPlayer}>
        <CharacterAvatar 
          src={defaultAvatar}
          alt={character.character} 
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/default-avatar.png';
          }}
        />
      </CharacterImage>
      
      <HealthBar>
        <HealthFill percent={healthPercent} />
        <HealthText>
          {character.hp} / {character.maxHp}
        </HealthText>
      </HealthBar>
      
      {character.attributes && (
        <CharacterStats>
          {character.attributes.strength !== undefined && (
            <p>力量: <span>{character.attributes.strength}</span></p>
          )}
          {character.attributes.intellect !== undefined && (
            <p>智力: <span>{character.attributes.intellect}</span></p>
          )}
          {character.attributes.agility !== undefined && (
            <p>敏捷: <span>{character.attributes.agility}</span></p>
          )}
          {character.attributes.luck !== undefined && (
            <p>幸运: <span>{character.attributes.luck}</span></p>
          )}
        </CharacterStats>
      )}
      
      {character.skills && character.skills.length > 0 && (
        <CharacterSkills>
          {character.skills.map(skill => (
            <SkillItem key={skill.id}>
              <SkillIcon />
              <span>{skill.name}</span>
            </SkillItem>
          ))}
        </CharacterSkills>
      )}
    </Card>
  );
};

export default CharacterCard;