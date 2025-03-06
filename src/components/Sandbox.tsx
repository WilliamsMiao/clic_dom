import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useGameStore } from '../store/GameStore';
import { Position, Hanzi, TileType } from '../types/GameTypes';

const SandboxContainer = styled.div`
  width: 600px;
  height: 600px;
  overflow: hidden;
  position: relative;
  background: #1a1a1a;
  border: 1px solid #333;
  margin: 20px auto;
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
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

interface FloatingMessage {
  id: string;
  x: number;
  y: number;
  text: string;
}

export const Sandbox: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [floatingMessages, setFloatingMessages] = useState<FloatingMessage[]>([]);
  const { 
    sandbox, 
    characters, 
    selectedCharacter, 
    moveCharacter, 
    startGathering, 
    addCollectedResource,
    clearTile 
  } = useGameStore();
  
  // 检查相邻格子的资源
  const checkAdjacentResources = (position: Position) => {
    const { x, y } = position;
    const adjacentPositions: Position[] = [
      { x: x-1, y },
      { x: x+1, y },
      { x, y: y-1 },
      { x, y: y+1 }
    ];
    
    adjacentPositions.forEach(pos => {
      if (pos.x >= 0 && pos.x < sandbox.size && pos.y >= 0 && pos.y < sandbox.size) {
        const tile = sandbox.tiles[pos.y][pos.x];
        if (tile.type === TileType.RESOURCE && tile.content) {
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
          
          // 移除1秒后的浮动文字
          setTimeout(() => {
            setFloatingMessages(prev => prev.filter(msg => msg.id !== messageId));
          }, 1000);
          
          // 收集资源
          if (tile.content) {
            addCollectedResource({
              ...tile.content,
              id: `collected_${Date.now()}_${Math.random()}`
            });
            // 清空格子
            clearTile(pos);
          }
        }
      }
    });
  };

  // 绘制沙盘
  const drawSandbox = (ctx: CanvasRenderingContext2D) => {
    const { tiles } = sandbox;
    
    // 清空画布
    ctx.clearRect(0, 0, 600, 600);
    
    // 绘制格子
    tiles.forEach((row, y) => {
      row.forEach((tile, x) => {
        const pixelX = x * TILE_SIZE;
        const pixelY = y * TILE_SIZE;
        
        // 绘制背景
        ctx.fillStyle = tile.type === TileType.EMPTY ? '#222' : '#333';
        ctx.fillRect(pixelX, pixelY, TILE_SIZE, TILE_SIZE);
        
        // 绘制网格线
        ctx.strokeStyle = '#1a1a1a';
        ctx.strokeRect(pixelX, pixelY, TILE_SIZE, TILE_SIZE);
        
        // 绘制资源
        if (tile.type === TileType.RESOURCE && tile.content) {
          ctx.fillStyle = '#4a9';
          ctx.fillRect(pixelX, pixelY, TILE_SIZE, TILE_SIZE);
          
          // 绘制资源文字
          ctx.fillStyle = '#fff';
          ctx.font = '14px Microsoft YaHei';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(tile.content.character, pixelX + TILE_SIZE/2, pixelY + TILE_SIZE/2);
        }
      });
    });
    
    // 绘制角色
    characters.forEach(char => {
      if (char.position) {
        const pixelX = char.position.x * TILE_SIZE;
        const pixelY = char.position.y * TILE_SIZE;
        
        // 绘制角色背景
        ctx.fillStyle = char.id === selectedCharacter ? '#f00' : '#00f';
        ctx.fillRect(pixelX, pixelY, TILE_SIZE, TILE_SIZE);
        
        // 如果正在工作，添加闪烁效果
        if (char.isWorking) {
          const alpha = Math.abs(Math.sin(Date.now() / 200)); // 闪烁效果
          ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
          ctx.fillRect(pixelX, pixelY, TILE_SIZE, TILE_SIZE);
        }
        
        // 绘制角色文字
        ctx.fillStyle = '#fff';
        ctx.font = '14px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(char.character, pixelX + TILE_SIZE/2, pixelY + TILE_SIZE/2);
      }
    });
  };

  // 处理拖放
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const characterId = e.dataTransfer.getData('character');
    if (!characterId) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
    
    if (x >= 0 && x < sandbox.size && y >= 0 && y < sandbox.size) {
      moveCharacter(characterId, { x, y });
      checkAdjacentResources({ x, y });
    }
  };

  // 处理拖动悬停
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // 动画循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小
    canvas.width = 600;
    canvas.height = 600;

    let animationFrameId: number;
    
    const animate = () => {
      drawSandbox(ctx);
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [sandbox, characters, selectedCharacter]);

  return (
    <SandboxContainer>
      <Canvas
        ref={canvasRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
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