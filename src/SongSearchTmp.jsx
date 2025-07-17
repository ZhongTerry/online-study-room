import React, { useState, useEffect } from 'react';

const SongSearchTmp = ({ songName }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!songName) return;

    const fetchSongs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `https://api.i-meto.com/meting/api?server=tencent&type=search&id=${encodeURIComponent(songName)}`
        );
        
        if (!response.ok) {
          throw new Error('网络响应不正常');
        }
        
        const data = await response.json();
        setSongs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [songName]);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  if (!songName) return <div>请输入歌曲名称</div>;
  console.log(songs)
  return (
    <div className="song-list">
      <h3>搜索结果: "{songName}"</h3>
      <ul>
        {songs.length > 0 ? (
          songs.map((song) => (
            <li key={song.id} className="song-item">
              <div className="song-info">
                <strong>{song.title}</strong> - {song.author}
              </div>
              <audio src={song.url}></audio>
              <div className="song-url">
                <small>URL: {song.url || '不可用'}</small>
              </div>
            </li>
          ))
        ) : (
          <li>未找到相关歌曲</li>
        )}
      </ul>
    </div>
  );
};

export default SongSearchTmp;