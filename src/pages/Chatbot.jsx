import { useContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { RentalContext } from '../context/RentalContext'

const quickPrompts = [
    { label: 'Phòng nào đang trống?', value: 'Cho toi biet cac phong dang trong hien tai' },
    { label: 'Hợp đồng sắp hết hạn', value: 'Hop dong nao sap het han?' },
    { label: 'Hóa đơn chưa thanh toán', value: 'Co bao nhieu hoa don chua thanh toan?' },
    { label: 'Doanh thu tháng này', value: 'Doanh thu thang nay la bao nhieu?' }
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

const formatTime = (iso) => {
    if (!iso) return ''
    try {
        const d = new Date(iso)
        if (isNaN(d.getTime())) return ''
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    } catch {
        return ''
    }
}

const Chatbot = () => {
    const { backendUrl, token } = useContext(RentalContext)
    const [message, setMessage] = useState('')
    const [conversations, setConversations] = useState([])
    const [activeConversationId, setActiveConversationId] = useState(null)
    const [messages, setMessages] = useState([])
    const [thinking, setThinking] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [pendingConfirmation, setPendingConfirmation] = useState(null)

    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    const fetchConversations = async () => {
        try {
            const res = await axios.get(backendUrl + '/api/chat/conversations', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setConversations(res.data || [])
            if ((res.data || []).length > 0 && !activeConversationId) {
                setActiveConversationId(res.data[0].id)
            }
        } catch (error) {
            console.log('Loi tai danh sach hoi thoai:', error)
        }
    }

    const fetchMessages = async (id) => {
        try {
            const res = await axios.get(backendUrl + `/api/chat/conversations/${id}/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setMessages(res.data || [])
        } catch (error) {
            console.log('Loi tai tin nhan:', error)
            toast.error('Khong the tai noi dung cuoc tro chuyen')
        }
    }

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }

    useEffect(() => {
        if (token) {
            fetchConversations()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token])

    useEffect(() => {
        if (activeConversationId) {
            fetchMessages(activeConversationId)
        } else {
            setMessages([])
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeConversationId])

    useEffect(() => {
        scrollToBottom()
    }, [messages, thinking])

    const startNewConversation = () => {
        setActiveConversationId(null)
        setMessages([])
        setPendingConfirmation(null)
        setTimeout(() => {
            if (inputRef.current) inputRef.current.focus()
        }, 50)
    }

    const sendMessage = async (textOverride) => {
        const text = (textOverride !== undefined ? textOverride : message).trim()
        if (!text) return
        if (textOverride === undefined) setMessage('')

        const optimisticUserMsg = {
            id: 'temp-user-' + new Date().getTime(),
            vaiTro: 'USER',
            noiDung: text,
            ngayTao: new Date().toISOString(),
            isOptimistic: true
        }
        setMessages((prev) => [...prev, optimisticUserMsg])
        setThinking(true)
        setPendingConfirmation(null)

        try {
            const res = await axios.post(
                backendUrl + '/api/chat/send',
                { hoiThoaiId: activeConversationId, noiDung: text },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            const data = res.data || {}
            setActiveConversationId(data.hoiThoaiId)
            setMessages(data.toanBoTinNhan || [])

            const assistantMsg = data.tinNhanTroLy
            if (assistantMsg && assistantMsg.canXacNhan) {
                setPendingConfirmation({
                    messageId: assistantMsg.id,
                    noiDung: assistantMsg.noiDung,
                    hanhDong: assistantMsg.hanhDongChoXacNhan
                })
            } else {
                setPendingConfirmation(null)
            }
            fetchConversations()
        } catch (error) {
            console.log('Loi gui tin nhan:', error)
            toast.error(error.response?.data?.message || 'Khong the gui tin nhan. Vui long thu lai.')
            setMessages((prev) => prev.filter((m) => m.id !== optimisticUserMsg.id))
        } finally {
            setThinking(false)
        }
    }

    const handleConfirm = async (xacNhan) => {
        if (!pendingConfirmation) return
        try {
            setThinking(true)
            const res = await axios.post(
                backendUrl + '/api/chat/confirm',
                {
                    hoiThoaiId: activeConversationId,
                    tinNhanId: pendingConfirmation.messageId,
                    xacNhan
                },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (res.data) {
                setMessages((prev) => [...prev, res.data])
            }
            setPendingConfirmation(null)
        } catch (error) {
            console.log('Loi xac nhan:', error)
            toast.error(error.response?.data?.message || 'Khong the thuc hien thao tac')
        } finally {
            setThinking(false)
        }
    }

    const handleDeleteConversation = async (id) => {
        if (!window.confirm('Ban co chac muon xoa cuoc tro chuyen nay?')) return
        try {
            await axios.delete(backendUrl + `/api/chat/conversations/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('Da xoa cuoc tro chuyen')
            if (activeConversationId === id) {
                setActiveConversationId(null)
                setMessages([])
            }
            fetchConversations()
        } catch (error) {
            console.log('Loi xoa cuoc tro chuyen:', error)
            toast.error('Khong the xoa cuoc tro chuyen')
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const renderMessageContent = (msg) => msg.noiDung

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
                    <p className="text-sm text-gray-700 mb-3">Gợi ý nhanh:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                        {quickPrompts.map((prompt) => (
                            <button
                                key={prompt.label}
                                type="button"
                                onClick={() => sendMessage(prompt.value)}
                                disabled={thinking}
                                className="border border-gray-200 rounded-xl px-4 py-4 text-left text-sm text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                <span className="inline-flex items-center gap-2">
                                    <span className="w-4 h-4 text-[#80001C] flex items-center justify-center">
                                        <SparkleIcon className="w-4 h-4" />
                                    </span>
                                    {prompt.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-5">
                    {/* Conversation sidebar */}
                    <div className={`${sidebarOpen ? 'col-span-12 md:col-span-3' : 'col-span-0 hidden'} transition-all`}>
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm h-[600px] flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="font-semibold text-gray-800">Cuộc trò chuyện</h3>
                                <button
                                    type="button"
                                    onClick={startNewConversation}
                                    className="text-xs px-3 py-1.5 rounded-lg bg-[#80001C] text-white hover:bg-[#6B0018]"
                                >
                                    + Mới
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2">
                                {conversations.length === 0 ? (
                                    <div className="text-sm text-gray-400 text-center mt-10">
                                        Chưa có cuộc trò chuyện nào
                                    </div>
                                ) : (
                                    conversations.map((c) => (
                                        <div
                                            key={c.id}
                                            onClick={() => setActiveConversationId(c.id)}
                                            className={`group flex items-start justify-between gap-2 px-3 py-2.5 mb-1 rounded-xl cursor-pointer transition-colors ${
                                                activeConversationId === c.id
                                                    ? 'bg-[#FCEEEF] text-[#7A1B2E]'
                                                    : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {c.tieuDe || 'Cuộc trò chuyện'}
                                                </p>
                                                {c.tinNhanMoiNhat && (
                                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                                        {c.tinNhanMoiNhat}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteConversation(c.id)
                                                }}
                                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                                                aria-label="Xoa cuoc tro chuyen"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 3h6a1 1 0 011 1v3H8V4a1 1 0 011-1z" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chat Box */}
                    <div className={`${sidebarOpen ? 'col-span-12 md:col-span-9' : 'col-span-12'} transition-all`}>
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm h-[600px] flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSidebarOpen(!sidebarOpen)}
                                        className="text-gray-500 hover:text-gray-700 p-1"
                                        aria-label="Toggle sidebar"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </button>
                                    <div className="w-8 h-8 rounded-xl bg-[#80001C] text-white flex items-center justify-center">
                                        <img
                                            className="w-4 h-4 brightness-0 invert"
                                            src={assets.icon_ai}
                                            alt=""
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Trợ lý AI</p>
                                        <p className="text-xs text-gray-500">SmartRental Assistant</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 p-5 overflow-y-auto">
                                {messages.length === 0 ? (
                                    <div className="h-full flex items-start justify-start pt-4">
                                        <div className="flex gap-2 max-w-[80%]">
                                            <div className="w-8 h-8 rounded-xl bg-[#80001C] text-white flex items-center justify-center flex-shrink-0">
                                                <img
                                                    className="w-4 h-4 brightness-0 invert"
                                                    src={assets.icon_ai}
                                                    alt=""
                                                />
                                            </div>

                                            <div>
                                                <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3">
                                                    <p className="text-sm text-gray-800">
                                                        Xin chào! Tôi là trợ lý AI của SmartRental. Tôi có thể giúp bạn truy vấn dữ liệu phòng trọ, khách thuê, hợp đồng, hóa đơn, doanh thu, cũng như hỗ trợ thêm phòng, thêm khách, tạo hợp đồng, tạo hóa đơn. Hãy cho tôi biết bạn cần gì.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((msg) => {
                                            const isUser = msg.vaiTro === 'USER'
                                            return (
                                                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`flex gap-2 max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
                                                        {!isUser && (
                                                            <div className="w-8 h-8 rounded-xl bg-[#80001C] text-white flex items-center justify-center flex-shrink-0">
                                                                <img
                                                                    className="w-4 h-4 brightness-0 invert"
                                                                    src={assets.icon_ai}
                                                                    alt=""
                                                                />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div
                                                                className={`rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap break-words ${
                                                                    isUser
                                                                        ? 'bg-[#80001C] text-white rounded-tr-md'
                                                                        : 'bg-gray-100 text-gray-800 rounded-tl-md'
                                                                }`}
                                                            >
                                                                {renderMessageContent(msg)}
                                                            </div>
                                                            {msg.ngayTao && (
                                                                <p className={`text-[11px] text-gray-400 mt-1 ${isUser ? 'text-right' : ''}`}>
                                                                    {formatTime(msg.ngayTao)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {thinking && (
                                            <div className="flex justify-start">
                                                <div className="flex gap-2 max-w-[80%]">
                                                    <div className="w-8 h-8 rounded-xl bg-[#80001C] text-white flex items-center justify-center flex-shrink-0">
                                                        <img
                                                            className="w-4 h-4 brightness-0 invert"
                                                            src={assets.icon_ai}
                                                            alt=""
                                                        />
                                                    </div>
                                                    <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>

                            {pendingConfirmation && (
                                <div className="border-t border-gray-200 bg-amber-50 px-5 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm text-amber-800">
                                            <strong>Yeu cau xac nhan:</strong> {pendingConfirmation.noiDung}
                                        </p>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleConfirm(false)}
                                                disabled={thinking}
                                                className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Huy
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleConfirm(true)}
                                                disabled={thinking}
                                                className="px-3 py-1.5 rounded-lg bg-[#80001C] text-white text-sm hover:bg-[#6B0018] disabled:opacity-50"
                                            >
                                                Xac nhan
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Input */}
                            <div className="border-t border-gray-200 p-4">
                                <div className="flex items-center gap-3">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Nhập yêu cầu của bạn..."
                                        disabled={thinking}
                                        className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none text-gray-700 placeholder-gray-400 disabled:opacity-60"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => sendMessage()}
                                        disabled={thinking || !message.trim()}
                                        aria-label="Gửi tin nhắn"
                                        className="w-10 h-10 rounded-xl bg-[#80001C] hover:bg-[#6B0018] text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <SendIcon />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chatbot
