import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import axios from 'axios'
import { toast } from 'react-toastify'

const tabs = [
    { key: 'invoice', label: 'Hóa đơn', icon: 'calendar' },
    { key: 'email', label: 'Mẫu email', icon: 'mail' }
]


const toneMap = {
    'NHAC_THANH_TOAN': 'blue',
    'QUA_HAN': 'red',
    'XAC_NHAN_TT': 'green',
    'HET_HAN_HD': 'orange'
}

const iconColor = {
    green: 'bg-green-100 text-green-600',
    pink: 'bg-pink-100 text-pink-600',
    red: 'bg-red-100 text-red-500',
    blue: 'bg-blue-100 text-blue-500',
    orange: 'bg-orange-100 text-orange-500',
    maroon: 'bg-[#FDF2F4] text-[#80001C]'
}

const Icon = ({ name, className = 'w-5 h-5' }) => {
    const commonProps = {
        className,
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
    }

    const paths = {
        card: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18v10H3V7zm3 4h4" />,
        calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3v3m8-3v3M4 9h16M5 5h14a1 1 0 011 1v14H4V6a1 1 0 011-1z" />,
        mail: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16v12H4V6zm0 0l8 7 8-7" />,
        bell: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 01-6 0" />,
        save: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 4h12l2 2v14H5V4zm3 0v6h8V4M8 20v-6h8v6" />,
        edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.4-9.4a2 2 0 112.8 2.8L11.8 15H9v-2.8l8.6-8.6z" />,
        link: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 13a5 5 0 007 0l2-2a5 5 0 10-7-7l-1 1m3 6a5 5 0 00-7 0l-2 2a5 5 0 107 7l1-1" />
    }

    return <svg {...commonProps}>{paths[name]}</svg>
}

const Toggle = ({ enabled, onChange }) => (
    <button
        type="button"
        onClick={onChange}
        className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors ${
            enabled ? 'bg-[#80001C] justify-end' : 'bg-gray-900 justify-start'
        }`}
        aria-label="Bật tắt"
    >
        <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
    </button>
)

const SettingIcon = ({ tone = 'maroon', icon = 'card' }) => (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconColor[tone]}`}>
        <Icon name={icon} />
    </div>
)

