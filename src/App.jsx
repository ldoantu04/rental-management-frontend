import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Motel from './pages/Motel'
import Room from './pages/Room'
import Tenant from './pages/Tenant'
import Contract from './pages/Contract'
import Invoice from './pages/Invoice'
import Transaction from './pages/Transaction'
import Staff from './pages/Staff'
import Chatbot from './pages/Chatbot'
import Setting from './pages/Setting'
import { RentalContext } from './context/RentalContext'
import { assets } from './assets/assets'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const LogoutModal = () => {
  const { logout, showLogoutConfirm, setShowLogoutConfirm } = useContext(RentalContext)

  if (!showLogoutConfirm) return null

  return (
    <div className='fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4'>
      <div className='w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl'>
        <div className='mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#FDF2F4]'>
          <img className='h-7 w-7' src={assets.icon_logout} alt='' />
        </div>
        <h3 className='text-xl font-semibold text-gray-900'>Xác nhận đăng xuất</h3>
        <p className='mt-3 text-sm text-gray-500'>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?</p>
        <div className='mt-8 grid grid-cols-2 gap-3'>
          <button
            type='button'
            onClick={() => setShowLogoutConfirm(false)}
            className='rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50'
          >
            Hủy
          </button>
          <button
            type='button'
            onClick={logout}
            className='rounded-xl bg-[#80001C] py-3 text-sm font-medium text-white hover:bg-[#6B0018]'
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  )
}

const App = () => {

  const { token } = useContext(RentalContext)

  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path='/login' element={!token ? <Login /> : <Navigate to='/tong-quan' />} />
        <Route path='/tong-quan' element={token ? <Overview /> : <Navigate to='/login' />} />
        <Route path='/' element={<Navigate to={token ? '/tong-quan' : '/login'} />} />
        <Route path='/nha-tro' element={token ? <Motel /> : <Navigate to='/login' />} />
        <Route path='/phong-tro' element={token ? <Room /> : <Navigate to='/login' />} />
        <Route path='/khach-thue' element={token ? <Tenant /> : <Navigate to='/login' />} />
        <Route path='/hop-dong' element={token ? <Contract /> : <Navigate to='/login' />} />
        <Route path='/hoa-don' element={token ? <Invoice /> : <Navigate to='/login' />} />
        <Route path='/giao-dich' element={token ? <Transaction /> : <Navigate to='/login' />} />
        <Route path='/nhan-vien' element={token ? <Staff /> : <Navigate to='/login' />} />
        <Route path='/tro-ly-ai' element={token ? <Chatbot /> : <Navigate to='/login' />} />
        <Route path='/cai-dat' element={token ? <Setting /> : <Navigate to='/login' />} />
      </Routes>
      <LogoutModal />
    </div>
  )
}

export default App
