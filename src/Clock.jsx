// Clock.js
import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const Clock = () => {
  const [time, setTime] = useState(new Date());

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

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
    <>
      {formatTime(time)}</>
  );
};

export default Clock;