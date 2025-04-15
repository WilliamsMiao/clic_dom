import React, { useEffect } from 'react';
import './FishermanGame.css';

const FishermanGame: React.FC = () => {
  useEffect(() => {
    // Load Unity WebGL
    const script = document.createElement('script');
    script.src = 'F:/桌面/python_code/clic_dom-main/webGL test/Build/python_code.loader.js'; // Path to your Unity loader
    script.async = true;
    
    script.onload = () => {
      // Initialize the Unity instance after script is loaded
      // @ts-ignore - Unity global is loaded by the script
      window.UnityLoader.instantiate('gameContainer', '/unity/Build/WebGL.json');
    };
    
    document.body.appendChild(script);
    
    return () => {
      // Cleanup
      document.body.removeChild(script);
    }
  }, []);

  return (
    <div className="game-page">
      <div className="game-container">
        <div id="gameContainer" style={{ width: '960px', height: '600px' }}></div>
      </div>
      <button className="back-button" onClick={() => window.history.back()}>
        返回匹配页面
      </button>
    </div>
  );
};

export default FishermanGame;