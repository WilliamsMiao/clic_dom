import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import Sandbox from '../components/Sandbox';
import { CharacterCard, Character as CardCharacter } from '../components/CharacterCard';
import { useGameStore } from '../store/GameStore';
import { ResourceType } from '../types/GameTypes';
import { useNavigate } from 'react-router-dom';

// 更改背景和整体风格为中国风
const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #0a0a0a url('/assets/chinese-pattern.png');
  min-height: 100vh;
  color: white;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(139, 0, 0, 0.2) 0%, rgba(10, 10, 10, 0) 70%);
    pointer-events: none;
  }
`;

const BackgroundCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin-bottom: 20px;
  justify-content: space-between;
  border-bottom: 2px solid #8b0000;
  padding-bottom: 10px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    right: 0;
    height: 1px;
    background: rgba(255, 215, 0, 0.3);
  }
`;

const GameTitle = styled.h1`
  font-family: 'YouYuan', 'STXingkai', serif;
  color: #ffd700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.4);
  margin: 0;
  font-size: 36px;
  letter-spacing: 4px;
  position: relative;
  
  &::before, &::after {
    content: '❖';
    font-size: 24px;
    opacity: 0.7;
    position: relative;
    top: -4px;
    margin: 0 10px;
  }
`;

// 中国风战斗按钮
const BattleButton = styled.button`
  padding: 10px 25px;
  font-size: 16px;
  background: linear-gradient(to bottom, #d4af37, #996515);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3), 0 0 10px rgba(255, 215, 0, 0.3);
  font-family: 'Microsoft YaHei', sans-serif;
  border: 1px solid #ffd700;
  position: relative;
  overflow: hidden;

  &:hover {
    background: linear-gradient(to bottom, #ffd700, #d4af37);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3), 0 0 15px rgba(255, 215, 0, 0.5);
  }

  &:active {
    transform: translateY(1px);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 60%);
    transform: rotate(45deg);
    transition: all 0.3s;
    opacity: 0;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

// 返回主页按钮放在左上角，保持金色风格
const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  padding: 8px 16px;
  font-size: 14px;
  background: linear-gradient(to bottom, #d4af37, #996515);
  color: white;
  border: 1px solid #ffd700;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 10px rgba(255, 215, 0, 0.3);
  font-family: 'Microsoft YaHei', sans-serif;
  z-index: 10;
  
  &:hover {
    background: linear-gradient(to bottom, #ffd700, #d4af37);
    transform: translateY(-2px);
  }
`;

// 三列布局容器
const GamePlayLayout = styled.div`
  display: flex;
  width: 100%;
  max-width: 1200px;
  gap: 20px;
  margin-bottom: 20px;
`;

// 左侧角色卡片区域
const LeftSidebar = styled.div`
  width: 220px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px;
  background: rgba(26, 26, 26, 0.8);
  border-radius: 8px;
  border: 1px solid #8b0000;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5), 0 0 20px rgba(139, 0, 0, 0.3);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    border-radius: 6px;
    border: 1px dashed rgba(255, 215, 0, 0.2);
    pointer-events: none;
    z-index: 0;
  }
`;

const SidebarTitle = styled.h3`
  color: #ffd700;
  font-family: 'YouYuan', 'STXingkai', serif;
  margin: 0 0 10px 0;
  padding-bottom: 8px;
  border-bottom: 1px dashed #8b0000;
  text-align: center;
  position: relative;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 30%;
    right: 30%;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(255, 215, 0, 0.5), transparent);
  }
`;

// 中央棋盘区域
const BoardArea = styled.div`
  flex: 1;
  padding: 15px;
  background: rgba(26, 26, 26, 0.9);
  border-radius: 8px;
  border: 1px solid #8b0000;
  min-height: 500px;
  position: relative;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5), 0 0 30px rgba(139, 0, 0, 0.2);
  
  &::before {
    content: "";
    position: absolute;
    top: 5px;
    right: 5px;
    bottom: 5px;
    left: 5px;
    border: 1px dashed #8b0000;
    pointer-events: none;
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/assets/board-pattern.png');
    background-size: 100px;
    opacity: 0.05;
    pointer-events: none;
    z-index: 0;
  }
`;

// 右侧资源按钮区域
const RightSidebar = styled.div`
  width: 220px;
  padding: 15px;
  background: rgba(26, 26, 26, 0.8);
  border-radius: 8px;
  border: 1px solid #8b0000;
  display: flex;
  flex-direction: column;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5), 0 0 20px rgba(139, 0, 0, 0.3);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    border-radius: 6px;
    border: 1px dashed rgba(255, 215, 0, 0.2);
    pointer-events: none;
    z-index: 0;
  }
`;

// 修改为垂直排列资源卡片
const ResourceArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
  overflow-y: auto;
  max-height: 500px;
  padding-right: 5px;
  position: relative;
  z-index: 1;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #1a1a1a;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #8b0000;
    border-radius: 3px;
  }