const StatusBadge = ({ enabled }) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
        enabled ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
    }`}>
        {enabled ? 'Đang bật' : 'Đang tắt'}
    </span>
)

const ReadonlyInput = ({ label, value, helper, placeholder }) => (
    <label className="block">
        <span className="block text-sm font-medium text-gray-900 mb-1">{label}</span>
        <input
            type="text"
            readOnly
            value={value || ''}
            placeholder={placeholder}
            className="w-full h-11 rounded-xl bg-gray-100 px-4 text-sm text-gray-900 placeholder-gray-400 outline-none"
        />
        {helper && <span className="block text-xs text-gray-400 mt-1">{helper}</span>}
    </label>
)

const InvoiceTab = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [defaultDueDay, setDefaultDueDay] = useState('')
    const [latePenaltyPercent, setLatePenaltyPercent] = useState('')
    const [autoSendOverdueEmail, setAutoSendOverdueEmail] = useState(false)
    const [autoSendPaymentConfirmationEmail, setAutoSendPaymentConfirmationEmail] = useState(false)
    const [autoSendPaymentReminderEmail, setAutoSendPaymentReminderEmail] = useState(false)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${backendUrl}/api/invoice-settings`)
            const data = res.data
            setDefaultDueDay(data.defaultDueDay != null ? String(data.defaultDueDay) : '')
            setLatePenaltyPercent(data.latePenaltyPercent != null ? String(data.latePenaltyPercent) : '')
            setAutoSendOverdueEmail(data.autoSendOverdueEmail || false)
            setAutoSendPaymentConfirmationEmail(data.autoSendPaymentConfirmationEmail || false)
            setAutoSendPaymentReminderEmail(data.autoSendPaymentReminderEmail || false)
        } catch (err) {
            console.error('Lỗi khi tải cấu hình:', err)
            toast.error('Không thể tải cấu hình hóa đơn')
        } finally {
            setLoading(false)
        }
    }, [backendUrl])

    useEffect(() => {
        fetchSettings()
    }, [fetchSettings])

    const saveSettings = async () => {
        if (defaultDueDay && (isNaN(Number(defaultDueDay)) || Number(defaultDueDay) < 1 || Number(defaultDueDay) > 31)) {
            toast.error('Hạn thanh toán phải từ 1 đến 31')
            return
        }
        if (latePenaltyPercent && (isNaN(Number(latePenaltyPercent)) || Number(latePenaltyPercent) < 0 || Number(latePenaltyPercent) > 100)) {
            toast.error('Phí phạt phải từ 0 đến 100')
            return
        }
        try {
            setSaving(true)
            await axios.put(`${backendUrl}/api/invoice-settings`, {
                defaultDueDay: defaultDueDay ? Number(defaultDueDay) : null,
                latePenaltyPercent: latePenaltyPercent ? Number(latePenaltyPercent) : null,
                autoSendOverdueEmail,
                autoSendPaymentConfirmationEmail,
                autoSendPaymentReminderEmail
            })
            toast.success('Lưu cấu hình thành công')
        } catch (err) {
            console.error('Lỗi khi lưu cấu hình:', err)
            toast.error('Lưu cấu hình thất bại')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <span className="text-gray-500">Đang tải...</span>
            </div>
        )
    }

    const invoiceRules = [
        {
            title: 'Tự động gửi email thông báo quá hạn',
            description: 'Gửi mỗi 5 ngày khi quá hạn, đến khi thanh toán xong',
            value: autoSendOverdueEmail,
            onChange: (val) => { setAutoSendOverdueEmail(val); saveSettings(); }
        },
        {
            title: 'Tự động gửi email xác nhận thanh toán',
            description: 'Gửi ngay sau khi hệ thống ghi nhận thanh toán',
            value: autoSendPaymentConfirmationEmail,
            onChange: (val) => { setAutoSendPaymentConfirmationEmail(val); saveSettings(); }
        },
        {
            title: 'Tự động gửi email nhắc thanh toán',
            description: 'Gửi 3 ngày trước hạn, lúc 8:00 sáng',
            value: autoSendPaymentReminderEmail,
            onChange: (val) => { setAutoSendPaymentReminderEmail(val); saveSettings(); }
        }
    ]

    return (
        <>
            <section className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Cấu hình hóa đơn</h2>
                    <p className="text-sm text-gray-500 mt-2">Tùy chỉnh nội dung các email tự động gửi cho khách thuê.</p>
                </div>
                <button
                    type="button"
                    onClick={saveSettings}
                    disabled={saving}
                    className="h-10 px-5 rounded-xl bg-[#80001C] hover:bg-[#6B0018] text-white text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? (
                        <span>Đang lưu...</span>
                    ) : (
                        <>
                            <Icon name="save" className="w-4 h-4" />
                            Lưu cấu hình
                        </>
                    )}
                </button>
            </section>

            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-5">
                <div className="flex items-center gap-3 mb-10">
                    <SettingIcon tone="maroon" icon="bell" />
                    <h3 className="text-lg font-bold text-gray-900">Quy tắc hóa đơn & thanh toán</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <label className="block">
                        <span className="block text-sm font-medium text-gray-900 mb-1">Hạn thanh toán mặc định (Ngày)</span>
                        <input
                            type="number"
                            min="1"
                            max="31"
                            value={defaultDueDay}
                            onChange={e => setDefaultDueDay(e.target.value)}
                            className="w-full h-11 rounded-xl bg-blue-50 px-4 text-sm text-gray-900 outline-none border border-blue-200"
                        />
                        <span className="block text-xs text-gray-400 mt-1">Số ngày trong tháng làm hạn thanh toán</span>
                    </label>
                    <label className="block">
                        <span className="block text-sm font-medium text-gray-900 mb-1">Phí phạt trễ hạn (%)</span>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={latePenaltyPercent}
                            onChange={e => setLatePenaltyPercent(e.target.value)}
                            className="w-full h-11 rounded-xl bg-blue-50 px-4 text-sm text-gray-900 outline-none border border-blue-200"
                        />
                        <span className="block text-xs text-gray-400 mt-1">Phần trăm phí phạt trên tổng hóa đơn</span>
                    </label>
                </div>
            </section>

            <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-10">Tự động gửi email thông báo</h3>
                <div className="space-y-3">
                    {invoiceRules.map((rule) => (
                        <div key={rule.title} className="bg-gray-50 rounded-xl px-4 py-4 flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">{rule.title}</p>
                                <p className="text-sm text-gray-500 mt-1">{rule.description}</p>
                            </div>
                            <Toggle
                                enabled={rule.value}
                                onChange={() => rule.onChange(!rule.value)}
                            />
                        </div>
                    ))}
                </div>
            </section>
        </>
    )
}

