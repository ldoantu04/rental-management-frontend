import React, { useState } from 'react'
import { assets } from '../assets/assets'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const quickPrompts = [
    'Thêm khách thuê',
    'Tạo hóa đơn tháng này',
    'Phòng nào đang trống?',
    'Doanh thu tháng này'
]

const SparkleIcon = ({ className = 'w-6 h-6' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15zM5 15l.9 2.1L8 18l-2.1.9L5 21l-.9-2.1L2 18l2.1-.9L5 15z" />
    </svg>
)

const SendIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12l16-8-4 16-4-6-8-2z" />
    </svg>
)

const Chatbot = () => {
    const [message, setMessage] = useState('')

    return (
        <div className="min-h-screen bg-[#F6F7FB]">
            <Sidebar />
            <Header title="Trợ lý AI" />

            <div className="ml-[220px] pt-[80px] px-5 pb-5">

                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#80001C] text-white flex items-center justify-center">
                        <SparkleIcon />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Trợ lý AI quản lý nhà trọ
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Hỏi tôi bất cứ điều gì về quản lý nhà trọ của bạn
                        </p>
                    </div>
                </div>

                {/* Quick Prompt */}

                <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm">
                    <p className="text-sm text-gray-700 mb-8">
                        Gợi ý nhanh:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">

                        {quickPrompts.map((prompt) => (
                            <button
                                key={prompt}
                                type="button"
                                className="border border-gray-200 rounded-xl px-4 py-4 text-left text-sm text-gray-800 hover:bg-gray-50 transition-colors"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <span className="w-4 h-4 text-[#80001C] flex items-center justify-center">
                                        <SparkleIcon className="w-4 h-4" />
                                    </span>

                                    {prompt}
                                </span>
                            </button>
                        ))}

                    </div>
                </div>

                {/* Chat Box */}

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm h-[600px] flex flex-col overflow-hidden">

                    <div className="flex-1 p-5">

                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-xl bg-[#80001C] text-white flex items-center justify-center">
                                <img
                                    className="w-4 h-4 brightness-0 invert"
                                    src={assets.icon_ai}
                                    alt=""
                                />
                            </div>

                            <span className="text-sm text-gray-600">
                                Trợ lý AI
                            </span>
                        </div>

                        <div className="max-w-[760px] bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3">

                            <p className="text-sm text-gray-800">
                                Xin chào! Tôi là trợ lý AI của SmartRental.
                                Tôi có thể giúp bạn quản lý nhà trọ,
                                tạo hóa đơn, kiểm tra phòng trống
                                và nhiều hơn nữa.
                                Bạn cần tôi hỗ trợ gì?
                            </p>

                            <p className="text-xs text-gray-500 mt-2">
                                10:00
                            </p>

                        </div>

                    </div>

                    {/* Input */}

                    <div className="border-t border-gray-200 p-4">

                        <div className="flex items-center gap-3">

                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Nhập yêu cầu của bạn..."
                                className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none text-gray-700 placeholder-gray-400"
                            />

                            <button
                                type="button"
                                aria-label="Gửi tin nhắn"
                                className="w-10 h-10 rounded-xl bg-[#80001C] hover:bg-[#6B0018] text-white flex items-center justify-center transition-colors"
                            >
                                <SendIcon />
                            </button>

                        </div>

                    </div>

                </div>

            </div>
        </div>
    )
}

export default Chatbot
