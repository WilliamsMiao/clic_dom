import React, { useState, useEffect } from 'react';
import './MatchPage.css'; // 确保该CSS文件存在

const MatchPage = () => {
  const [activeTab, setActiveTab] = useState('fisherman');
  const [fishermanLeaderboard, setFishermanLeaderboard] = useState([]);
  const [tigersLeaderboard, setTigersLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [collections, setCollections] = useState([]);
  const [collectionStats, setCollectionStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInQueue, setIsInQueue] = useState(false);
  const [queueTime, setQueueTime] = useState(0);

  // 获取排行榜数据
  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        setLoading(true);
        
        // 直接请求
        const fishermanResponse = await fetch('http://localhost:3000/api/match/leaderboard?type=fisherman');
        if (!fishermanResponse.ok) throw new Error('获取渔翁排行榜失败');
        const fishermanData = await fishermanResponse.json();
        setFishermanLeaderboard(fishermanData);
        
        const tigersResponse = await fetch('http://localhost:3000/api/match/leaderboard?type=tigers');
        if (!tigersResponse.ok) throw new Error('获取二虎排行榜失败');
        const tigersData = await tigersResponse.json();
        setTigersLeaderboard(tigersData);
        
        const userResponse = await fetch('http://localhost:3000/api/match/rank/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserRank(userData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('获取排行榜错误:', err);
        setError('获取排行榜数据失败');
        setLoading(false);
      }
    };

    fetchLeaderboards();
  }, []);
  
  // 获取收藏品数据
  useEffect(() => {
    const fetchCollections = async () => {
      if (activeTab !== 'collection') return;
      
      try {
        const collectionsResponse = await fetch('http://localhost:3000/api/collections/my');
        if (!collectionsResponse.ok) throw new Error('获取收藏品失败');
        const collectionsData = await collectionsResponse.json();
        setCollections(collectionsData.items || []);
        
        const statsResponse = await fetch('http://localhost:3000/api/collections/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setCollectionStats(statsData);
        }
      } catch (err) {
        console.error('获取收藏品错误:', err);
      }
    };
    
    fetchCollections();
  }, [activeTab]);

  // 处理加入队列
  const handleJoinQueue = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/match/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ matchType: activeTab === 'fisherman' ? 'FISHERMAN' : 'TIGERS' })
      });
      
      if (!response.ok) throw new Error('加入队列失败');
      setIsInQueue(true);
      
      // 开始计时器
      const interval = setInterval(() => {
        setQueueTime(prev => prev + 1);
      }, 1000);
      
      // 保存计时器ID以便清除
      window.queueTimerId = interval;
    } catch (err) {
      console.error('加入队列错误:', err);
      setError('加入匹配队列失败');
    }
  };

  // 处理离开队列
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
      
      // 清除计时器
      if (window.queueTimerId) {
        clearInterval(window.queueTimerId);
        window.queueTimerId = null;
      }
    } catch (err) {
      console.error('离开队列错误:', err);
      setError('离开匹配队列失败');
    }
  };

  // 格式化时间
  const formatQueueTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 添加基本样式
  const styles = {
    page: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#333'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    title: {
      fontSize: '28px',
      marginBottom: '10px'
    },
    tabs: {
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      marginBottom: '20px'
    },
    tab: {
      padding: '10px 20px',
      background: '#f0f0f0',
      border: '1px solid #ddd',
      cursor: 'pointer',
      borderRadius: '4px'
    },
    activeTab: {
      background: '#e0e0e0',
      borderBottom: '2px solid #333'
    },
    modeInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      padding: '15px',
      background: '#f8f8f8',
      borderRadius: '8px'
    },
    button: {
      padding: '10px 20px',
      background: '#4a4a4a',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      textAlign: 'left',
      padding: '10px',
      borderBottom: '1px solid #ddd'
    },
    td: {
      padding: '10px',
      borderBottom: '1px solid #eee'
    },
    errorMessage: {
      padding: '10px',
      background: '#ffebee',
      color: '#c62828',
      borderRadius: '4px',
      marginBottom: '15px',
      textAlign: 'center'
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>排位系统</h1>
        <div style={styles.tabs}>
          <button 
            style={{...styles.tab, ...(activeTab === 'fisherman' ? styles.activeTab : {})}} 
            onClick={() => setActiveTab('fisherman')}
          >
            渔翁之战
          </button>
          <button 
            style={{...styles.tab, ...(activeTab === 'tigers' ? styles.activeTab : {})}} 
            onClick={() => setActiveTab('tigers')}
          >
            二虎之争
          </button>
          <button 
            style={{...styles.tab, ...(activeTab === 'collection' ? styles.activeTab : {})}} 
            onClick={() => setActiveTab('collection')}
          >
            藏品陈列
          </button>
        </div>
      </div>
      
      {error && <div style={styles.errorMessage}>{error}</div>}
      
      {activeTab === 'fisherman' && (
        <div>
          <div style={styles.modeInfo}>
            <div>
              <h2>渔翁之战</h2>
              <p>在两方争斗中寻找机会，收集资源，建立自己的王国。</p>
            </div>
            <div>
              {!isInQueue ? (
                <button style={styles.button} onClick={handleJoinQueue}>开始匹配</button>
              ) : (
                <div>
                  <div>匹配中: {formatQueueTime(queueTime)}</div>
                  <button onClick={handleLeaveQueue}>取消匹配</button>
                </div>
              )}
            </div>
          </div>
          
          <h3>渔翁之战排行榜</h3>
          {loading ? (
            <div>加载中...</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>排名</th>
                  <th style={styles.th}>玩家</th>
                  <th style={styles.th}>积分</th>
                  <th style={styles.th}>胜率</th>
                </tr>
              </thead>
              <tbody>
                {fishermanLeaderboard.map((player) => (
                  <tr key={player.userId}>
                    <td style={styles.td}>#{player.rank}</td>
                    <td style={styles.td}>{player.username}</td>
                    <td style={styles.td}>{player.eloRating}</td>
                    <td style={styles.td}>{(player.winRate * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {activeTab === 'tigers' && (
        <div>
          <div style={styles.modeInfo}>
            <div>
              <h2>二虎之争</h2>
              <p>两虎相争，智者得利。通过战术布局和兵力调配，战胜对手。</p>
            </div>
            <div>
              {!isInQueue ? (
                <button style={styles.button} onClick={handleJoinQueue}>开始匹配</button>
              ) : (
                <div>
                  <div>匹配中: {formatQueueTime(queueTime)}</div>
                  <button onClick={handleLeaveQueue}>取消匹配</button>
                </div>
              )}
            </div>
          </div>
          
          <h3>二虎之争排行榜</h3>
          {loading ? (
            <div>加载中...</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>排名</th>
                  <th style={styles.th}>玩家</th>
                  <th style={styles.th}>积分</th>
                  <th style={styles.th}>胜率</th>
                </tr>
              </thead>
              <tbody>
                {tigersLeaderboard.map((player) => (
                  <tr key={player.userId}>
                    <td style={styles.td}>#{player.rank}</td>
                    <td style={styles.td}>{player.username}</td>
                    <td style={styles.td}>{player.eloRating}</td>
                    <td style={styles.td}>{(player.winRate * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {activeTab === 'collection' && (
        <div>
          <h2>藏品陈列柜</h2>
          {collectionStats && (
            <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
              <div style={{background: '#f8f8f8', padding: '15px', borderRadius: '8px', flex: 1}}>
                <h3>藏品总值</h3>
                <div style={{fontSize: '24px'}}>{collectionStats.totalValue} 金币</div>
                <div>超越 {collectionStats.percentile}% 的玩家</div>
              </div>
              <div style={{background: '#f8f8f8', padding: '15px', borderRadius: '8px', flex: 1}}>
                <h3>收藏数量</h3>
                <div style={{fontSize: '24px'}}>{collectionStats.totalItems} 件</div>
              </div>
            </div>
          )}
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px'}}>
            {collections.map((item) => (
              <div 
                key={item.id} 
                style={{
                  border: '1px solid #ddd', 
                  borderRadius: '8px',
                  padding: '10px',
                  background: 'white'
                }}
              >
                <div style={{height: '120px', marginBottom: '10px', background: '#eee'}}>
                  <img 
                    src={item.imageUrl || '/default-item.png'} 
                    alt={item.name}
                    style={{width: '100%', height: '100%', objectFit: 'cover'}}
                  />
                </div>
                <h4 style={{margin: '5px 0'}}>{item.name}</h4>
                <div style={{fontSize: '14px'}}>
                  <span 
                    style={{
                      color: 
                        item.rarity === 'LEGENDARY' ? '#f1c40f' :
                        item.rarity === 'EPIC' ? '#9b59b6' :
                        item.rarity === 'RARE' ? '#3498db' :
                        item.rarity === 'UNCOMMON' ? '#59b95e' : '#aaa'
                    }}
                  >
                    {item.rarity}
                  </span>
                  <span> · {item.value} 金币</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchPage;