// src/components/UnityGame.tsx
import React, { useEffect, useRef } from 'react';

interface UnityGameProps {
  onClose?: () => void;
}

const UnityGame: React.FC<UnityGameProps> = ({ onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameLoaded = useRef<boolean>(false);

  useEffect(() => {
    // Create a script element for the Unity loader
    const script = document.createElement('script');
    script.src = '/webGL test/Build/python_code.loader.js'; // Adjust path to match your Unity export
    script.async = true;
    
    // Function to initialize Unity
    const initUnity = () => {
      if (window.createUnityInstance && containerRef.current && !gameLoaded.current) {
        const config = {
          dataUrl: '/webGL test/Build/webgl.data', // Adjust these paths to match your Unity export filenames
          frameworkUrl: '/webGL test/Build/build.framework.js',
          codeUrl: '/webGL test/Build/build.wasm',
          streamingAssetsUrl: 'StreamingAssets',
          companyName: 'DefaultCompany',
          productName: 'webGL test',
          productVersion: '0.1',
        };
        
        // Get canvas
        const canvas = containerRef.current.querySelector('#unity-canvas') as HTMLCanvasElement;
        
        // Loading bar elements
        const loadingBar = containerRef.current.querySelector('#unity-loading-bar') as HTMLDivElement;
        const progressBarFull = containerRef.current.querySelector('#unity-progress-bar-full') as HTMLDivElement;
        
        // Show loading bar
        if (loadingBar) loadingBar.style.display = '';
        
        // Create Unity instance
        window.createUnityInstance(canvas, config, (progress: number) => {
          if (progressBarFull) {
            progressBarFull.style.width = `${100 * progress}%`;
          }
        }).then((unityInstance: any) => {
          // Hide loading bar when game is loaded
          if (loadingBar) loadingBar.style.display = 'none';
          gameLoaded.current = true;
          
          // Setup fullscreen button if it exists
          const fullscreenButton = containerRef.current?.querySelector('#unity-fullscreen-button');
          if (fullscreenButton) {
            fullscreenButton.addEventListener('click', () => {
              unityInstance.SetFullscreen(1);
            });
          }
        }).catch((error: any) => {
          console.error('Unity WebGL error:', error);
        });
      }
    };

    // Handle loading the script
    script.onload = initUnity;
    document.body.appendChild(script);

    // Copy CSS from Unity template
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = '/TemplateData/style.css';
    document.head.appendChild(linkElement);

    // Cleanup function
    return () => {
      document.body.removeChild(script);
      document.head.removeChild(linkElement);
    };
  }, []);

  return (
    <div ref={containerRef} className="unity-game-container">
      <div id="unity-container" className="unity-desktop">
        <canvas id="unity-canvas" width={960} height={600} tabIndex={-1}></canvas>
        <div id="unity-loading-bar">
          <div id="unity-logo"></div>
          <div id="unity-progress-bar-empty">
            <div id="unity-progress-bar-full"></div>
          </div>
        </div>
        <div id="unity-warning"> </div>
        <div id="unity-footer">
          <div id="unity-logo-title-footer"></div>
          <div id="unity-fullscreen-button"></div>
          <div id="unity-build-title">桌面</div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 10,
              background: '#9e2a2a',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

// Add this to make window.createUnityInstance available to TypeScript
declare global {
  interface Window {
    createUnityInstance: any;
  }
}

export default UnityGame;