import React from 'react'
import { assets } from '../assets/assets'

const LoginBranding = () => {
  return (
    <div className='hidden md:flex md:w-1/2 bg-[#7A1B2E] flex-col items-center justify-center text-white p-8 lg:p-12'>
      <div className='flex flex-col items-center gap-6'>
        {/* Logo Icon */}
        <div className='w-20 h-20 lg:w-24 lg:h-24 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm'>
          <img className='w-10 h-10 lg:w-12 lg:h-12' src={assets.logo} alt='Logo' />
        </div>

        {/* Title */}
        <h1 className='text-2xl lg:text-3xl xl:text-4xl font-bold text-center leading-tight'>
          Hệ Thống Quản Lý Nhà Trọ
        </h1>

        {/* Subtitle */}
        <p className='text-sm lg:text-base text-white/70 text-center'>
          Quản lý tập trung – Vận hành hiệu quả
        </p>
      </div>
    </div>
  )
}

export default LoginBranding
