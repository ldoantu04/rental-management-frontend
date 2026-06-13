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
import Setting from './pages/Setting'
import { RentalContext } from './context/RentalContext'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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
        <Route path='/cai-dat' element={token ? <Setting /> : <Navigate to='/login' />} />
      </Routes>
    </div>
  )
}

export default App
