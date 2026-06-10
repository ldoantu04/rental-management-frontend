import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { RentalContext } from '../context/RentalContext'

const Sidebar = () => {

    const { user, logout } = useContext(RentalContext)

    const menuItems = [
        { label: 'Tổng Quan', icon: assets.icon_overview, path: '/tong-quan' },
        { label: 'Nhà Trọ', icon: assets.icon_motel, path: '/nha-tro' },
        { label: 'Phòng Trọ', icon: assets.icon_room, path: '/phong-tro' },
        { label: 'Khách Thuê', icon: assets.icon_tenant, path: '/khach-thue' },
        { label: 'Hợp Đồng', icon: assets.icon_contract, path: '/hop-dong' },
        { label: 'Hóa Đơn', icon: assets.icon_invoice, path: '/hoa-don' },
        { label: 'Giao Dịch', icon: assets.icon_transaction, path: '/giao-dich' },
        { label: 'Trợ Lý AI', icon: assets.icon_ai, path: '/tro-ly-ai' },
        { label: 'Nhân Viên', icon: assets.icon_staff, path: '/nhan-vien' },
        { label: 'Cài Đặt', icon: assets.icon_setting, path: '/cai-dat' }
    ]

    return (
        <div className='fixed top-0 left-0 w-[220px] h-screen bg-white border-r border-gray-200 flex flex-col'>

            <div className='h-[60px] bg-[#7A1B2E] flex items-center gap-3 px-5'>
                <img className='w-6 h-6' src={assets.logo} alt=''/>
                <h2 className='text-white font-semibold text-lg'>
                    SmartRental
                </h2>
            </div>

            <div className='flex-1 p-3'>
                {menuItems.map((item) => (
                    <NavLink key={item.path} to={item.path} className={({ isActive }) =>`flex items-center gap-3 px-4 py-3 mb-1 rounded-xl text-sm transition-colors ${isActive ? 'bg-[#FCEEEF] text-[#7A1B2E] font-medium' : 'text-gray-600 hover:bg-gray-50'} `}>
                        <img className='w-4 h-4' src={item.icon} alt=''/>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>

            <div className='border-t border-gray-200 p-4'>
                <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-[#7A1B2E] text-white flex items-center justify-center font-semibold'>
                        {user?.hoTen
                            ? user.hoTen.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase()
                            : 'NA'}
                    </div>

                    <div className='flex-1'>
                        <p className='text-sm font-medium text-gray-800'>
                            {user?.hoTen || 'Nguyễn Văn A'}
                        </p>
                        <p className='text-xs text-gray-500'>
                            {user?.email || 'admin@tu.com'}
                        </p>
                    </div>

                    <button onClick={logout} className='cursor-pointer'>
                        <img className='w-4 h-4 opacity-60' src={assets.icon_logout} alt=''/>
                    </button>
                </div>
            </div>

        </div>
    )
}

export default Sidebar