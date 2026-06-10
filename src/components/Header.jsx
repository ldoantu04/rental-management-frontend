// import React, { useContext } from 'react'
// import { assets } from '../assets/assets'
// import { RentalContext } from '../context/RentalContext'

// const Header = ({ title }) => {

//     const { user } = useContext(RentalContext)

//     return (
//         <header className='fixed top-0 left-[200px] lg:left-[220px] right-0 z-30 h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-6 transition-all duration-300'>

//             <h2 className='text-sm font-medium text-gray-700'>{title}</h2>

//             <div className='flex items-center gap-4'>
//                 <button className='relative p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer'>
//                     <img className='w-5 h-5 opacity-60' src={assets.icon_notification} alt='Thông báo' />
//                     <span className='absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full'></span>
//                 </button>

//                 {/* Avatar */}
//                 <div className='w-8 h-8 rounded-full bg-[#7A1B2E] flex items-center justify-center text-white text-xs font-bold cursor-pointer'>
//                     {user?.hoTen ? user.hoTen.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'NA'}
//                 </div>
//             </div>
//         </header>
//     )
// }

// export default Header

import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { RentalContext } from '../context/RentalContext'

const Header = ({ title }) => {

    const { user } = useContext(RentalContext)

    const initials = user?.hoTen
        ? user.hoTen
            .split(' ')
            .map(word => word[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'NA'

    return (
        <header className='fixed top-0 left-[220px] right-0 h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20'>

            <h1 className='text-lg font-semibold text-gray-800'>
                {title}
            </h1>

            <div className='flex items-center gap-5'>

                <button className='relative cursor-pointer'>
                    <img
                        className='w-5 h-5 opacity-70'
                        src={assets.icon_notification}
                        alt=''
                    />

                    <span className='absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full'></span>
                </button>

                <div className='w-9 h-9 rounded-full bg-[#7A1B2E] text-white flex items-center justify-center text-sm font-semibold'>
                    {initials}
                </div>

            </div>

        </header>
    )
}

export default Header