const EmailTab = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [templates, setTemplates] = useState([])
    const [editingId, setEditingId] = useState(null)
    const [editData, setEditData] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchTemplates = useCallback(async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${backendUrl}/api/email-templates`)
            setTemplates(res.data)
            setError(null)
        } catch (err) {
            console.error('Lỗi khi tải mẫu email:', err)
            setError('Không thể tải danh sách mẫu email')
        } finally {
            setLoading(false)
        }
    }, [backendUrl])

    useEffect(() => {
        fetchTemplates()
    }, [fetchTemplates])

    const handleEditClick = (template) => {
        setEditingId(template.id)
        setEditData({ tieuDe: template.tieuDe, noiDung: template.noiDung })
    }

    const handleSaveClick = async (id) => {
        if (!editData.tieuDe || !editData.tieuDe.trim()) {
            toast.error('Tiêu đề không được để trống')
            return
        }
        if (!editData.noiDung || !editData.noiDung.trim()) {
            toast.error('Nội dung không được để trống')
            return
        }
        try {
            const res = await axios.put(`${backendUrl}/api/email-templates/${id}`, {
                tieuDe: editData.tieuDe.trim(),
                noiDung: editData.noiDung.trim()
            })
            setTemplates(prev => prev.map(t => t.id === id ? res.data : t))
            setEditingId(null)
            setEditData({})
        } catch (err) {
            console.error('Lỗi khi lưu mẫu email:', err)
            toast.error('Không thể lưu mẫu email. Vui lòng thử lại.')
        }
    }

    const handleCancelClick = () => {
        setEditingId(null)
        setEditData({})
    }

    const handleToggle = async (template) => {
        try {
            const res = await axios.patch(
                `${backendUrl}/api/email-templates/${template.id}/enabled`,
                null,
                { params: { enabled: !template.batBuoc } }
            )
            setTemplates(prev => prev.map(t => t.id === template.id ? res.data : t))
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái:', err)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <span className="text-gray-500">Đang tải...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-20">
                <span className="text-red-500">{error}</span>
            </div>
        )
    }

    return (
        <>
            <section className="mb-5">
                <h2 className="text-xl font-bold text-gray-900">Mẫu email thông báo</h2>
                <p className="text-sm text-gray-500 mt-2">Tùy chỉnh nội dung các email tự động gửi cho khách thuê.</p>
            </section>

            <section className="space-y-5">
                {templates.map((template) => {
                    const isEditing = editingId === template.id
                    const tone = toneMap[template.maMau] || 'blue'

                    return (
                        <div key={template.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100 flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <SettingIcon tone={tone} icon="mail" />
                                    <div>
                                        <h3 className="font-bold text-gray-900">{template.tenMau}</h3>
                                        <div className="mt-1">
                                            <StatusBadge enabled={template.batBuoc} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-[#80001C]">
                                    <button
                                        type="button"
                                        onClick={() => isEditing ? handleSaveClick(template.id) : handleEditClick(template)}
                                        aria-label={isEditing ? 'Lưu mẫu email' : 'Sửa mẫu email'}
                                    >
                                        <Icon name={isEditing ? 'save' : 'edit'} className="w-4 h-4" />
                                    </button>
                                    <Toggle
                                        enabled={template.batBuoc}
                                        onChange={() => handleToggle(template)}
                                    />
                                </div>
                            </div>

                            <div className="p-5 space-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Tiêu đề email</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.tieuDe}
                                            onChange={e => setEditData(d => ({ ...d, tieuDe: e.target.value }))}
                                            className="w-full h-11 rounded-xl bg-blue-50 px-4 text-sm text-gray-900 outline-none border border-blue-200"
                                        />
                                    ) : (
                                        <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700">
                                            {template.tieuDe}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Nội dung email</p>
                                    {isEditing ? (
                                        <textarea
                                            value={editData.noiDung}
                                            onChange={e => setEditData(d => ({ ...d, noiDung: e.target.value }))}
                                            rows={10}
                                            className="w-full rounded-xl bg-blue-50 px-4 py-3 text-sm text-gray-900 outline-none border border-blue-200 resize-y"
                                        />
                                    ) : (
                                        <pre className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap font-sans leading-7">
                                            {template.noiDung}
                                        </pre>
                                    )}
                                </div>
                                {isEditing && (
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleCancelClick}
                                            className="h-9 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium mr-2 transition-colors"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSaveClick(template.id)}
                                            className="h-9 px-5 rounded-xl bg-[#80001C] hover:bg-[#6B0018] text-white text-sm font-medium transition-colors"
                                        >
                                            Lưu
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}

                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                    <p className="text-sm font-semibold text-red-600 mb-4">Biến có thể dùng:</p>
                    <p className="text-sm text-gray-600">
                        {'{tenant_name}, {room}, {property}, {month}, {amount}, {due_date}, {overdue_days}, {late_fee}, {payment_method}, {payment_date}, {contract_end_date}, {invoice_code}, {invoice_url}, {payment_url}'}
                    </p>
                </div>
            </section>
        </>
    )
}

const Setting = () => {
    const [activeTab, setActiveTab] = useState('invoice')

    return (
        <div className="min-h-screen bg-[#F6F7FB]">
            <Sidebar />
            <Header title="Cài đặt" />

            <main className="ml-[220px] pt-[80px] px-5 pb-5">
                <section className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Cài đặt hệ thống</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Cấu hình phương thức thanh toán, hóa đơn, mẫu email thông báo và AI
                    </p>
                </section>

                <div className="flex items-center gap-3 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`h-10 px-5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${
                                activeTab === tab.key
                                    ? 'bg-[#80001C] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-white'
                            }`}
                        >
                            <Icon name={tab.icon} className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'invoice' && <InvoiceTab />}
                {activeTab === 'email' && <EmailTab />}
            </main>
        </div>
    )
}

export default Setting
