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