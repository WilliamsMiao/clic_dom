// 添加或更新这个文件来配置API访问

const API_BASE_URL = 'http://localhost:3000/api';  // 确保这个URL与entry.js运行的服务器匹配

export const apiClient = {
  get: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) throw new Error('API请求失败');
      return await response.json();
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  },
  
  post: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('API请求失败');
      return await response.json();
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }
};

// In your routing configuration (e.g., in App.tsx or routes file)
import FishermanGame from './pages/FishermanGame';

// Add this route
<Route path="/game/fisherman" element={<FishermanGame />} />