`;

// 修改资源卡片为长条形，适合侧边栏
const ResourceCard = styled.div<{ resourceType: ResourceType; isSelected: boolean }>`
  display: flex;
  align-items: center;
  background: #1a1a1a;
  border: 2px solid ${props => props.isSelected ? '#ffd700' : getResourceColor(props.resourceType)};
  border-radius: 8px;
  padding: 8px;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateX(-4px);
    box-shadow: 0 0 12px ${props => getResourceColor(props.resourceType)}66;
    
    .resource-tooltip {
      display: block;
    }
  }

  ${props => props.isSelected && `
    background: #2a2a2a;
    box-shadow: 0 0 12px ${getResourceColor(props.resourceType)}66;
  `}
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 6px;
    box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.6);
    pointer-events: none;
  }
`;

// 修改为放在左侧的小图标
const ResourceCharacter = styled.div<{ resourceType: ResourceType }>`
  font-size: 24px;
  color: ${props => getResourceColor(props.resourceType)};
  text-shadow: 0 0 8px ${props => getResourceColor(props.resourceType)}66;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #222;
  margin-right: 10px;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    width: 60px;
    height: 60px;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%);
  }
`;

// 资源名称显示
const ResourceName = styled.div`
  font-size: 14px;
  color: #ccc;
  flex-grow: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
`;

const ResourceAmount = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #8b0000;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 215, 0, 0.3);
`;

const ResourceTooltip = styled.div`
  display: none;
  position: absolute;
  top: 0;
  left: -120px;
  margin-top: 8px;
  background: #2a2a2a;
  border: 1px solid #8b0000;
  border-radius: 4px;
  padding: 8px;
  width: 120px;
  z-index: 100;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  
  &:before {
    content: '';
    position: absolute;
    top: 10px;
    right: -5px;
    transform: rotate(45deg);
    width: 10px;
    height: 10px;
    background: #2a2a2a;
    border-top: 1px solid #8b0000;
    border-right: 1px solid #8b0000;
  }
`;

const TooltipContent = styled.div`
  color: #ccc;
  font-size: 12px;
  text-align: center;
`;

// 自定义的角色卡片容器，使用符号而非图片
const CharacterArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  z-index: 1;
`;

// 自定义角色卡片（替代CharacterCard组件）
const CustomCharacterCard = styled.div<{ isSelected: boolean }>`
  background: ${props => props.isSelected ? 'rgba(139, 0, 0, 0.6)' : 'rgba(26, 26, 26, 0.8)'};
  border: 1px solid ${props => props.isSelected ? '#ffd700' : '#8b0000'};
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: ${props => props.isSelected ? '0 0 15px rgba(255, 215, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.4)'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 0, 0, 0.5);
  }
`;

const CharacterSymbol = styled.div`
  font-size: 24px;
  color: #ffd700;
  text-align: center;
  margin-bottom: 4px;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  font-family: 'YouYuan', 'STXingkai', serif;
`;

const CharacterName = styled.div`
  font-size: 14px;
  color: #eee;
  text-align: center;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
`;

const CharacterHealthBar = styled.div<{ percentage: number }>`
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.5);
  margin-top: 6px;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: ${props => props.percentage}%;
    height: 100%;
    background: linear-gradient(to right, #8b0000, #ff4500);
    border-radius: 3px;
    transition: width 0.3s ease;
  }
`;

// 组合按钮使用中国风样式
const CombineButton = styled.button<{ isAvailable: boolean }>`
  padding: 10px 16px;
  background: ${props => props.isAvailable ? 'linear-gradient(to bottom, #8b0000, #5a0000)' : '#333'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: ${props => props.isAvailable ? 'pointer' : 'not-allowed'};
  margin-top: 15px;
  transition: all 0.3s ease;
  border: ${props => props.isAvailable ? '1px solid #ffd700' : '1px solid #333'};
  font-family: 'Microsoft YaHei', sans-serif;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  z-index: 1;

  &:hover {
    background: ${props => props.isAvailable ? 'linear-gradient(to bottom, #a00000, #8b0000)' : '#333'};
    transform: ${props => props.isAvailable ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.isAvailable ? '0 6px 12px rgba(0, 0, 0, 0.4)' : '0 4px 8px rgba(0, 0, 0, 0.3)'};
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
    transform: rotate(45deg);
    transition: all 0.6s;
    opacity: 0;
    z-index: -1;
  }
  
  &:hover::after {
    opacity: ${props => props.isAvailable ? 1 : 0};
  }
`;

// 装饰元素 - 古代钱币
const Decoration = styled.div`
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 215, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 215, 0, 0.3);
  font-size: 20px;
  opacity: 0.3;
  pointer-events: none;
`;

const TopLeftDecoration = styled(Decoration)`
  top: 40px;
  left: 40px;
`;

const BottomRightDecoration = styled(Decoration)`
  bottom: 40px;
  right: 40px;
