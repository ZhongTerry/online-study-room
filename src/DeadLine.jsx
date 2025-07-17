import React, { useEffect, useState } from 'react';
import { Button, Modal, Input, DatePicker, TimePicker, Radio, List, Tag } from 'antd';
import { PlusOutlined, UnorderedListOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

function DeadLine() {
    function getNextOccur(deadline) {
        if (deadline.type === 'full') {
            return dayjs(deadline.time).valueOf();
        } else {
            // daily
            const now = dayjs();
            let target = dayjs(now.format('YYYY-MM-DD') + ' ' + deadline.time);
            if (now.isAfter(target)) {
                target = target.add(1, 'day');
            }
            return target.valueOf();
        }
    }

    const [deadlines, setDeadlines] = useState(() => {
        const savedDeadlines = localStorage.getItem('deadlines');
        const sortedDeadlines = savedDeadlines
            ? JSON.parse(savedDeadlines).sort((a, b) => getNextOccur(a) - getNextOccur(b))
            : [];
        return sortedDeadlines;
    });
    const [latestddl, setLatestddl] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [eventInput, setEventInput] = useState('');
    const [dateInput, setDateInput] = useState(null);
    const [timeType, setTimeType] = useState('full'); // 'full' or 'daily'
    const [tick, setTick] = useState(0);
    const [showAllModal, setShowAllModal] = useState(false);
    const [filterType, setFilterType] = useState('all'); // 'all' | 'full' | 'daily'

    useEffect(() => {
        if (deadlines.length > 0) {
            setLatestddl(deadlines[0]);
        }
    }, [deadlines]);

    useEffect(() => {
        if (window.Notification && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        // 每秒刷新一次
        const timer = setInterval(() => {
            setTick(t => t + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    
    useEffect(() => {
        if (!latestddl) return;
        const now = dayjs();
        const nextOccur = getNextOccur(latestddl);
        if (nextOccur - now.valueOf() <= 0 && Notification.permission === 'granted') {
            new Notification('截止提醒', {
                body: `${latestddl.event} 已截止！`
            });
        }
    }, [tick, latestddl]);

    function handleAddDeadline() {
        setModalOpen(true);
    }

    function handleModalOk() {
        if (!eventInput || !dateInput) return;
        let newDeadline;
        if (timeType === 'full') {
            newDeadline = {
                event: eventInput,
                time: dayjs(dateInput).format('YYYY-MM-DD HH:mm:ss'),
                type: 'full'
            };
        } else {
            newDeadline = {
                event: eventInput,
                time: dayjs(dateInput).format('HH:mm:ss'),
                type: 'daily'
            };
        }
        const updatedDeadlines = [...deadlines, newDeadline].sort((a, b) => getNextOccur(a) - getNextOccur(b));
        setDeadlines(updatedDeadlines);
        localStorage.setItem('deadlines', JSON.stringify(updatedDeadlines));
        setLatestddl(updatedDeadlines[0]);
        setModalOpen(false);
        setEventInput('');
        setDateInput(null);
        setTimeType('full');
    }

    function handleDeleteDeadline(index) {
        const newList = [...deadlines];
        newList.splice(index, 1);
        setDeadlines(newList);
        localStorage.setItem('deadlines', JSON.stringify(newList));
        // 如果删除的是当前 latestddl，更新 latestddl
        if (newList.length > 0) {
            setLatestddl(newList[0]);
        } else {
            setLatestddl(null);
        }
    }

    // 计算剩余时间
    function getRemainText(deadline) {
        if (!deadline) return '';
        if (deadline.type === 'full') {
            const now = dayjs();
            const end = dayjs(deadline.time);
            const diff = end.diff(now, 'second');
            if (diff <= 0) return '已截止';
            const days = Math.floor(diff / (3600 * 24));
            const hours = Math.floor((diff % (3600 * 24)) / 3600);
            const minutes = Math.floor((diff % 3600) / 60);
            const seconds = diff % 60;
            if (days >= 1) return `剩余 ${days} 天`;
            if (hours >= 1) return `剩余 ${hours} 小时 ${minutes} 分钟`;
            if (minutes >= 1) return `剩余 ${minutes} 分钟`;
            return `剩余 ${seconds} 秒`;
        } else {
            // daily
            const now = dayjs();
            let target = dayjs(now.format('YYYY-MM-DD') + ' ' + deadline.time);
            if (now.isAfter(target)) {
                target = target.add(1, 'day');
            }
            const diff = target.diff(now, 'second');
            const hours = Math.floor(diff / 3600);
            const minutes = Math.floor((diff % 3600) / 60);
            const seconds = diff % 60;
            if (hours >= 1) return `距离今日目标还有 ${hours} 小时 ${minutes} 分钟`;
            return `距离今日目标还有 ${minutes} 分钟 ${seconds} 秒`;
        }
    }

    // 筛选后的列表
    const filteredDeadlines = deadlines.filter(dl => {
        if (filterType === 'all') return true;
        return dl.type === filterType;
    });

    return (
        <>
            <div className="w-full flex items-center justify-between mb-4">
                <div>
                    {latestddl && (
                        <div class="flex flex-col" style={{ marginBottom: 0 }}>
                            <p style={{ marginBottom: 0 }}>{latestddl.event} {latestddl.type === 'full' ? `将于 ${latestddl.time} 截止` : `每天 ${latestddl.time} 截止`}</p>
                            <b style={{ marginBottom: 0 }}>{getRemainText(latestddl)}</b>
                        </div>
                    )}
                    {!latestddl && <p style={{ marginBottom: 0 }}>暂无截止事件</p>}
                </div>
                <div className="flex gap-2">
                    <Button
                        icon={<UnorderedListOutlined />}
                        onClick={() => setShowAllModal(true)}
                    >
                        查看所有截止
                    </Button>
                    <Button
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={handleAddDeadline}
                    >
                        添加
                    </Button>
                </div>
            </div>
            <Modal
                title="添加截止事件"
                open={modalOpen}
                onOk={handleModalOk}
                onCancel={() => setModalOpen(false)}
                okText="确定"
                cancelText="取消"
            >
                <Radio.Group
                    value={timeType}
                    onChange={e => setTimeType(e.target.value)}
                    style={{ marginBottom: 16 }}
                >
                    <Radio value="full">具体日期时间</Radio>
                    <Radio value="daily">每天固定时间</Radio>
                </Radio.Group>
                <Input
                    placeholder="事件名称"
                    value={eventInput}
                    onChange={e => setEventInput(e.target.value)}
                    style={{ marginBottom: 16 }}
                />
                {timeType === 'full' ? (
                    <DatePicker
                        showTime
                        value={dateInput}
                        onChange={setDateInput}
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder="选择截止时间"
                    />
                ) : (
                    <TimePicker
                        value={dateInput}
                        onChange={setDateInput}
                        style={{ width: '100%' }}
                        format="HH:mm:ss"
                        placeholder="选择每天截止时间"
                    />
                )}
            </Modal>
            <Modal
                title="所有截止事件"
                open={showAllModal}
                onCancel={() => setShowAllModal(false)}
                footer={null}
                width={500}
            >
                <Radio.Group
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    style={{ marginBottom: 16 }}
                >
                    <Radio value="all">全部</Radio>
                    <Radio value="full">具体日期时间</Radio>
                    <Radio value="daily">每天固定时间</Radio>
                </Radio.Group>
                <List
                    dataSource={filteredDeadlines}
                    renderItem={(item, idx) => {
                        // 找到 item 在 deadlines 中的真实索引
                        const realIndex = deadlines.findIndex(dl => dl.event === item.event && dl.time === item.time && dl.type === item.type);
                        return (
                            <List.Item
                                actions={[
                                    <Button
                                        danger
                                        size="small"
                                        onClick={() => handleDeleteDeadline(realIndex)}
                                    >
                                        删除
                                    </Button>
                                ]}
                            >
                                <div>
                                    <Tag color={item.type === 'full' ? 'blue' : 'green'}>
                                        {item.type === 'full' ? '具体日期' : '每天'}
                                    </Tag>
                                    <b>{item.event}</b>
                                    <span style={{ marginLeft: 8 }}>
                                        {item.type === 'full' ? item.time : `每天 ${item.time}`}
                                    </span>
                                    <span style={{ marginLeft: 16, color: '#888' }}>
                                        {getRemainText(item)}
                                    </span>
                                </div>
                            </List.Item>
                        );
                    }}
                />
            </Modal>
        </>
    );
}

export default DeadLine;