import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const tabs = [
    { key: 'payment', label: 'Thanh toán', icon: 'card' },
    { key: 'invoice', label: 'Hóa đơn', icon: 'calendar' },
    { key: 'email', label: 'Mẫu email', icon: 'mail' }
]

const paymentMethods = [
    {
        name: 'Thanh toán tiền mặt',
        description: 'Thu tiền trực tiếp tại chỗ',
        tone: 'green',
        enabled: true
    },
    {
        name: 'Ví MoMo',
        description: 'Chưa kết nối',
        tone: 'pink',
        enabled: false
    },
    {
        name: 'VNPay QR',
        description: 'Chưa kết nối',
        tone: 'red',
        enabled: false
    }
]

const invoiceRules = [
    {
        title: 'Tự động tạo hóa đơn hàng tháng',
        description: 'Hệ thống sẽ tự động tạo hóa đơn vào ngày 1 mỗi tháng',
        enabled: true
    },
    {
        title: 'Tự động gửi email thông báo quá hạn',
        description: 'Gửi mỗi 5 ngày khi quá hạn, đến khi thanh toán xong',
        enabled: true
    },
    {
        title: 'Tự động gửi email xác nhận thanh toán',
        description: 'Gửi ngay sau khi hệ thống ghi nhận thanh toán',
        enabled: true
    },
    {
        title: 'Tự động gửi email nhắc thanh toán',
        description: 'Gửi 3 ngày trước hạn, lúc 8:00 sáng',
        enabled: true
    }
]

const emailTemplates = [
    {
        title: 'Nhắc nhở thanh toán',
        tone: 'blue',
        subject: 'Nhắc nhở: Hóa đơn tháng {month} sắp đến hạn',
        content: `Kính gửi {tenant_name},

Hóa đơn tháng {month} của bạn tại phòng {room}, {property} sẽ đến hạn thanh toán vào ngày {due_date}.

Số tiền cần thanh toán: {amount} VNĐ

Vui lòng thanh toán đúng hạn để tránh phát sinh phí trễ hạn.

Trân trọng,
Ban quản lý {property}`
    },
    {
        title: 'Thông báo quá hạn',
        tone: 'red',
        subject: 'THÔNG BÁO: Hóa đơn tháng {month} đã quá hạn',
        content: `Kính gửi {tenant_name},

Hóa đơn tháng {month} tại phòng {room}, {property} đã quá hạn thanh toán {overdue_days} ngày.

Số tiền còn nợ: {amount} VNĐ
Phí phạt trễ hạn: {late_fee} VNĐ
Tổng cần thanh toán: {total_amount} VNĐ

Vui lòng liên hệ ban quản lý ngay để giải quyết.

Trân trọng,
Ban quản lý {property}`
    },
    {
        title: 'Xác nhận thanh toán',
        tone: 'green',
        subject: 'Xác nhận: Đã nhận thanh toán hóa đơn tháng {month}',
        content: `Kính gửi {tenant_name},

Chúng tôi xác nhận đã nhận thanh toán hóa đơn tháng {month} cho phòng {room}, {property}.

Số tiền đã thanh toán: {amount} VNĐ
Phương thức: {payment_method}
Ngày thanh toán: {payment_date}

Cảm ơn bạn đã thanh toán đúng hạn!

Trân trọng,
Ban quản lý {property}`
    },
    {
        title: 'Hết hạn hợp đồng',
        tone: 'orange',
        subject: 'Thông báo: Hợp đồng thuê phòng sắp hết hạn',
        content: `Kính gửi {tenant_name},

Hợp đồng thuê phòng {room} tại {property} của bạn sẽ hết hạn vào ngày {contract_end_date}.

Nếu muốn gia hạn, vui lòng liên hệ ban quản lý trước ngày {renewal_deadline}.

Trân trọng,
Ban quản lý {property}`
    }
]

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

