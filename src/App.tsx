import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MarketPage from './pages/MarketPage';
import MatchPage from './pages/MatchPage.tsx';
import UnityGame from './components/UnityGame';
import { Game } from './pages/Game'; // 导入您的Game.tsx组件
import WarriorSynthesis from './pages/WarriorSynthesis';

export const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/match" element={<MatchPage />} />
        <Route path="/unity-game" element={<UnityGame />} /> {/* 如果还需要Unity游戏，可以修改路径 */}
        <Route path="/game" element={<Game />} /> {/* 添加TypeScript游戏路由 */}
        <Route path="/warrior-synthesis" element={<WarriorSynthesis />} />
      </Routes>
    </Router>
  );
};

export default App;