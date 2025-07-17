// src/components/Aplayer.jsx
import React, { useEffect, useRef } from 'react';
import 'aplayer/dist/APlayer.min.css'; // 引入样式
import APlayer from 'aplayer';

const ReactAplayer = ({ options }) => {
  const playerRef = useRef(null);
  const playerInstance = useRef(null);

  // 初始化播放器
  useEffect(() => {
    if (!playerInstance.current) {
      playerInstance.current = new APlayer({
        container: playerRef.current,
        ...options // 合并外部传入的配置
      });
    }

    // 组件卸载时销毁播放器
    return () => {
      if (playerInstance.current) {
        playerInstance.current.destroy();
        playerInstance.current = null;
      }
    };
  }, [options]);
  console.log('APlayer options:', options);
  // 监听配置变化（如动态歌单）
  // useEffect(() => {
  //   if (playerInstance.current && options.audio) {
  //     playerInstance.current.list.clear();
  //     // 保证 audio 是数组且每项合法
  //     let audioArr = Array.isArray(options.audio) ? options.audio : [options.audio];
  //     console.log('更新音频列表:', audioArr);
  //     audioArr = audioArr.filter(item => item && typeof item.url === 'string' && item.url); // 过滤非法项
  //     if (audioArr.length > 0) {
  //       playerInstance.current.list.add(audioArr);
  //     }
  //   }
  // }, [options.audio]);

  return <div class="h-full w-full" ref={playerRef} />;
};

export default ReactAplayer;