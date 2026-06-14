import React, { useContext, useEffect, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import { RentalContext } from '../context/RentalContext'

const sampleNotifications = [
    {
        id: 1,
        type: 'invoice',
        title: 'Cảnh báo thanh toán hóa đơn',
        description: 'Hóa đơn tháng 5 phòng 101 chưa được thanh toán — Hạn thanh toán còn 3 ngày.',
        time: '2 giờ trước',
        unread: true,
        room: 'Phòng 101'
    },
    {
        id: 2,
        type: 'contract',
        title: 'Hợp đồng sắp hết hạn',
        description: 'Hợp đồng phòng 205 sắp hết hạn vào ngày 30/06/2026.',
        time: '5 giờ trước',
        unread: true,
        room: 'Phòng 205'
    },
    {
        id: 3,
        type: 'transaction',
        title: 'Giao dịch thành công',
        description: 'Giao dịch thanh toán thành công — Phòng 103, số tiền 2.500.000đ.',
        time: 'Hôm qua, 14:30',
        unread: false,
        room: 'Phòng 103'
    },
    {
        id: 4,
        type: 'system',
        title: 'Thông báo từ hệ thống',
        description: 'Hệ thống gửi email nhắc nợ định kỳ thành công.',
        time: '23/05/2026',
        unread: false,
        room: 'System Auto'
    }
]

const Header = ({ title }) => {

    const { user } = useContext(RentalContext)
    const [showNotifications, setShowNotifications] = useState(false)
    const [notifications, setNotifications] = useState(sampleNotifications)
    const [activeTab, setActiveTab] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)

const pageSize = 5
    const panelRef = useRef(null)

    const initials = user?.hoTen
        ? user.hoTen
            .split(' ')
            .map(word => word[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'NA'

    const unreadCount = notifications.filter((item) => item.unread).length

    const tabs = [
        { key: 'all', label: 'Tất cả' },
        { key: 'unread', label: `Chưa Đọc (${unreadCount})` },
        { key: 'invoice', label: 'Hóa Đơn' },
        { key: 'contract', label: 'Hợp Đồng' },
        { key: 'system', label: 'Hệ Thống' }
    ]

    const filteredNotifications =
        activeTab === 'all'
            ? notifications
            : activeTab === 'unread'
                ? notifications.filter(item => item.unread)
                : notifications.filter(
                    item => item.type === activeTab
                )

    const totalPages = Math.ceil(
        filteredNotifications.length / pageSize
    )

    const paginatedNotifications =
        filteredNotifications.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
        )

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

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((item) => ({ ...item, unread: false })))
    }

    const notificationTypes = {
        invoice: {
            label: 'Hóa Đơn',
            icon: assets.icon_invoice,
            tone: 'bg-orange-100'
        },

        contract: {
            label: 'Hợp Đồng',
            icon: assets.icon_contract,
            tone: 'bg-blue-100'
        },

        transaction: {
            label: 'Hệ Thống',
            icon: assets.icon_transaction,
            tone: 'bg-green-100'
        },

        system: {
            label: 'Hệ Thống',
            icon: assets.icon_email,
            tone: 'bg-gray-100'
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
                                    className='text-sm font-medium text-[#80001C]'
                                >
                                    ✓✓ Đánh dấu tất cả đã đọc
                                </button>
                            </div>

                            {/* Filter */}

                            <div className='mt-5 flex gap-2 px-4'>
                                {tabs.map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => {
                                            setActiveTab(tab.key)
                                            setCurrentPage(1)
                                        }}
                                        className={`rounded-full px-5 py-2 text-sm transition
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

                                {paginatedNotifications.map(item => {

                                    const config =
                                        notificationTypes[item.type]

                                    return (
                                        <div
                                            key={item.id}
                                            className={`mb-3 rounded-2xl border p-4 transition-all
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

                            <div className='flex items-center justify-center gap-2 border-t border-gray-100 p-5'>

                                <button
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage(prev => prev - 1)
                                    }
                                    className='flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200'
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
                                    className='flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200'
                                >
                                    ›
                                </button>

                            </div>
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