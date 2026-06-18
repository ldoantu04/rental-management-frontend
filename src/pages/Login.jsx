import React, { useContext, useEffect, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import LoginBranding from '../components/LoginBranding'
import { toast } from 'react-toastify'
import axios from 'axios'
import { RentalContext } from '../context/RentalContext'

const Login = () => {
    
    const { backendUrl, token, setToken, navigate } = useContext(RentalContext)

    const [currentStep, setCurrentStep] = useState('email')
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState(Array(6).fill(''))
    const [loading, setLoading] = useState(false)
    const [countdown, setCountdown] = useState(0)

    const inputRefs = useRef([])

    useEffect(() => {
        if (token) {
            navigate('/')
        }
    }, [token])

    useEffect(() => {
        if (countdown <= 0) return
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
        return () => clearTimeout(timer)
    }, [countdown])

    const onSendOtp = async (event) => {
        event.preventDefault()
        setLoading(true)
        try {
            const response = await axios.post(backendUrl + '/auth/send-otp', { email })
            setCurrentStep('otp')
            setCountdown(60)
            toast.success(response.data.message)
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
        setLoading(false)
    }

    const onVerifyOtp = async (event) => {
        event.preventDefault()
        const otpCode = otp.join('')
        if (otpCode.length < 6) {
            toast.error('Vui lòng nhập đầy đủ mã OTP')
            return
        }
        setLoading(true)
        try {
            const response = await axios.post(backendUrl + '/auth/login', { email, otp: otpCode })
            if (response.data.jwt) {
                setToken(response.data.jwt)
                localStorage.setItem('token', response.data.jwt)
                toast.success(response.data.message)
                navigate('/')
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
        setLoading(false)
    }

    const onResendOtp = async () => {
        if (countdown > 0) return
        try {
            const response = await axios.post(backendUrl + '/auth/send-otp', { email })
            setOtp(Array(6).fill(''))
            setCountdown(60)
            toast.success(response.data.message)
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return
        const newOtp = [...otp]
        newOtp[index] = value.slice(-1)
        setOtp(newOtp)

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleOtpPaste = (e) => {
        e.preventDefault()
        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (!pasteData) return
        const newOtp = [...otp]
        for (let i = 0; i < pasteData.length; i++) {
            newOtp[i] = pasteData[i]
        }
        setOtp(newOtp)
        const focusIndex = Math.min(pasteData.length, 5)
        inputRefs.current[focusIndex]?.focus()
    }

    const goBackToEmail = () => {
        setCurrentStep('email')
        setOtp(Array(6).fill(''))
        setCountdown(0)
    }

    return (
        <div className='min-h-screen flex flex-col md:flex-row'>
            <LoginBranding />

            <div className='flex-1 flex items-center justify-center bg-gray-50 p-6 sm:p-8 md:p-12'>
                <div className='w-full max-w-sm sm:max-w-md'>

                    {/* Step 1: Nhap mail */}
                    {currentStep === 'email' && (
                        <form onSubmit={onSendOtp} className='bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10'>
                            <h2 className='text-2xl sm:text-3xl font-bold text-[#7A1B2E] text-center'>Đăng Nhập</h2>
                            <p className='text-sm text-gray-500 text-center mt-2 mb-6'>
                                Chào mừng quay trở lại! Vui lòng nhập email để nhận mã xác thực.
                            </p>

                            <label className='block text-sm font-medium text-gray-700 mb-2'>Email</label>

                            <div className='flex items-center border border-gray-300 rounded-xl px-4 py-3 gap-3 focus-within:border-[#7A1B2E] focus-within:ring-1 focus-within:ring-[#7A1B2E] transition-all'>
                                <img className='w-5 h-5 opacity-50' src={assets.icon_email} alt='email' />
                                <input
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    type='email'
                                    className='flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent'
                                    placeholder='Nhập địa chỉ email'
                                    required
                                />
                            </div>

                            <button
                                type='submit'
                                disabled={loading}
                                className='w-full mt-6 bg-[#7A1B2E] hover:bg-[#611624] text-white font-semibold py-3 rounded-xl transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer'
                            >
                                {loading ? 'Đang gửi...' : 'Gửi Mã OTP'}
                            </button>

                            <p className='text-xs text-gray-400 text-center mt-4'>
                                Mã xác thực sẽ được gửi đến email của bạn.
                            </p>
                        </form>
                    )}

                    {/* Step2: Xac thuc otp */}
                    {currentStep === 'otp' && (
                        <form onSubmit={onVerifyOtp} className='bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10'>
                            <h2 className='text-2xl sm:text-3xl font-bold text-gray-800'>Xác Thực OTP</h2>
                            <p className='text-sm text-gray-500 mt-2'>Mã xác thực đã được gửi đến</p>

                            <div className='flex items-center gap-2 mt-1 mb-6'>
                                <img className='w-4 h-4 opacity-50' src={assets.icon_email} alt='email' />
                                <span className='text-sm font-medium text-gray-700'>{email}</span>
                            </div>

                            <div className='flex items-center justify-between gap-2 sm:gap-3' onPaste={handleOtpPaste}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type='text'
                                        inputMode='numeric'
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        className='w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-semibold border border-gray-300 rounded-xl bg-[#FDF5F5] focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E] outline-none transition-all'
                                    />
                                ))}
                            </div>

                            <div className='flex items-center justify-center gap-2 mt-4 text-sm'>
                                {countdown > 0 ? (
                                    <span className='text-gray-400'>Mã OTP hết hạn sau {countdown}s</span>
                                ) : (
                                    <>
                                        <span className='text-gray-400'>Mã OTP đã hết hạn.</span>
                                        <button
                                            type='button'
                                            onClick={onResendOtp}
                                            className='flex items-center gap-1 text-[#7A1B2E] font-medium hover:underline cursor-pointer'
                                        >
                                            <img className='w-3.5 h-3.5' src={assets.icon_retry} alt='retry' />
                                            Gửi lại mã
                                        </button>
                                    </>
                                )}
                            </div>

                            <button
                                type='submit'
                                disabled={loading}
                                className='w-full mt-6 bg-[#7A1B2E] hover:bg-[#611624] text-white font-semibold py-3 rounded-xl transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer'
                            >
                                {loading ? 'Đang xác thực...' : 'Xác Nhận Đăng Nhập'}
                            </button>

                            <button
                                type='button'
                                onClick={goBackToEmail}
                                className='w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer'
                            >
                                ← Quay lại nhập email
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Login
