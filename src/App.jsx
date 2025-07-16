import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Button, List, Typography, Card, Row, Col, message } from 'antd';
import APlayer from 'aplayer';
import 'aplayer/dist/APlayer.min.css';
import './App.css'; // 添加自定义样式

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  const [time, setTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const playerRef = useRef(null);
  const aplayerInstance = useRef(null);

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // 初始化播放器
  useEffect(() => {
    if (!aplayerInstance.current) {
      aplayerInstance.current = new APlayer({
        container: playerRef.current,
        fixed: true,
        autoplay: true,
        audio: []
      });
    }
    
    return () => {
      if (aplayerInstance.current) {
        aplayerInstance.current.destroy();
        aplayerInstance.current = null;
      }
    };
  }, []);

  // 当有当前歌曲时更新播放器
  useEffect(() => {
    if (currentSong && aplayerInstance.current) {
      // 清除现有播放列表
      aplayerInstance.current.list.clear();
      
      // 添加新歌曲
      aplayerInstance.current.list.add({
        name: currentSong.filename,
        artist: currentSong.artist,
        url: `http://127.0.0.1:8000${currentSong.download_api}`,
        cover: 'https://via.placeholder.com/100?text=Music',
        type: 'audio/mp3' // 明确指定音频类型
      });
      
      // 尝试播放
      setTimeout(() => {
        if (aplayerInstance.current) {
          aplayerInstance.current.play();
        }
      }, 500);
    }
  }, [currentSong]);

  // 搜索歌曲
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      message.warning('请输入歌曲名称');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: searchQuery })
      });
      
      if (!response.ok) {
        throw new Error(`搜索失败: ${response.status}`);
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('搜索失败:', error);
      message.error(`搜索失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 选择并播放歌曲
  const handleSelectSong = async (song) => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          query: song.title, 
          index: song.index 
        })
      });
      
      if (!response.ok) {
        throw new Error(`获取歌曲失败: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(result)
      // 保存当前歌曲信息
      setCurrentSong({
        ...result,
        artist: song.artist,
        title: song.title
      });
      
      message.success(`已加载: ${song.title} - ${song.artist}`);
    } catch (error) {
      console.error('获取歌曲失败:', error);
      message.error(`获取歌曲失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 格式化时间
  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: 0 }}>
        <Row justify="space-between" align="middle" style={{ padding: '0 24px' }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>自习室</Title>
          </Col>
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              {formatTime(time)}
            </Title>
          </Col>
        </Row>
      </Header>
      
      <Content style={{ padding: '24px' }}>
        <Card 
          title="音乐播放器" 
          style={{ marginBottom: 24 }}
          extra={
            <div className="player-container" ref={playerRef} />
          }
        >
          <Row gutter={16}>
            <Col span={18}>
              <Input.Search
                placeholder="搜索歌曲..."
                enterButton="搜索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={handleSearch}
                loading={loading}
              />
            </Col>
          </Row>
          
          {searchResults.length > 0 && (
            <List
              style={{ marginTop: 20 }}
              loading={loading}
              dataSource={searchResults}
              renderItem={(item) => (
                <List.Item 
                  actions={[
                    <Button 
                      type="primary" 
                      onClick={() => handleSelectSong(item)}
                      loading={loading}
                    >
                      播放
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={`${item.title}`}
                    description={`歌手: ${item.artist}`}
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
        
        {currentSong && (
          <Card title="当前播放">
            <div>
              <p><strong>歌曲:</strong> {currentSong.title}</p>
              <p><strong>歌手:</strong> {currentSong.artist}</p>
              <p><strong>文件:</strong> {currentSong.filename}</p>
            </div>
          </Card>
        )}
      </Content>
    </Layout>
  );
}

export default App;