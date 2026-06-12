import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Motel from './pages/Motel'
import Room from './pages/Room'
import Tenant from './pages/Tenant'
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
      </Routes>
    </div>
  )
}

export default App
