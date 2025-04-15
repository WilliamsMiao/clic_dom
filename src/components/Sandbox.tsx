import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useGameStore } from '../store/GameStore';
import { Position, Hanzi, TileType, ResourceType } from '../types/GameTypes';

const SandboxContainer = styled.div<{ battleMode: boolean }>`
  width: ${props => props.battleMode ? '1200px' : '600px'};
  height: 600px;
  overflow: hidden;
  position: relative;
  background: #1a1a1a;
  border: 1px solid #333;
  margin: 20px auto;
  transition: width 0.3s ease;
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  cursor: pointer;
`;

const FloatingText = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  color: #4a9;
  font-size: 16px;
  animation: float 1s ease-out forwards;
  pointer-events: none;
  
  @keyframes float {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    100% {
      transform: translateY(-30px);
      opacity: 0;
    }
  }
`;

const TILE_SIZE = 20; // 增大格子大小
const MINING_FRAMES = 16; // 墽加挖掘动画帧数
const MINING_FRAME_INTERVAL = 150; // 每帧间隔时间（毫秒）
const MINING_DURATION = 1500; // 总采集时间（毫秒）
const GLOW_INTENSITY = 0.6; // 发光强度
const GLOW_SIZE = 6; // 发光范围

interface FloatingMessage {
  id: string;
  x: number;
  y: number;
  text: string;
}

interface MiningEffect {
  position: Position;
  frame: number;
  maxFrames: number;
}

interface DragPosition {
  x: number;
  y: number;
}

// 根据资源类型返回对应的颜色
const getResourceColor = (resourceType: ResourceType): string => {
  switch (resourceType) {
    case ResourceType.ECONOMY: return '#ffd700'; // 金色
    case ResourceType.WOOD: return '#8b4513'; // 木色
    case ResourceType.WATER: return '#00ffff'; // 水色
    case ResourceType.FIRE: return '#ff4500'; // 火色
    case ResourceType.EARTH: return '#8b0000'; // 土色
    case ResourceType.LIFE: return '#ff69b4'; // 生命色
    case ResourceType.ENERGY: return '#00ff00'; // 能量色
    default: return '#ffffff';
  }
};

// 根据角色获取采集范围内的所有位置
const getCollectionRange = (center: Position, character?: Hanzi): Position[] => {
  const positions: Position[] = [];
  if (!character || !character.collectionRange) return positions;
  
  const { top, right, bottom, left } = character.collectionRange;
  
  for (let dy = -top; dy <= bottom; dy++) {
    for (let dx = -left; dx <= right; dx++) {
      positions.push({
        x: center.x + dx,
        y: center.y + dy
      });
    }
  }
  return positions;
};

const Sandbox: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [floatingMessages, setFloatingMessages] = useState<FloatingMessage[]>([]);
  const [miningEffects, setMiningEffects] = useState<MiningEffect[]>([]);
  const [dragPosition, setDragPosition] = useState<DragPosition | null>(null);
  const [hoverPosition, setHoverPosition] = useState<Position | null>(null);
  const { 
    sandbox, 
    characters, 
    selectedCharacter, 
    moveCharacter, 
    startGathering, 
    addCollectedResource,
    clearTile 
  } = useGameStore();
  const { size, tiles, city, battleMode, battleTiles } = sandbox;

  // 计算总画布宽度（考虑战斗模式）
  const totalWidth = battleMode ? size * 2 * TILE_SIZE : size * TILE_SIZE;
  const height = size * TILE_SIZE;

  // 开始挖掘动画
  const startMiningAnimation = (position: Position) => {
    setMiningEffects(prev => [
      ...prev,
      {
        position,
        frame: 0,
        maxFrames: MINING_FRAMES
      }
    ]);
  };
  
  // 绘制预览效果（包括悬停和拖拽）
  const drawPreviewEffect = (ctx: CanvasRenderingContext2D, position: Position, isInBattleMap: boolean = false) => {
    const pixelX = (isInBattleMap ? position.x + size : position.x) * TILE_SIZE;
    const pixelY = position.y * TILE_SIZE;

    // 绘制外发光效果
    const gradient = ctx.createRadialGradient(
      pixelX + TILE_SIZE/2, pixelY + TILE_SIZE/2, 0,
      pixelX + TILE_SIZE/2, pixelY + TILE_SIZE/2, TILE_SIZE
    );
    gradient.addColorStop(0, 'rgba(74, 153, 153, 0.6)');
    gradient.addColorStop(1, 'rgba(74, 153, 153, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(
      pixelX - TILE_SIZE/2,
      pixelY - TILE_SIZE/2,
      TILE_SIZE * 2,
      TILE_SIZE * 2
    );

    // 绘制动态边框
    const time = Date.now() / 500;
    const borderAlpha = Math.abs(Math.sin(time));
    ctx.strokeStyle = `rgba(74, 255, 255, ${0.5 + borderAlpha * 0.5})`;
    ctx.lineWidth = 2;

    // 绘制四个角
    const cornerSize = TILE_SIZE / 3;
    // 左上角
    ctx.beginPath();
    ctx.moveTo(pixelX, pixelY + cornerSize);
    ctx.lineTo(pixelX, pixelY);
    ctx.lineTo(pixelX + cornerSize, pixelY);
    ctx.stroke();

    // 右上角
    ctx.beginPath();
    ctx.moveTo(pixelX + TILE_SIZE - cornerSize, pixelY);
    ctx.lineTo(pixelX + TILE_SIZE, pixelY);
    ctx.lineTo(pixelX + TILE_SIZE, pixelY + cornerSize);
    ctx.stroke();

    // 右下角
    ctx.beginPath();
    ctx.moveTo(pixelX + TILE_SIZE, pixelY + TILE_SIZE - cornerSize);
    ctx.lineTo(pixelX + TILE_SIZE, pixelY + TILE_SIZE);
    ctx.lineTo(pixelX + TILE_SIZE - cornerSize, pixelY + TILE_SIZE);
    ctx.stroke();

    // 左下角
    ctx.beginPath();
    ctx.moveTo(pixelX + cornerSize, pixelY + TILE_SIZE);
    ctx.lineTo(pixelX, pixelY + TILE_SIZE);
    ctx.lineTo(pixelX, pixelY + TILE_SIZE - cornerSize);
    ctx.stroke();

    // 绘制采集范围预览
    const character = selectedCharacter ? characters.find(char => char.id === selectedCharacter) : undefined;
    const collectionPositions = getCollectionRange(position, character);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + borderAlpha * 0.2})`; // 半透明白色
    ctx.lineWidth = 1;

    collectionPositions.forEach(pos => {
      if (pos.x >= 0 && pos.x < size && pos.y >= 0 && pos.y < size) {
        const rangeX = (isInBattleMap ? pos.x + size : pos.x) * TILE_SIZE;
        const rangeY = pos.y * TILE_SIZE;
        ctx.strokeRect(rangeX, rangeY, TILE_SIZE, TILE_SIZE);
      }
    });
    ctx.setLineDash([]); // 恢复实线
  };

  // 获取鼠标在地图上的位置
  const getMapPosition = (clientX: number, clientY: number): { position: Position; isInBattleMap: boolean } | null => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;

    const x = Math.floor((clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((clientY - rect.top) / TILE_SIZE);
    
    // 判断点击的是哪个地图
    const isMainMap = x < size;
    const isBattleMap = battleMode && x >= size && x < size * 2;
    
    if (isMainMap && y >= 0 && y < size) {
      return { position: { x, y }, isInBattleMap: false };
    } else if (isBattleMap && y >= 0 && y < size) {
      return { position: { x: x - size, y }, isInBattleMap: true };
    }
    
    return null;
  };

  // 处理拖动悬停
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const mapPosition = getMapPosition(e.clientX, e.clientY);
    if (mapPosition) {
      setDragPosition(mapPosition.position);
    }
  };

  // 处理拖动离开
  const handleDragLeave = () => {
    setDragPosition(null);
  };

  // 处理拖放
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const characterId = e.dataTransfer.getData('character');
    if (!characterId || !dragPosition) return;

    const { x, y } = dragPosition;
    if (x >= 0 && x < size && y >= 0 && y < size) {
      moveCharacter(characterId, { x, y });
      checkAdjacentResources({ x, y }, characterId);
    }
    
    setDragPosition(null);
  };

  // 处理点击事件
  const handleClick = (e: React.MouseEvent) => {
    if (!selectedCharacter) return;
    
    const mapPosition = getMapPosition(e.clientX, e.clientY);
    if (mapPosition) {
      moveCharacter(selectedCharacter, mapPosition.position);
      checkAdjacentResources(mapPosition.position, selectedCharacter);
    }
  };

  // 处理鼠标移动
  const handleMouseMove = (e: React.MouseEvent) => {
    const mapPosition = getMapPosition(e.clientX, e.clientY);
    setHoverPosition(mapPosition?.position || null);
  };

  // 处理鼠标离开
  const handleMouseLeave = () => {
    setHoverPosition(null);
  };

  // 绘制沙盘 - 增加中国风元素
  const drawSandbox = (ctx: CanvasRenderingContext2D) => {
    // 清空画布
    ctx.clearRect(0, 0, totalWidth, height);
    
    // 添加宣纸背景纹理
    const paperPattern = ctx.createLinearGradient(0, 0, 0, height);
    paperPattern.addColorStop(0, 'rgba(227, 223, 212, 0.05)');
    paperPattern.addColorStop(0.5, 'rgba(233, 229, 218, 0.03)');
    paperPattern.addColorStop(1, 'rgba(227, 223, 212, 0.05)');
    ctx.fillStyle = paperPattern;
    ctx.fillRect(0, 0, totalWidth, height);
    
    // 添加水墨风格装饰
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * totalWidth;
      const y = Math.random() * height;
      const radius = Math.random() * 80 + 20;
      
      const inkGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      inkGradient.addColorStop(0, 'rgba(0, 0, 0, 0.5)');
      inkGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = inkGradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
    
    // 绘制主地图
    tiles.forEach((row, y) => {
      row.forEach((tile, x) => {
        const posX = x * TILE_SIZE;
        const posY = y * TILE_SIZE;
        
        // 绘制格子背景 - 改为中国象棋风格的方格
        if (tile.type === TileType.EMPTY) {
          // 使用竹简/羊皮纸色调
          ctx.fillStyle = '#1a1812';
          ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
          
          // 添加纹理效果
          ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
          for (let i = 0; i < 3; i++) {
            const lineX = posX + Math.random() * TILE_SIZE;
            const lineY = posY + Math.random() * TILE_SIZE;
            const lineW = Math.random() * 2 + 1;
            const lineH = Math.random() * 2 + 1;
            ctx.fillRect(lineX, lineY, lineW, lineH);
          }
        } else if (tile.type === TileType.RESOURCE) {
          // 资源格子使用中国传统五行颜色
          const resourceColor = getResourceColor(tile.content?.resourceType || ResourceType.ECONOMY);
          // 创建渐变效果，模拟水墨晕染
          const gradient = ctx.createRadialGradient(
            posX + TILE_SIZE/2, posY + TILE_SIZE/2, 0,
            posX + TILE_SIZE/2, posY + TILE_SIZE/2, TILE_SIZE * 0.7
          );
          gradient.addColorStop(0, resourceColor);
          gradient.addColorStop(1, 'rgba(26, 24, 18, 0.8)');
          ctx.fillStyle = gradient;
          ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
          
          // 添加墨晕效果
          ctx.globalAlpha = 0.15;
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(posX + TILE_SIZE/2 + (Math.random() - 0.5) * 4, 
                 posY + TILE_SIZE/2 + (Math.random() - 0.5) * 4, 
                 TILE_SIZE * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        } else if (tile.type === TileType.CITY) {
          // 中国古城风格
          ctx.fillStyle = '#4a3c2a';
          ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
          
          // 城墙纹理
          ctx.strokeStyle = 'rgba(139, 69, 19, 0.6)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(posX + 2, posY + 2);
          ctx.lineTo(posX + TILE_SIZE - 2, posY + 2);
          ctx.lineTo(posX + TILE_SIZE - 2, posY + TILE_SIZE - 2);
          ctx.lineTo(posX + 2, posY + TILE_SIZE - 2);
          ctx.closePath();
          ctx.stroke();
        }
        
        // 绘制格子边界 - 改为毛笔风格线条
        ctx.strokeStyle = 'rgba(102, 51, 0, 0.3)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        // 微调线条位置，增加笔触感
        const offsetX = (Math.random() - 0.5) * 0.4;
        const offsetY = (Math.random() - 0.5) * 0.4;
        ctx.moveTo(posX + offsetX, posY + offsetY);
        ctx.lineTo(posX + TILE_SIZE + offsetX, posY + offsetY);
        ctx.lineTo(posX + TILE_SIZE + offsetX, posY + TILE_SIZE + offsetY);
        ctx.lineTo(posX + offsetX, posY + TILE_SIZE + offsetY);
        ctx.closePath();
        ctx.stroke();
        
        // 绘制资源
        if (tile.type === TileType.RESOURCE && tile.content) {
          // 使用毛笔字效果
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 16px "KaiTi", "STKaiti", "FangSong", serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // 添加书法效果
          ctx.save();
          // 微微旋转，增加书法感
          const rotation = (Math.random() - 0.5) * 0.1;
          ctx.translate(posX + TILE_SIZE/2, posY + TILE_SIZE/2);
          ctx.rotate(rotation);
          
          // 描边增加毛笔质感
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.lineWidth = 0.8;
          ctx.strokeText(tile.content.character, 0, 0);
          
          // 填充文字
          ctx.fillText(tile.content.character, 0, 0);
          ctx.restore();
        } else if (tile.type === TileType.CITY) {
          // 如果是主城中心位置，绘制城池图标和血量
          if (x === city.position.x && y === city.position.y) {
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 16px "KaiTi", "STKaiti", serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('城', posX + TILE_SIZE/2, posY + TILE_SIZE/2);
            
            // 绘制传统风格血量条
            const healthBarWidth = TILE_SIZE * 3;
            const healthBarHeight = 4;
            const healthPercentage = city.health / 1000;
            
            // 血条装饰边框
            ctx.strokeStyle = '#a17c50';
            ctx.lineWidth = 1;
            ctx.strokeRect(
              posX - TILE_SIZE,
              posY - 8,
              healthBarWidth + 2,
              healthBarHeight + 2
            );
            
            // 血条背景 - 羊皮纸风格
            ctx.fillStyle = '#3a2a1a';
            ctx.fillRect(
              posX - TILE_SIZE + 1,
              posY - 8 + 1,
              healthBarWidth,
              healthBarHeight
            );
            
            // 当前血量 - 朱砂红色
            ctx.fillStyle = '#b22222';
            ctx.fillRect(
              posX - TILE_SIZE + 1,
              posY - 8 + 1,
              healthBarWidth * healthPercentage,
              healthBarHeight
            );
          }
        }
      });
    });
    
    // 其余渲染代码继续...

    // 绘制挖掘效果
    miningEffects.forEach(effect => {
      drawMiningEffect(ctx, effect);
    });
    
    // 绘制角色
    characters.forEach(char => {
      if (char.position) {
        const posX = char.position.x * TILE_SIZE;
        const posY = char.position.y * TILE_SIZE;
        
        // 绘制角色背景
        if (char.isWorking) {
          // 工作状态下的闪烁效果
          const pulseAlpha = Math.abs(Math.sin(Date.now() / 400));
          
          // 绘制外发光效果
          const gradient = ctx.createRadialGradient(
            posX + TILE_SIZE/2, posY + TILE_SIZE/2, 0,
            posX + TILE_SIZE/2, posY + TILE_SIZE/2, GLOW_SIZE * 2
          );
          gradient.addColorStop(0, `rgba(255, 255, 0, ${GLOW_INTENSITY * pulseAlpha})`);
          gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(
            posX - GLOW_SIZE,
            posY - GLOW_SIZE,
            TILE_SIZE + GLOW_SIZE * 2,
            TILE_SIZE + GLOW_SIZE * 2
          );
          
          // 绘制角色主体
          ctx.fillStyle = `rgba(255, 200, 0, ${0.8 + pulseAlpha * 0.2})`;
        } else {
          ctx.fillStyle = char.id === selectedCharacter ? '#f00' : '#00f';
        }
        ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
        
        // 绘制角色文字
        ctx.fillStyle = '#fff';
        ctx.font = '14px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(char.character, posX + TILE_SIZE/2, posY + TILE_SIZE/2);
      }
    });

    // 绘制拖拽或悬停预览效果
    const mapPosition = getMapPosition(hoverPosition?.x || 0, hoverPosition?.y || 0);
    if (mapPosition && (dragPosition || (selectedCharacter && hoverPosition))) {
      drawPreviewEffect(ctx, mapPosition.position, mapPosition.isInBattleMap);
    }

    // 如果在战斗模式下，绘制战斗地图
    if (battleMode) {
      battleTiles.forEach((row, y) => {
        row.forEach((tile, x) => {
          const posX = (x + size) * TILE_SIZE; // 从主地图右侧开始绘制
          const posY = y * TILE_SIZE;

          // 绘制背景（与主地图相同的样式）
          ctx.fillStyle = '#222';
          ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
          
          // 绘制网格线（与主地图相同的样式）
          ctx.strokeStyle = '#1a1a1a';
          ctx.lineWidth = 1;
          ctx.strokeRect(posX, posY, TILE_SIZE, TILE_SIZE);

          // 如果格子有内容，绘制内容
          if (tile.type === TileType.RESOURCE && tile.content) {
            ctx.fillStyle = getResourceColor(tile.content.resourceType || ResourceType.ECONOMY);
            ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
            
            ctx.fillStyle = '#fff';
            ctx.font = '14px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tile.content.character, posX + TILE_SIZE/2, posY + TILE_SIZE/2);
          } else if (tile.type === TileType.CITY) {
            ctx.fillStyle = '#4a4a9a';
            ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);
          }
        });
      });

      // 在两个地图之间绘制分隔线
      ctx.strokeStyle = '#4a90e2';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(size * TILE_SIZE, 0);
      ctx.lineTo(size * TILE_SIZE, height);
      ctx.stroke();
    }
  };

  // 绘制挖掘动画
  const drawMiningEffect = (ctx: CanvasRenderingContext2D, effect: MiningEffect) => {
    const { position, frame } = effect;
    const pixelX = position.x * TILE_SIZE;
    const pixelY = position.y * TILE_SIZE;
    
    // 绘制裂纹效果
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    
    // 根据帧数绘制不同的裂纹图案
    const progress = frame / MINING_FRAMES;
    const cracks = Math.floor(progress * 6) + 1; // 增加裂纹数量
    
    for (let i = 0; i < cracks; i++) {
      const startX = pixelX + (Math.random() * TILE_SIZE);
      const startY = pixelY + (Math.random() * TILE_SIZE);
      const endX = startX + (Math.random() - 0.5) * 12; // 增加裂纹长度
      const endY = startY + (Math.random() - 0.5) * 12;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    // 添加破碎效果的发光
    const glowAlpha = 0.3 * (1 - progress);
    ctx.fillStyle = `rgba(255, 255, 255, ${glowAlpha})`;
    ctx.fillRect(pixelX, pixelY, TILE_SIZE, TILE_SIZE);
  };

  // 检查相邻格子的资源
  const checkAdjacentResources = (position: Position, characterId: string) => {
    const character = characters.find(char => char.id === characterId);
    if (!character) return;
    
    const collectionPositions = getCollectionRange(position, character);
    
    collectionPositions.forEach(pos => {
      if (pos.x >= 0 && pos.x < size && pos.y >= 0 && pos.y < size) {
        const tile = tiles[pos.y][pos.x];
        if (tile.type === TileType.RESOURCE && tile.content) {
          // 开始挖掘动画
          startMiningAnimation(pos);
          
          // 添加浮动文字
          const pixelX = pos.x * TILE_SIZE;
          const pixelY = pos.y * TILE_SIZE;
          const messageId = `msg_${Date.now()}_${Math.random()}`;
          
          setFloatingMessages(prev => [...prev, {
            id: messageId,
            x: pixelX,
            y: pixelY,
            text: '采集成功'
          }]);
          
          // 移除浮动文字和挖掘效果
          setTimeout(() => {
            setFloatingMessages(prev => prev.filter(msg => msg.id !== messageId));
            setMiningEffects(prev => prev.filter(effect => 
              effect.position.x !== pos.x || effect.position.y !== pos.y
            ));
            
            // 收集资源并清空格子
            if (tile.content) {
              addCollectedResource({
                ...tile.content,
                id: `collected_${Date.now()}_${Math.random()}`
              });
              clearTile(pos);
            }
          }, MINING_DURATION);
        }
      }
    });
  };

  // 动画循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = totalWidth;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = 0;
    
    const animate = (currentTime: number) => {
      if (currentTime - lastTime > MINING_FRAME_INTERVAL) {
        setMiningEffects(prev => prev.map(effect => ({
          ...effect,
          frame: effect.frame + 1
        })).filter(effect => effect.frame < effect.maxFrames));
        lastTime = currentTime;
      }
      
      drawSandbox(ctx);
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate(0);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [size, tiles, characters, battleMode, battleTiles, totalWidth, city]);

  return (
    <SandboxContainer battleMode={battleMode}>
      <Canvas
        ref={canvasRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />
      {floatingMessages.map(msg => (
        <FloatingText
          key={msg.id}
          x={msg.x}
          y={msg.y}
        >
          {msg.text}
        </FloatingText>
      ))}
    </SandboxContainer>
  );
};

export default Sandbox;