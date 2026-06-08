import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<Navigate to='/login' />} />
      </Routes>
    </div>
  )
}

export default App
