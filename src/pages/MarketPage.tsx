import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MarketPage.css';
import styled from 'styled-components';

interface MarketItem {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string;
  seller: {
    id: number;
    username: string;
  };
}

const ItemImage = styled.img`
  max-width: 100px; // 控制最大宽度
  max-height: 100px; // 控制最大高度
  object-fit: contain; // 保持图片比例
`;

const MarketPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 在 useEffect 之前添加测试数据
  const testItems = [
    {
      id: 1,
      name: "汉朝古剑",
      description: "锋利无比的古代兵器，增加攻击力",
      price: 100,
      quantity: 5,
      imageUrl: "/img/9342156826da125c074e28f20bb6ad0d_1440w.jpg",
      seller: {
        id: 101,
        username: "古董商"
      }
    },
    {
      id: 2,
      name: "儒家典籍",
      description: "蕴含智慧的古代书籍，提升智力属性",
      price: 200,
      quantity: 3,
      imageUrl: "/img/images.jpg",
      seller: {
        id: 102,
        username: "墨家弟子"
      }
    },
    {
      id: 3,
      name: "丹药",
      description: "神秘的东方药物，恢复生命值",
      price: 150,
      quantity: 10,
      imageUrl: "/img/images (1).jpg",
      seller: {
        id: 103,
        username: "道士"
      }
    },
    {
      id: 4,
      name: "龙鳞甲",
      description: "用龙鳞制作的铠甲，提供极高防御力",
      price: 500,
      quantity: 1,
      imageUrl: "/img/143px-龙鳞甲.png",
      seller: {
        id: 104,
        username: "铸甲师"
      }
    },
    {
      id: 5,
      name: "玉佩护符",
      description: "具有祝福效果的玉佩，增加幸运值",
      price: 300,
      quantity: 7,
      imageUrl: "/img/O1CN010f6iCJ1z3Q1sM6RJi_!!6000000006658-2-yinhe.png_300x300Q75.jpg",
      seller: {
        id: 105,
        username: "玉石匠"
      }
    }
  ];

  // 背景动画效果
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: {x: number, y: number, size: number, speedX: number, speedY: number}[] = [];
    const particleCount = 50;

    // 创建粒子
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 1,
        speedY: (Math.random() - 0.5) * 1
      });
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 223, 186, 0.3)';
      
      for (const particle of particles) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // 边界检查
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;
      }
      
      requestAnimationFrame(drawParticles);
    };
    
    drawParticles();

    // 窗口大小调整时重新设置画布大小
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 获取市场数据
  useEffect(() => {
    // 模拟API调用
    const fetchMarketItems = async () => {
      try {
        setLoading(true);
        // 在实际应用中，这里应该是一个API调用
        // const response = await axios.get('/api/market/items');
        // setItems(response.data);
        
        // 使用测试数据
        setTimeout(() => {
          setItems(testItems);
          setLoading(false);
        }, 800); // 模拟加载延迟
      } catch (err) {
        setError('获取市场物品失败');
        setLoading(false);
        console.error('获取市场物品时出错:', err);
      }
    };

    fetchMarketItems();
  }, []);

  const handlePurchase = (item: MarketItem) => {
    alert(`您已成功购买: ${item.name}`);
    // 这里可以添加购买逻辑，例如API调用等
  };

  const filterItemsByCategory = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="market-page" ref={containerRef}>
      <canvas ref={canvasRef} className="background-canvas" />
      <div className="cloud-pattern"></div>
      
      <div className="flag-decoration left"></div>
      <div className="flag-decoration right"></div>

      <div className="market-header">
        <button className="back-button" onClick={() => navigate('/')}>返回主页</button>
        <h1>古代市场</h1>
        <div className="market-filters">
          <button 
            className={selectedCategory === 'all' ? 'active' : ''} 
            onClick={() => filterItemsByCategory('all')}
          >
            全部
          </button>
          <button 
            className={selectedCategory === 'weapons' ? 'active' : ''} 
            onClick={() => filterItemsByCategory('weapons')}
          >
            武器
          </button>
          <button 
            className={selectedCategory === 'books' ? 'active' : ''} 
            onClick={() => filterItemsByCategory('books')}
          >
            书籍
          </button>
          <button 
            className={selectedCategory === 'potions' ? 'active' : ''} 
            onClick={() => filterItemsByCategory('potions')}
          >
            丹药
          </button>
        </div>
      </div>

      <div className="scroll-container market-content">
        <div className="scroll-top"></div>
        {loading ? (
          <div className="loading-spinner">加载中...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="item-grid">
            {items.map(item => (
              <div className="market-item" key={item.id}>
                <div className="item-image-container">
                  <ItemImage 
                    src={item.imageUrl || '/assets/default-item.png'} 
                    alt={item.name} 
                    className="item-image" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/default-item.png';
                    }}
                  />
                </div>
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  <div className="item-meta">
                    <span className="item-price">{item.price} 铜钱</span>
                    <span className="item-quantity">库存: {item.quantity}</span>
                  </div>
                  <div className="item-seller">卖家: {item.seller.username}</div>
                  <button 
                    className="purchase-button" 
                    onClick={() => handlePurchase(item)}
                    disabled={item.quantity <= 0}
                  >
                    购买
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="scroll-bottom"></div>
      </div>
    </div>
  );
};

export default MarketPage;