const Toggle = ({ enabled = true }) => (
    <button
        type="button"
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

const StatusBadge = ({ children }) => (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-100 text-green-600 text-xs font-medium">
        {children}
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

const PaymentTab = () => (
    <>
        <section className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Phương thức thanh toán</h2>
            <p className="text-sm text-gray-500 mt-4">Bật/tắt và cấu hình thông tin tài khoản cho từng phương thức.</p>
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="space-y-3 mb-6">
                {paymentMethods.map((method) => (
                    <div key={method.name} className="bg-gray-50 rounded-xl px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <SettingIcon tone={method.tone} icon="card" />
                            <div>
                                <p className="font-medium text-gray-900">{method.name}</p>
                                {method.enabled ? (
                                    <p className="text-sm text-gray-500">{method.description}</p>
                                ) : (
                                    <span className="inline-flex mt-1 px-2 py-0.5 rounded-md bg-gray-200 text-xs text-gray-700">
                                        {method.description}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Toggle enabled={method.enabled} />
                    </div>
                ))}
            </div>

        </section>
    </>
)

const InvoiceTab = () => (
    <>
        <section className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900">Cấu hình hóa đơn</h2>
                <p className="text-sm text-gray-500 mt-2">Tùy chỉnh nội dung các email tự động gửi cho khách thuê.</p>
            </div>
            <button type="button" className="h-10 px-5 rounded-xl bg-[#80001C] hover:bg-[#6B0018] text-white text-sm font-medium flex items-center gap-2 transition-colors">
                <Icon name="save" className="w-4 h-4" />
                Lưu cấu hình
            </button>
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-5">
            <div className="flex items-center gap-3 mb-10">
                <SettingIcon tone="maroon" icon="bell" />
                <h3 className="text-lg font-bold text-gray-900">Quy tắc hóa đơn & thanh toán</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ReadonlyInput
                    label="Hạn thanh toán mặc định (Ngày)"
                    value="2"
                    helper="Số ngày trong tháng làm hạn thanh toán"
                />
                <ReadonlyInput
                    label="Phí phạt trễ hạn (%)"
                    value="10"
                    helper="Phần trăm phí phạt trên tổng hóa đơn"
                />
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
                        <Toggle enabled={rule.enabled} />
                    </div>
                ))}
            </div>
        </section>
    </>
)

const EmailTab = () => (
    <>
        <section className="mb-5">
            <h2 className="text-xl font-bold text-gray-900">Mẫu email thông báo</h2>
            <p className="text-sm text-gray-500 mt-2">Tùy chỉnh nội dung các email tự động gửi cho khách thuê.</p>
        </section>

        <section className="space-y-5">
            {emailTemplates.map((template) => (
                <div key={template.title} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <SettingIcon tone={template.tone} icon="mail" />
                            <div>
                                <h3 className="font-bold text-gray-900">{template.title}</h3>
                                <div className="mt-1">
                                    <StatusBadge>Đang bật</StatusBadge>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-[#80001C]">
                            <button type="button" aria-label="Sửa mẫu email">
                                <Icon name="edit" className="w-4 h-4" />
                            </button>
                            <Toggle enabled />
                        </div>
                    </div>

                    <div className="p-5 space-y-4">
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Tiêu đề email</p>
                            <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700">
                                {template.subject}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Nội dung email</p>
                            <pre className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap font-sans leading-7">
                                {template.content}
                            </pre>
                        </div>
                    </div>
                </div>
            ))}

            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                <p className="text-sm font-semibold text-red-600 mb-4">Biến có thể dùng:</p>
                <p className="text-sm text-gray-600">
                    {'{tenant_name}, {room}, {property}, {month}, {amount}, {due_date}, {overdue_days}, {late_fee}, {payment_method}, {payment_date}, {contract_end_date}'}
                </p>
            </div>
        </section>
    </>
)

const Setting = () => {
    const [activeTab, setActiveTab] = useState('payment')

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

                {activeTab === 'payment' && <PaymentTab />}
                {activeTab === 'invoice' && <InvoiceTab />}
                {activeTab === 'email' && <EmailTab />}
            </main>
        </div>
    )
}

export default Setting
