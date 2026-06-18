import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { assets } from '../assets/assets'
import { RentalContext } from '../context/RentalContext'

const pageSize = 5

const TYPE_MAP = {
    HOA_DON: {
        key: 'invoice',
        label: 'Hóa Đơn',
        icon: assets.icon_invoice,
        tone: 'bg-orange-100'
    },
    HOP_DONG_HET_HAN: {
        key: 'contract',
        label: 'Hợp Đồng',
        icon: assets.icon_contract,
        tone: 'bg-blue-100'
    },
    THANH_TOAN: {
        key: 'transaction',
        label: 'Giao Dịch',
        icon: assets.icon_transaction,
        tone: 'bg-green-100'
    },
    HE_THONG: {
        key: 'system',
        label: 'Hệ Thống',
        icon: assets.icon_email,
        tone: 'bg-gray-100'
    }
}

const formatRelativeTime = (value) => {
    if (!value) return '-'
    const date = new Date(value)
    if (isNaN(date.getTime())) return '-'
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return 'Vừa xong'
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin} phút trước`
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return `${diffHour} giờ trước`
    const diffDay = Math.floor(diffHour / 24)
    if (diffDay === 1) return `Hôm qua, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    if (diffDay < 7) return `${diffDay} ngày trước`
    const dd = date.getDate().toString().padStart(2, '0')
    const mm = (date.getMonth() + 1).toString().padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${dd}/${mm}/${yyyy}`
}

const extractRoom = (noiDung) => {
    if (!noiDung) return null
    const match = noiDung.match(/phòng\s+([^\s.,-]+)/i)
    return match ? `Phòng ${match[1]}` : null
}

const mapNotification = (item) => {
    const typeKey = item.loai || 'HE_THONG'
    const config = TYPE_MAP[typeKey] || TYPE_MAP.HE_THONG
    return {
        id: item.id,
        type: config.key,
        typeKey,
        title: item.tieuDe || 'Thông báo',
        description: item.noiDung || '',
        time: formatRelativeTime(item.ngayTao),
        unread: !item.daDoc,
        room: extractRoom(item.noiDung) || 'Hệ thống'
    }
}

const Header = ({ title }) => {

    const { backendUrl, token, user } = useContext(RentalContext)
    const [showNotifications, setShowNotifications] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [activeTab, setActiveTab] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [marking, setMarking] = useState(false)

    const panelRef = useRef(null)

    const initials = user?.hoTen
        ? user.hoTen
            .split(' ')
            .map(word => word[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'NA'

    const tabs = [
        { key: 'all', label: 'Tất cả' },
        { key: 'unread', label: `Chưa Đọc (${unreadCount})` },
        { key: 'invoice', label: 'Hóa Đơn' },
        { key: 'contract', label: 'Hợp Đồng' },
        { key: 'transaction', label: 'Giao Dịch' },
        { key: 'system', label: 'Hệ Thống' }
    ]

    const filteredNotifications = useMemo(() => {
        if (activeTab === 'all') return notifications
        if (activeTab === 'unread') return notifications.filter(item => item.unread)
        return notifications.filter(item => item.type === activeTab)
    }, [notifications, activeTab])

    const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / pageSize))

    const paginatedNotifications = useMemo(
        () => filteredNotifications.slice((currentPage - 1) * pageSize, currentPage * pageSize),
        [filteredNotifications, currentPage]
    )

    const fetchNotifications = useCallback(async () => {
        if (!token) return
        try {
            setLoading(true)
            const response = await axios.get(backendUrl + '/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const list = (response.data || []).map(mapNotification)
            setNotifications(list)
            setUnreadCount(list.filter(item => item.unread).length)
        } catch (error) {
            console.log('Khong the tai thong bao:', error)
        } finally {
            setLoading(false)
        }
    }, [backendUrl, token])

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setShowNotifications(false)
            }
        }
        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showNotifications])

    useEffect(() => {
        setCurrentPage(1)
    }, [activeTab])

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [totalPages, currentPage])

    const markAllAsRead = async () => {
        if (!token || unreadCount === 0 || marking) return
        try {
            setMarking(true)
            await axios.put(backendUrl + '/api/notifications/read-all', null, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })))
            setUnreadCount(0)
        } catch (error) {
            console.log('Khong the danh dau tat ca da doc:', error)
        } finally {
            setMarking(false)
        }
    }

    const openNotification = async (item) => {
        if (!token || !item.unread) return
        try {
            await axios.put(backendUrl + `/api/notifications/${item.id}/read`, null, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setNotifications((prev) => prev.map((n) => n.id === item.id ? { ...n, unread: false } : n))
            setUnreadCount((prev) => Math.max(0, prev - 1))
        } catch (error) {
            console.log('Khong the danh dau da doc:', error)
        }
    }

    return (
        <header className='fixed top-0 left-[220px] right-0 h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20'>

            <h1 className='text-lg font-semibold text-gray-800'>
                {title}
            </h1>

            <div className='flex items-center gap-5'>

                <div className='relative' ref={panelRef}>
                    <button
                        type='button'
                        onClick={() => setShowNotifications((prev) => !prev)}
                        className='relative cursor-pointer rounded-full p-1 transition-colors hover:bg-gray-100'
                        aria-label='Mở thông báo'
                    >
                        <img
                            className='w-5 h-5 opacity-70'
                            src={assets.icon_notification}
                            alt=''
                        />

                        {unreadCount > 0 && (
                            <span className='absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center'>
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className='absolute right-0 top-12 w-[640px] h-[760px] rounded-3xl border border-gray-200 bg-white shadow-2xl flex flex-col'>

                            {/* Header */}

                            <div className='flex items-center justify-between px-6 pt-6'>
                                <h2 className='text-2xl font-bold text-gray-900'>
                                    Thông Báo
                                </h2>

                                <button
                                    type='button'
                                    onClick={markAllAsRead}
                                    disabled={unreadCount === 0 || marking}
                                    className={`text-sm font-medium ${unreadCount === 0 || marking ? 'text-gray-300' : 'text-[#80001C]'}`}
                                >
                                    ✓✓ Đánh dấu tất cả đã đọc
                                </button>
                            </div>

                            {/* Filter */}

                            <div className='mt-5 flex gap-2 px-4 overflow-x-auto'>
                                {tabs.map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => {
                                            setActiveTab(tab.key)
                                            setCurrentPage(1)
                                        }}
                                        className={`whitespace-nowrap rounded-full px-5 py-2 text-sm transition
                                        ${
                                            activeTab === tab.key
                                                ? 'bg-[#80001C] text-white'
                                                : 'border border-gray-200 text-gray-500'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Notification list */}

                            <div className='mt-5 flex-1 overflow-y-auto px-4'>

                                {loading ? (
                                    <div className='py-10 text-center text-sm text-gray-400'>
                                        Đang tải thông báo...
                                    </div>
                                ) : paginatedNotifications.length === 0 ? (
                                    <div className='py-10 text-center text-sm text-gray-400'>
                                        Không có thông báo nào
                                    </div>
                                ) : paginatedNotifications.map(item => {

                                    const config = TYPE_MAP[item.typeKey] || TYPE_MAP.HE_THONG

                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => openNotification(item)}
                                            className={`mb-3 cursor-pointer rounded-2xl border p-4 transition-all
                                            ${
                                                item.unread
                                                    ? 'border-blue-100 bg-[#F7F9FC]'
                                                    : 'border-gray-100 bg-white'
                                            }
                                            hover:bg-gray-50`}
                                        >
                                            <div className='flex gap-4'>

                                                <div
                                                    className={`flex h-12 w-12 items-center justify-center rounded-full ${config.tone}`}
                                                >
                                                    <img
                                                        src={config.icon}
                                                        alt=''
                                                        className='h-5 w-5'
                                                    />
                                                </div>

                                                <div className='flex-1'>
                                                    <div className='flex items-start justify-between'>
                                                        <p className='font-semibold text-gray-900'>
                                                            {item.title}
                                                        </p>

                                                        {item.unread && (
                                                            <span className='h-2.5 w-2.5 rounded-full bg-blue-600' />
                                                        )}
                                                    </div>

                                                    <p className='mt-1 text-sm leading-6 text-gray-500'>
                                                        {item.description}
                                                    </p>

                                                    <div className='mt-3 flex items-center gap-3 text-xs text-gray-400'>
                                                        <span>
                                                            ⏺ {item.time}
                                                        </span>

                                                        <span className='rounded-full bg-orange-100 px-2 py-0.5 text-orange-600'>
                                                            {item.room}
                                                        </span>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    )
                                })}

                            </div>

                            {/* Pagination */}

                            {filteredNotifications.length > 0 && (
                                <div className='flex items-center justify-center gap-2 border-t border-gray-100 p-5'>

                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() =>
                                            setCurrentPage(prev => prev - 1)
                                        }
                                        className='flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 disabled:opacity-40'
                                    >
                                        ‹
                                    </button>

                                    {Array.from(
                                        { length: totalPages },
                                        (_, index) => (
                                            <button
                                                key={index}
                                                onClick={() =>
                                                    setCurrentPage(index + 1)
                                                }
                                                className={`h-10 w-10 rounded-xl text-sm font-medium
                                                ${
                                                    currentPage === index + 1
                                                        ? 'bg-[#80001C] text-white'
                                                        : ''
                                                }`}
                                            >
                                                {index + 1}
                                            </button>
                                        )
                                    )}

                                    <button
                                        disabled={
                                            currentPage === totalPages
                                        }
                                        onClick={() =>
                                            setCurrentPage(prev => prev + 1)
                                        }
                                        className='flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 disabled:opacity-40'
                                    >
                                        ›
                                    </button>

                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className='w-9 h-9 rounded-full bg-[#7A1B2E] text-white flex items-center justify-center text-sm font-semibold'>
                    {initials}
                </div>

            </div>

        </header>
    )
}

export default Header
