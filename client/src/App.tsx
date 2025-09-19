import { Route, Switch } from "wouter";
import { useState } from "react";

// 简化的主页组件
function HomePage() {
  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <h1>麻将抽奖系统</h1>
      <p>欢迎来到麻将抽奖系统</p>
      <div style={{ marginTop: 20 }}>
        <a href="/admin" style={{ color: '#1890ff' }}>进入管理后台</a>
      </div>
    </div>
  );
}

// 简化的管理后台组件
function AdminPage() {
  const [gameState, setGameState] = useState<'waiting' | 'open' | 'closed'>('waiting');
  const [loading, setLoading] = useState(false);

  const handleStateChange = async (newState: 'waiting' | 'open' | 'closed') => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/set-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: newState })
      });
      
      if (response.ok) {
        setGameState(newState);
        console.log('状态更新成功:', newState);
      } else {
        console.error('状态更新失败');
      }
    } catch (error) {
      console.error('请求失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <h1>管理后台</h1>
      
      <div style={{ marginBottom: 24, padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
        <h3>游戏状态控制</h3>
        <p>当前状态: <strong>{gameState}</strong></p>
        
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button
            onClick={() => handleStateChange('waiting')}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: gameState === 'waiting' ? '#1890ff' : '#f0f0f0',
              color: gameState === 'waiting' ? 'white' : 'black',
              border: 'none',
              borderRadius: 4,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            等待开始
          </button>
          
          <button
            onClick={() => handleStateChange('open')}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: gameState === 'open' ? '#52c41a' : '#f0f0f0',
              color: gameState === 'open' ? 'white' : 'black',
              border: 'none',
              borderRadius: 4,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            开始游戏
          </button>
          
          <button
            onClick={() => handleStateChange('closed')}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: gameState === 'closed' ? '#ff4d4f' : '#f0f0f0',
              color: gameState === 'closed' ? 'white' : 'black',
              border: 'none',
              borderRadius: 4,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            结束游戏
          </button>
        </div>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <a href="/" style={{ color: '#1890ff' }}>返回首页</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Switch>
      <Route path="/admin" component={AdminPage} />
      <Route path="/" component={HomePage} />
    </Switch>
  );
}