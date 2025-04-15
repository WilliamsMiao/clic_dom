import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // 动画背景
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置canvas尺寸为窗口尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // 创建汉字粒子
    class Character {
      x: number;
      y: number;
      char: string;
      size: number;
      speed: number;
      opacity: number;
      
      constructor() {
        this.x = Math.random() * (canvas?.width || window.innerWidth);
        this.y = Math.random() * (canvas?.height || window.innerHeight);
        // 常用汉字集合
        const chars = "道德仁义礼智信忠孝勇诚天地人和风云山水";
        this.char = chars[Math.floor(Math.random() * chars.length)];
        this.size = Math.random() * 20 + 10;
        this.speed = Math.random() * 0.5 + 0.1;
        this.opacity = Math.random() * 0.5 + 0.1;
      }
      
      draw() {
        if (!ctx) return;
        ctx.font = `${this.size}px 'Ma Shan Zheng', 'Noto Sans SC', serif`;
        ctx.fillStyle = `rgba(139, 69, 19, ${this.opacity})`;
        ctx.fillText(this.char, this.x, this.y);
      }
      
      update() {
        this.y += this.speed;
        if (canvas && this.y > canvas.height) {
          this.y = -this.size;
          this.x = Math.random() * (canvas.width || window.innerWidth);
        }
        this.draw();
      }
    }
    
    const characters: Character[] = [];
    for (let i = 0; i < 50; i++) {
      characters.push(new Character());
    }
    
    // 动画循环
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 绘制渐变背景
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(245, 222, 179, 0.8)'); // 浅卷轴色
      gradient.addColorStop(1, 'rgba(210, 180, 140, 0.8)'); // 深卷轴色
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 更新所有汉字
      characters.forEach(char => char.update());
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // 按钮悬浮效果
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const buttons = containerRef.current.querySelectorAll('.homepage-button');
    buttons.forEach((button) => {
      const rect = (button as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const distance = Math.sqrt(x * x + y * y);
      const maxDistance = 100;
      
      if (distance < maxDistance) {
        const strength = (maxDistance - distance) / maxDistance;
        const moveX = x * strength * 0.2;
        const moveY = y * strength * 0.2;
        const scale = 1 + strength * 0.1;
        
        (button as HTMLElement).style.transform = `translate3d(${moveX}px, ${moveY}px, 10px) scale(${scale})`;
      } else {
        (button as HTMLElement).style.transform = 'translate3d(0, 0, 0) scale(1)';
      }
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 模拟登录逻辑
    if (username && password) {
      setIsLoggedIn(true);
      setShowLoginModal(false);
      // 可以在这里添加更多登录后的逻辑
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="homepage-container" ref={containerRef} onMouseMove={handleMouseMove}>
      <canvas ref={canvasRef} className="background-canvas" />
      <div className="cloud-pattern"></div>
      
      <div className="flag-decoration left"></div>
      <div className="flag-decoration right"></div>
      
      <div className="auth-buttons">
        {isLoggedIn ? (
          <div className="user-info">
            <span>欢迎, {username}</span>
            <button className="logout-button" onClick={handleLogout}>登出</button>
          </div>
        ) : (
          <button className="login-button" onClick={() => setShowLoginModal(true)}>
            登录/注册
          </button>
        )}
      </div>

      {showLoginModal && (
        <div className="modal-overlay">
          <div className="login-modal">
            <h2>用户登录</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>用户名:</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>密码:</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="login-submit">登录</button>
                <button type="button" className="register-button">注册</button>
                <button 
                  type="button" 
                  className="close-modal"
                  onClick={() => setShowLoginModal(false)}
                >
                  关闭
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="content-container">
        <h1 className="homepage-title">汉字领域</h1>
        <div className="subtitle">兵临城下 · 智取天下</div>
        
        <div className="scroll-container">
          <div className="scroll-top"></div>
          <div className="button-container">
            <button className="homepage-button" onClick={() => navigate('/practice')}>
              <span className="button-icon">📜</span>
              <span className="button-text">新手教程</span>
            </button>
            <button className="homepage-button" onClick={() => navigate('/market')}>
              <span className="button-icon">🏮</span>
              <span className="button-text">市场</span>
            </button>
            <button className="homepage-button" onClick={() => navigate('/match')}>
              <span className="button-icon">⚔️</span>
              <span className="button-text">排位系统</span>
            </button>
            <button className="homepage-button" onClick={() => navigate('/game')}>
              <span className="button-icon">🔮</span>
              <span className="button-text">开始征战</span>
            </button>
          </div>
          <div className="scroll-bottom"></div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;