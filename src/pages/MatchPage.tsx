import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import './MatchPage.css';

// 类型定义
interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar: string;
  rank: number;
  eloRating: number;
  wins: number;
  losses: number;
  winRate: number;
}

interface Collection {
  id: string;
  name: string;
  rarity: string;
  imageUrl: string;
  value: number;
}

interface CollectionStats {
  totalValue: number;
  percentile: number;
  totalItems: number;
  rarityDistribution: {
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
  };
}

// 添加返回按钮的样式定义，放在其他 styled components 附近
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

const MatchPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'fisherman' | 'tigers' | 'collection'>('fisherman');
  const [isInQueue, setIsInQueue] = useState<boolean>(false);
  const [queueTime, setQueueTime] = useState<number>(0);
  const [fishermanLeaderboard, setFishermanLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [tigersLeaderboard, setTigersLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionStats, setCollectionStats] = useState<CollectionStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);

// 修改 API 请求方法和 URL

// 找到 useEffect 钩子并修改 API 请求代码
// 例如大约在 70-100 行附近的获取排行榜的代码

useEffect(() => {
  const fetchLeaderboards = async () => {
    try {
      setLoading(true);
      
      // 修改 API 请求 URL - 直接指向我们的 entry.js 服务器
      // 获取渔翁之战排行榜
      const fishermanResponse = await fetch('http://localhost:3000/api/match/leaderboard?type=fisherman');
      if (!fishermanResponse.ok) throw new Error('获取排行榜失败');
      const fishermanData = await fishermanResponse.json();
      setFishermanLeaderboard(fishermanData);
      
      // 获取二虎之争排行榜
      const tigersResponse = await fetch('http://localhost:3000/api/match/leaderboard?type=tigers');
      if (!tigersResponse.ok) throw new Error('获取排行榜失败');
      const tigersData = await tigersResponse.json();
      setTigersLeaderboard(tigersData);
      
      // 获取当前用户排名
      const userRankResponse = await fetch('http://localhost:3000/api/match/rank/me');
      if (userRankResponse.ok) {
        const userData = await userRankResponse.json();
        setUserRank(userData);
      }
      
      setLoading(false);
    } catch (err) {
      setError('获取排行榜数据失败');
      setLoading(false);
      console.error('排行榜获取错误:', err);
    }
  };

  fetchLeaderboards();
}, []);

// 找到获取收藏品的 useEffect
// 例如在 120-150 行附近

useEffect(() => {
  const fetchCollections = async () => {
    try {
      // 修改为直接访问 entry.js 服务器
      const collectionsResponse = await fetch('http://localhost:3000/api/collections/my');
      if (!collectionsResponse.ok) throw new Error('获取收藏品失败');
      const collectionsData = await collectionsResponse.json();
      setCollections(collectionsData.items || []);
      
      const statsResponse = await fetch('http://localhost:3000/api/collections/stats');
      if (!statsResponse.ok) throw new Error('获取统计数据失败');
      const statsData = await statsResponse.json();
      setCollectionStats(statsData);
    } catch (err) {
      console.error('收藏品获取错误:', err);
    }
  };
  
  if (activeTab === 'collection') {
    fetchCollections();
  }
}, [activeTab]);

// 修改加入队列函数
// 例如在 180-200 行附近

const handleJoinQueue = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/match/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        matchType: activeTab === 'fisherman' ? 'FISHERMAN' : 'TIGERS' 
      })
    });
    
    if (!response.ok) throw new Error('加入队列失败');
    
    setIsInQueue(true);
    startQueueTimer();
  } catch (err) {
    setError('加入匹配队列失败');
    console.error('加入队列错误:', err);
  }
};

// 修改离开队列函数
// 例如在 200-220 行附近