`;

// 根据角色类型返回对应的图标符号
const getCharacterSymbol = (characterType: string): string => {
  switch (characterType.toLowerCase()) {
    case 'warrior':
    case '战士':
      return '⚔️';
    case 'mage':
    case '法师':
      return '🔮';
    case 'archer':
    case '射手':
      return '🏹';
    case 'priest':
    case '祭司':
      return '✝️';
    case 'assassin':
    case '刺客':
      return '🗡️';
    default:
      return '👤';
  }
};

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

// Define a type for grouped resources
interface GroupedResource {
  id: string;
  resourceType: ResourceType;
  character: string;
  count: number;
  description?: string;
  originalIds: string[];
}

// Group resources by type and character
const groupResourcesByType = (resources: any[]): GroupedResource[] => {
  const grouped = resources.reduce<Record<string, GroupedResource>>((acc, resource) => {
    // Create a unique key combining type and character
    const key = `${resource.resourceType || ResourceType.ECONOMY}_${resource.character}`;
    
    if (!acc[key]) {
      acc[key] = {
        id: key,
        resourceType: resource.resourceType || ResourceType.ECONOMY,
        character: resource.character,
        count: 1,
        description: resource.description,
        // Store the original IDs in an array
        originalIds: [resource.id]
      };
    } else {
      acc[key].count += 1;
      acc[key].originalIds.push(resource.id);
    }
    
    return acc;
  }, {});
  
  return Object.values(grouped);
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
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const canCombine = checkCombinationAvailable() !== null;

  const handleResourceClick = (id: string) => {
    toggleResourceSelection(id);
  };

  const handleCombineClick = () => {
    if (canCombine) {
      combineResources();
    }
  };

  // 背景动画效果
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 创建悬浮粒子
    const particles: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    function drawParticles() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 215, 0, ${p.opacity})`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        p.y -= p.speed;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
      });
      
      requestAnimationFrame(drawParticles);
    }

    drawParticles();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <GameContainer>
      <BackgroundCanvas ref={canvasRef} />
      <TopLeftDecoration>⎊</TopLeftDecoration>
      <BottomRightDecoration>⎊</BottomRightDecoration>
      <BackButton onClick={() => navigate('/match')}>
        返回主页
      </BackButton>

      <ContentWrapper>
        <TopBar>
          <GameTitle>渔翁之战-采集</GameTitle>
          <BattleButton onClick={toggleBattleMode}>
            开始战斗
          </BattleButton>
        </TopBar>
        
        <GamePlayLayout>
          {/* 左侧角色卡片区域 - 使用自定义角色卡片 */}
          <LeftSidebar>
            <SidebarTitle>角色</SidebarTitle>
            <CharacterArea>
              {characters.map(char => (
                <CustomCharacterCard
                  key={char.id}
                  isSelected={char.id === selectedCharacter}
                  onClick={() => selectCharacter(char.id)}
                >
                  <CharacterSymbol>
                    {getCharacterSymbol(char.character)}
                  </CharacterSymbol>
                  <CharacterName>{char.character}</CharacterName>
                  <CharacterHealthBar percentage={100} />
                </CustomCharacterCard>
              ))}
            </CharacterArea>
          </LeftSidebar>
          
          {/* 中间棋盘区域 */}
          <BoardArea>
            <Sandbox />
          </BoardArea>
          
          {/* 右侧资源按钮区域 */}
          <RightSidebar>
            <SidebarTitle>五行资源</SidebarTitle>
            <ResourceArea>
              {groupResourcesByType(collectedResources).map(resourceGroup => (
                <ResourceCard 
                  key={resourceGroup.id}
                  resourceType={resourceGroup.resourceType}
                  isSelected={resourceGroup.originalIds.some(id => selectedResources.includes(id))}
                  onClick={() => {
                    // Toggle all resources of this type when clicked
                    resourceGroup.originalIds.forEach(id => handleResourceClick(id));
                  }}
                >
                  <ResourceCharacter resourceType={resourceGroup.resourceType}>
                    {resourceGroup.character}
                  </ResourceCharacter>
                  <ResourceName>
                    {getResourceTypeName(resourceGroup.resourceType)}
                  </ResourceName>
                  <ResourceAmount>
                    {resourceGroup.count}
                  </ResourceAmount>
                  <ResourceTooltip className="resource-tooltip">
                    <TooltipContent>
                      {resourceGroup.description || getResourceTypeName(resourceGroup.resourceType)}
                    </TooltipContent>
                  </ResourceTooltip>
                </ResourceCard>
              ))}
            </ResourceArea>
            
            {/* 组合按钮放在资源按钮下方 */}
            {selectedResources.length > 0 && (
              <CombineButton 
                isAvailable={canCombine}
                onClick={handleCombineClick}
              >
                五行相生
              </CombineButton>
            )}
          </RightSidebar>
        </GamePlayLayout>

        {/* 添加跳转到资源合成界面的按钮 */}
        <SynthesisButton onClick={() => navigate('/warrior-synthesis')}>
          资源合成
        </SynthesisButton>
      </ContentWrapper>
    </GameContainer>
  );
};

// 添加按钮样式
const SynthesisButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 24px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: all 0.3s ease;

  &:hover {
    background-color: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`;

export default Game;