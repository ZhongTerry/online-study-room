import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Button, List, Typography, Card, Row, Col, message } from 'antd';
// import APlayer from 'aplayer';
import { APlayer } from 'aplayer-react';
import 'aplayer/dist/APlayer.min.css';
import './App.css'; // 添加自定义样式
import ReactAplayer from './ReactAplayer';
import Clock from './Clock'; // 引入时钟组件
const { Header, Content } = Layout;
const { Title } = Typography;
import "./index.css";

function App() {
  // const [time, setTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const playerRef = useRef(null);
  const aplayerInstance = useRef(null);
  const [musicUrl, setMusicUrl] = useState('')

  // 更新时间
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setTime(new Date());
  //   }, 1000);
    
  //   return () => clearInterval(timer);
  // }, []);

  // 初始化播放器
  // useEffect(() => {
  //   if (!aplayerInstance.current) {
  //     aplayerInstance.current = new APlayer({
  //       container: playerRef.current,
  //       fixed: true,
  //       autoplay: false, // 不自动播放
  //       audio: []
  //     });
  //   }
    
  //   return () => {
  //     if (aplayerInstance.current) {
  //       aplayerInstance.current.destroy();
  //       aplayerInstance.current = null;
  //     }
  //   };
  // }, []);

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
    //       const response2 = await fetch(`http://127.0.0.1:8000/download_file?filename=${encodeURIComponent(result.filename)}&key=${result.key}`);
    // if (!response2.ok) {
    //   throw new Error(`获取歌曲失败: ${response2.status}`);
    // }
    // const blob = await response2.blob();
    // const blobUrl = URL.createObjectURL(blob);

      setCurrentSong({
        ...result,
        artist: song.artist,
        title: song.title
      });

      // 立即添加并播放
          // const path = encodeURIComponent(result.download_api);
          const path = result.download_api;
    // const url = `http://127.0.0.1:8000${path}`;
    setMusicUrl(path);
    console.log('音乐URL:', path);

    // if (aplayerInstance.current) {
    //   aplayerInstance.current.list.clear();
      
    //   // 添加音频（不指定type）
    //   aplayerInstance.current.list.add({
    //     name: song.title,
    //     artist: song.artist,
    //     url,
    //     cover: 'https://via.placeholder.com/100?text=Music'
    //   });

    //   // 确保加载完成后再播放
    //   aplayerInstance.current.on('loadeddata', () => {
    //     aplayerInstance.current.play();
    //   });
    // }

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
    <Layout style={{background: '#f7f8fa'}}>
      {/* <Header style={{
        background: '#fff',
        padding: 0,
        boxShadow: '0 2px 8px #f0f1f2',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <Row justify="center" align="middle" style={{ height: 64 }}>
          <Col>
            <Title level={3} style={{ margin: 0, color: '#222', letterSpacing: 2, fontWeight: 700, fontSize: 28 }}>在线自习室</Title>
          </Col>
        </Row>
      </Header> */}
      <Content class="w-full h-full">
        <div class="p-24 w-full h-full grid grid-rows-2 gap-4">
          {/* <Col class="h-full w-full" gutter={16}> */}
          
<Row gutter={20}>
  <Col xs={24} md={12}>
    <Card
      style={{
        borderRadius: 20,
        background: '#fff',
        border: '1px solid #e5e7eb',
        minHeight: 260,
      }}
      bodyStyle={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      title={<span style={{ color: '#222', fontWeight: 700, fontSize: 20 }}>当前时间</span>}
    >
      <span style={{ fontSize: 48, letterSpacing: 4, color: '#222', fontFamily: 'Consolas' }}>
        <Clock />
      </span>
    </Card>
  </Col>
  <Col xs={24} md={12}>
    <Card
      class="h-full w-full"
      style={{
        borderRadius: 20,
        background: '#fff',
        border: '1px solid #e5e7eb',
        minHeight: 260
      }}
      bodyStyle={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      title={<span style={{ color: '#222', fontWeight: 700, fontSize: 20 }}>当前播放</span>}
    >
      {currentSong ? (
        <ReactAplayer
          options={{
            autoplay: false,
            lrcType: 1,
            audio: [{
              name: currentSong.title,
              artist: currentSong.artist,
              url: musicUrl,
              cover: currentSong.cover,
              lrc: currentSong.lrc,
            }]
          }}
        ></ReactAplayer>
      ) : (
        <span style={{ color: '#888', fontSize: 20 }}>暂无播放</span>
      )}
    </Card>
  </Col>
</Row>
        
        <Row style={{ width: '100%' }} class="mt-4" span={12}>
          <Col span={24}>
            <Card
              style={{
                borderRadius: 20,
                background: '#fff',
                border: '1px solid #e5e7eb'
              }}
              bodyStyle={{ padding: 32 }}
              title={<span style={{ color: '#222', fontWeight: 700, fontSize: 20 }}>歌曲列表</span>}
              extra={
                <Input.Search
                  placeholder="输入歌曲名称..."
                  enterButton="点歌"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onSearch={handleSearch}
                  loading={loading}
                  style={{ borderRadius: 8, width: 200, background: '#f3f4f6', color: '#222' }}
                />
              }
            >
              {searchResults.length > 0 ? (
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
                          style={{ borderRadius: 6 }}
                        >
                          播放
                        </Button>
                      ]}
                      style={{ padding: '12px 0' }}
                    >
                      <List.Item.Meta
                        title={<span style={{ color: '#222' }}>{item.title}</span>}
                        description={<span style={{ color: '#888' }}>歌手: {item.artist}</span>}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ color: '#888', textAlign: 'center', fontSize: 20, margin: '48px 0' }}>暂无歌曲</div>
              )}
            </Card>
          </Col>
        </Row>
          {/* </Col> */}
        </div>
        
      </Content>
    </Layout>
  );
}

export default App;