const handleLeaveQueue = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/match/leave', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('离开队列失败');
    
    setIsInQueue(false);
    setQueueTime(0);
  } catch (err) {
    setError('离开匹配队列失败');
    console.error('离开队列错误:', err);
  }
};

  // 匹配队列计时器
  const startQueueTimer = () => {
    const intervalId = setInterval(() => {
      setQueueTime(prevTime => {
        if (!isInQueue) {
          clearInterval(intervalId);
          return 0;
        }
        return prevTime + 1;
      });
    }, 1000);
  };
  
  // 格式化时间
  const formatQueueTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 根据稀有度返回样式
  const getRarityStyle = (rarity: string): React.CSSProperties => {
    switch (rarity.toLowerCase()) {
      case 'common': return { border: '2px solid #aaa' };
      case 'uncommon': return { border: '2px solid #59b95e' };
      case 'rare': return { border: '2px solid #3498db' };
      case 'epic': return { border: '2px solid #9b59b6' };
      case 'legendary': return { border: '2px solid #f1c40f' };
      default: return {};
    }
  };

  // 添加开始游戏函数
  const handleStartGame = () => {
    navigate('/game'); // 导航到游戏页面
  };

  // 在匹配成功后调用
  const onMatchSuccess = () => {
    // 可能的匹配成功逻辑
    // ...
    
    // 导航到游戏页面
    handleStartGame();
  };

  return (
    <div className="match-page">
      {/* 添加返回主页按钮 */}
      <BackButton onClick={() => navigate('/')}>
        返回主页
      </BackButton>
      <div className="match-header">
        <h1>排位系统</h1>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'fisherman' ? 'active' : ''}`}
            onClick={() => setActiveTab('fisherman')}
          >
            渔翁之战
          </button>
          <button 
            className={`tab ${activeTab === 'tigers' ? 'active' : ''}`}
            onClick={() => setActiveTab('tigers')}
          >
            二虎之争
          </button>
          <button 
            className={`tab ${activeTab === 'collection' ? 'active' : ''}`}
            onClick={() => setActiveTab('collection')}
          >
            藏品陈列
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="match-content">
        {activeTab === 'fisherman' && (
          <>
            <div className="mode-info">
              <div className="mode-description">
                <h2>渔翁之战</h2>
                <p>在两方争斗中寻找机会，收集资源，建立自己的王国。运用战略与智慧，成为真正的赢家。</p>
              </div>
              
              <div className="mode-action">
                {!isInQueue ? (
                  <button 
                    className="join-button" 
                    onClick={() => navigate('/game')}
                  >
                    开始匹配
                    
                  </button>
                ) : (
                  <div className="queue-status">
                    <div className="queue-time">匹配中: {formatQueueTime(queueTime)}</div>
                    <button className="leave-button" onClick={handleLeaveQueue}>取消匹配</button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="leaderboard-section">
              <h3>渔翁之战排行榜</h3>
              
              {userRank && (
                <div className="user-rank">
                  <div className="user-rank-header">您的排名</div>
                  <div className="user-rank-content">
                    <div className="rank-number">#{userRank.rank}</div>
                    <div className="user-avatar">
                      <img src={userRank.avatar || '/default-avatar.png'} alt="用户头像" />
                    </div>
                    <div className="user-info">
                      <span className="username">{userRank.username}</span>
                      <span className="elo">{userRank.eloRating} 分</span>
                    </div>
                    <div className="stats">
                      <div className="win-rate">{(userRank.winRate * 100).toFixed(1)}%</div>
                      <div className="record">{userRank.wins}胜 {userRank.losses}负</div>
                    </div>
                  </div>
                </div>
              )}
              
              {loading ? (
                <div className="loading">加载排行榜数据...</div>
              ) : (
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>排名</th>
                      <th>玩家</th>
                      <th>积分</th>
                      <th>胜率</th>
                      <th>战绩</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fishermanLeaderboard.map(player => (
                      <tr key={player.userId} className={userRank?.userId === player.userId ? 'current-user' : ''}>
                        <td>#{player.rank}</td>
                        <td>
                          <div className="player-info">
                            <img src={player.avatar || '/default-avatar.png'} alt="头像" />
                            <span>{player.username}</span>
                          </div>
                        </td>
                        <td>{player.eloRating}</td>
                        <td>{(player.winRate * 100).toFixed(1)}%</td>
                        <td>{player.wins}胜 {player.losses}负</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
        
        {activeTab === 'tigers' && (
          <>
            <div className="mode-info">
              <div className="mode-description">
                <h2>二虎之争</h2>
                <p>两虎相争，智者得利。通过战术布局和兵力调配，战胜对手，统一天下。</p>
              </div>
              
              <div className="mode-action">
                {!isInQueue ? (
                  <button className="join-button" onClick={handleJoinQueue}>开始匹配</button>
                ) : (
                  <div className="queue-status">
                    <div className="queue-time">匹配中: {formatQueueTime(queueTime)}</div>
                    <button className="leave-button" onClick={handleLeaveQueue}>取消匹配</button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="leaderboard-section">
              <h3>二虎之争排行榜</h3>
              
              {userRank && (
                <div className="user-rank">
                  <div className="user-rank-header">您的排名</div>
                  <div className="user-rank-content">
                    <div className="rank-number">#{userRank.rank}</div>
                    <div className="user-avatar">
                      <img src={userRank.avatar || '/default-avatar.png'} alt="用户头像" />
                    </div>
                    <div className="user-info">
                      <span className="username">{userRank.username}</span>
                      <span className="elo">{userRank.eloRating} 分</span>
                    </div>
                    <div className="stats">
                      <div className="win-rate">{(userRank.winRate * 100).toFixed(1)}%</div>
                      <div className="record">{userRank.wins}胜 {userRank.losses}负</div>
                    </div>
                  </div>
                </div>
              )}
              
              {loading ? (
                <div className="loading">加载排行榜数据...</div>
              ) : (
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>排名</th>
                      <th>玩家</th>
                      <th>积分</th>
                      <th>胜率</th>
                      <th>战绩</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tigersLeaderboard.map(player => (
                      <tr key={player.userId} className={userRank?.userId === player.userId ? 'current-user' : ''}>
                        <td>#{player.rank}</td>
                        <td>
                          <div className="player-info">
                            <img src={player.avatar || '/default-avatar.png'} alt="头像" />
                            <span>{player.username}</span>
                          </div>
                        </td>
                        <td>{player.eloRating}</td>
                        <td>{(player.winRate * 100).toFixed(1)}%</td>
                        <td>{player.wins}胜 {player.losses}负</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
        
        {activeTab === 'collection' && (
          <>
            <div className="collection-header">
              <h2>藏品陈列柜</h2>
              {collectionStats && (
                <div className="collection-stats">
                  <div className="stat-card">
                    <h3>藏品总值</h3>
                    <div className="stat-value">{collectionStats.totalValue} 金币</div>
                    <div className="stat-percentile">
                      超越 <span>{collectionStats.percentile}%</span> 的玩家
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <h3>收藏数量</h3>
                    <div className="stat-value">{collectionStats.totalItems} 件</div>
                    <div className="stat-rarity">
                      <div className="rarity-bar">
                        <div className="rarity-segment common" style={{width: `${(collectionStats.rarityDistribution.common / collectionStats.totalItems) * 100}%`}}></div>
                        <div className="rarity-segment uncommon" style={{width: `${(collectionStats.rarityDistribution.uncommon / collectionStats.totalItems) * 100}%`}}></div>
                        <div className="rarity-segment rare" style={{width: `${(collectionStats.rarityDistribution.rare / collectionStats.totalItems) * 100}%`}}></div>
                        <div className="rarity-segment epic" style={{width: `${(collectionStats.rarityDistribution.epic / collectionStats.totalItems) * 100}%`}}></div>
                        <div className="rarity-segment legendary" style={{width: `${(collectionStats.rarityDistribution.legendary / collectionStats.totalItems) * 100}%`}}></div>
                      </div>
                      <div className="rarity-labels">
                        <span className="common">普通</span>
                        <span className="uncommon">优秀</span>
                        <span className="rare">稀有</span>
                        <span className="epic">史诗</span>
                        <span className="legendary">传说</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="collections-grid">
              {collections.length === 0 ? (
                <div className="empty-collection">
                  <p>暂无藏品收集</p>
                  <p>在游戏中获胜以收集珍贵藏品</p>
                </div>
              ) : (
                collections.map(item => (
                  <div key={item.id} className="collection-item" style={getRarityStyle(item.rarity)}>
                    <div className="collection-image">
                      <img src={item.imageUrl} alt={item.name} />
                      <div className={`rarity-badge ${item.rarity.toLowerCase()}`}>{item.rarity}</div>
                    </div>
                    <div className="collection-details">
                      <h4>{item.name}</h4>
                      <div className="collection-value">{item.value} 金币</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
      
      {/* 在合适的位置添加对战按钮 */}
      <div className="match-controls">
        {isInQueue ? (
          <>
            <p>已在队列中: {formatQueueTime(queueTime)}</p>
            <button className="leave-queue-btn" onClick={handleLeaveQueue}>
              离开队列
            </button>
          </>
        ) : (
          <button 
            className="join-queue-btn" 
            onClick={handleJoinQueue}
            disabled={!selectedDeck}
          >
            
          </button>
        )}
      </div>
      
    </div>
  );
};

export default MatchPage;