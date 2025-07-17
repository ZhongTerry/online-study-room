import React, { useEffect, useState } from 'react';
import { Modal, Radio, FloatButton } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

const Setting = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [searchMode, setSearchMode] = useState(() => localStorage.getItem('searchMode') || 'local');

  useEffect(() => {
    localStorage.setItem('searchMode', searchMode);
  }, [searchMode]);

  return (
    <>
      <FloatButton
        icon={<SettingOutlined />}
        onClick={() => setShowSettings(true)}
      />
      <Modal
        title="设置"
        open={showSettings}
        onCancel={() => setShowSettings(false)}
        onOk={() => setShowSettings(false)}
        okText="确定"
      >
        <Radio.Group
          value={searchMode}
          onChange={e => setSearchMode(e.target.value)}
        >
          <Radio value="local">本地接口</Radio>
          {/* <Radio value="netease">网易云音乐</Radio>
          <Radio value="qqmusic">QQ 音乐</Radio> */}
        </Radio.Group>
      </Modal>
    </>
  );
};

export default Setting;