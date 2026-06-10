// import React, { useContext } from 'react'
// import { NavLink } from 'react-router-dom'
// import { assets } from '../assets/assets'
// import { RentalContext } from '../context/RentalContext'

// const Sidebar = () => {

//     const { logout, user } = useContext(RentalContext)

//     const menuItems = [
//         { label: 'Tổng Quan', icon: assets.icon_overview, path: '/tong-quan' },
//         { label: 'Nhà Trọ', icon: assets.icon_motel, path: '/nha-tro' },
//         { label: 'Phòng Trọ', icon: assets.icon_room, path: '/phong-tro' },
//         { label: 'Khách Thuê', icon: assets.icon_tenant, path: '/khach-thue' },
//         { label: 'Hợp Đồng', icon: assets.icon_contract, path: '/hop-dong' },
//         { label: 'Hóa Đơn', icon: assets.icon_invoice, path: '/hoa-don' },
//         { label: 'Giao Dịch', icon: assets.icon_transaction, path: '/giao-dich' },
//         { label: 'Trợ Lý AI', icon: assets.icon_ai, path: '/tro-ly-ai' },
//         { label: 'Nhân viên', icon: assets.icon_staff, path: '/nhan-vien' },
//         { label: 'Cài Đặt', icon: assets.icon_setting, path: '/cai-dat' },
//     ]

//     return (
//         <div className='fixed top-0 left-0 z-40 h-screen w-[200px] lg:w-[220px] bg-[#7A1B2E] flex flex-col transition-all duration-300'>

//             <div className='flex items-center gap-2.5 px-5 py-5 border-b border-white/10'>
//                 <div className='w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center'>
//                     <img className='w-5 h-5' src={assets.logo} alt='Logo' />
//                 </div>
//                 <span className='text-white font-bold text-base lg:text-lg'>SmartRental</span>
//             </div>

//             <nav className='flex-1 overflow-y-auto py-4 px-3'>
//                 {menuItems.map((item) => (
//                     <NavLink
//                         key={item.path}
//                         to={item.path}
//                         className={({ isActive }) =>
//                             `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 group
//                             ${isActive
//                                 ? 'bg-white/15 text-white font-semibold'
//                                 : 'text-white/70 hover:bg-white/10 hover:text-white'
//                             }`
//                         }
//                     >
//                         <img className='w-[18px] h-[18px] opacity-80 group-hover:opacity-100 transition-opacity' src={item.icon} alt={item.label} />
//                         <span className='text-sm'>{item.label}</span>
//                     </NavLink>
//                 ))}
//             </nav>

//             {/* User Info */}
//             <div className='border-t border-white/10 px-4 py-4'>
//                 <div className='flex items-center gap-3'>
//                     <div className='w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold shrink-0'>
//                         {user?.hoTen ? user.hoTen.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'NA'}
//                     </div>
//                     <div className='flex-1 min-w-0'>
//                         <p className='text-white text-sm font-medium truncate'>{user?.hoTen || 'Nguyễn Văn A'}</p>
//                         <p className='text-white/50 text-xs truncate'>{user?.email || 'admin@tu.com'}</p>
//                     </div>
//                     <button onClick={logout} className='p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer' title='Đăng xuất'>
//                         <img className='w-4 h-4 opacity-70 hover:opacity-100' src={assets.icon_logout} alt='Đăng xuất' />
//                     </button>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default Sidebar

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