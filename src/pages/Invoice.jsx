import React, { useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'

const initialInvoices = [
    { id: 1, code: 'INV001', tenant: 'Nguyễn Văn Tú', room: 'P101 - Nhà trọ Hoàng Long', month: '2026-06', rent: 3500000, electricStart: 1250, electricEnd: 1375, electricPrice: 3500, waterStart: 120, waterEnd: 128, waterPrice: 15000, services: [{ name: 'Internet', amount: 100000 }, { name: 'Vệ sinh', amount: 80000 }], dueDate: '2026-06-05', status: 'PAID' },
    { id: 2, code: 'INV002', tenant: 'Nguyễn Văn Tú', room: 'P101 - Nhà trọ Hoàng Long', month: '2026-06', rent: 3500000, electricStart: 1375, electricEnd: 1435, electricPrice: 3500, waterStart: 128, waterEnd: 134, waterPrice: 15000, services: [{ name: 'Internet', amount: 100000 }, { name: 'Vệ sinh', amount: 80000 }], dueDate: '2026-06-05', status: 'PAID' },
    { id: 3, code: 'INV003', tenant: 'Trần Thị Bích', room: 'P102 - Nhà trọ Hoàng Long', month: '2026-06', rent: 3500000, electricStart: 1000, electricEnd: 1080, electricPrice: 3500, waterStart: 90, waterEnd: 96, waterPrice: 15000, services: [{ name: 'Internet', amount: 100000 }, { name: 'Vệ sinh', amount: 80000 }], dueDate: '2026-06-05', status: 'UNPAID' },
    { id: 4, code: 'INV004', tenant: 'Lê Văn Cường', room: 'P201 - Nhà trọ Minh Anh', month: '2026-06', rent: 3800000, electricStart: 812, electricEnd: 877, electricPrice: 3500, waterStart: 45, waterEnd: 51, waterPrice: 15000, services: [{ name: 'Internet', amount: 100000 }], dueDate: '2026-06-05', status: 'UNPAID' },
    { id: 5, code: 'INV005', tenant: 'Phạm Văn D', room: 'P101 - Nhà trọ Hoàng Hà', month: '2026-06', rent: 3500000, electricStart: 620, electricEnd: 700, electricPrice: 3500, waterStart: 68, waterEnd: 75, waterPrice: 15000, services: [{ name: 'Internet', amount: 100000 }, { name: 'Vệ sinh', amount: 80000 }], dueDate: '2026-06-05', status: 'OVERDUE' },
    { id: 6, code: 'INV006', tenant: 'Hoàng Thị E', room: 'P102 - Nhà trọ Hoàng Hà', month: '2026-06', rent: 3500000, electricStart: 430, electricEnd: 492, electricPrice: 3500, waterStart: 38, waterEnd: 44, waterPrice: 15000, services: [{ name: 'Internet', amount: 100000 }, { name: 'Vệ sinh', amount: 80000 }], dueDate: '2026-06-05', status: 'OVERDUE' }
]

const emptyInvoice = {
    tenant: 'Nguyễn Văn Tú',
    room: 'P101 - Nhà trọ Hoàng Long',
    month: '',
    rent: 3500000,
    electricStart: '',
    electricEnd: '',
    electricPrice: 3500,
    waterStart: '',
    waterEnd: '',
    waterPrice: 15000,
    services: [{ name: 'Internet', amount: 100000 }, { name: 'Vệ sinh', amount: 80000 }],
    dueDate: '',
    status: 'UNPAID'
}

const rooms = [
    { room: 'P101 - Nhà trọ Hoàng Long', tenant: 'Nguyễn Văn Tú', rent: 3500000 },
    { room: 'P102 - Nhà trọ Hoàng Long', tenant: 'Trần Thị Bích', rent: 3500000 },
    { room: 'P201 - Nhà trọ Minh Anh', tenant: 'Lê Văn Cường', rent: 3800000 },
    { room: 'P101 - Nhà trọ Hoàng Hà', tenant: 'Phạm Văn D', rent: 3500000 },
    { room: 'P102 - Nhà trọ Hoàng Hà', tenant: 'Hoàng Thị E', rent: 3500000 }
]

const statusConfig = {
    PAID: { label: 'Đã thanh toán', pillClass: 'bg-green-50 text-green-600', dotClass: 'bg-green-500', statClass: 'bg-green-50 border-green-200 text-green-700', iconClass: 'bg-green-500' },
    UNPAID: { label: 'Chưa thanh toán', pillClass: 'bg-orange-50 text-orange-600', dotClass: 'bg-orange-500', statClass: 'bg-orange-50 border-orange-200 text-orange-700', iconClass: 'bg-orange-500' },
    OVERDUE: { label: 'Quá hạn', pillClass: 'bg-red-50 text-red-600', dotClass: 'bg-red-500', statClass: 'bg-red-50 border-red-200 text-red-700', iconClass: 'bg-red-500' }
}

const formatDate = (value) => {
    if (!value) return '-'
    const [year, month, day] = value.split('-')
    return `${day}/${month}/${year}`
}

const formatMonth = (value) => {
    if (!value) return '-'
    const [year, month] = value.split('-')
    return `${month}/${year}`
}

const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(Number(value || 0))
const formatMoney = (value) => `${formatNumber(value)} VNĐ`

const getInvoiceItems = (invoice) => {
    const electricityQuantity = Math.max(Number(invoice.electricEnd || 0) - Number(invoice.electricStart || 0), 0)
    const waterQuantity = Math.max(Number(invoice.waterEnd || 0) - Number(invoice.waterStart || 0), 0)

    return [
        { name: 'Tiền phòng', unit: 'Phòng', start: '', end: '', quantity: 1, price: Number(invoice.rent), amount: Number(invoice.rent) },
        { name: 'Tiền điện', unit: 'Số', start: invoice.electricStart, end: invoice.electricEnd, quantity: electricityQuantity, price: Number(invoice.electricPrice), amount: electricityQuantity * Number(invoice.electricPrice) },
        { name: 'Tiền nước', unit: 'm³', start: invoice.waterStart, end: invoice.waterEnd, quantity: waterQuantity, price: Number(invoice.waterPrice), amount: waterQuantity * Number(invoice.waterPrice) },
        ...invoice.services.map((service) => ({ name: service.name, unit: 'Phòng', start: '', end: '', quantity: 1, price: Number(service.amount), amount: Number(service.amount) }))
    ]
}

const getInvoiceTotal = (invoice) => getInvoiceItems(invoice).reduce((total, item) => total + item.amount, 0)

const ConfirmDialog = ({ title, message, onCancel, onConfirm }) => (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-gray-500">{message}</p>
            <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={onCancel} className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
                <button type="button" onClick={onConfirm} className="rounded-xl bg-[#80001C] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#6B0018]">Xác nhận</button>
            </div>
        </div>
    </div>
)

const InvoicePreview = ({ invoice, onClose, onMarkPaid }) => {
    const items = getInvoiceItems(invoice)
    const total = getInvoiceTotal(invoice)

    return (
        <div className="fixed inset-0 z-[60] bg-gray-200">
            <div className="flex h-14 items-center justify-between bg-[#1F2937] px-8 text-white">
                <button type="button" onClick={onClose} className="flex items-center gap-2 text-sm">
                    <span className="text-xl">←</span>
                    Quay lại
                </button>
                <div className="flex items-center gap-3">
                    {invoice.status !== 'PAID' && (
                        <button type="button" onClick={onMarkPaid} className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium hover:bg-green-700">
                            Đánh dấu đã thanh toán (tiền mặt)
                        </button>
                    )}
                    <button type="button" onClick={() => toast.info('Tính năng tải xuống sẽ được nối backend sau')} className="flex items-center gap-2 rounded-xl bg-[#80001C] px-4 py-2 text-sm font-medium hover:bg-[#6B0018]">
                        <img src={assets.icon_download} alt="" className="h-4 w-4 brightness-0 invert" />
                        Tải xuống hóa đơn
                    </button>
                </div>
            </div>

            <div className="h-[calc(100vh-56px)] overflow-auto py-10">
                <div className="mx-auto min-h-[1120px] w-[820px] bg-white px-12 py-12 shadow-2xl">
                    <div className="text-center">
                        <div className="mb-4 inline-flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#80001C]"><img src={assets.logo} alt="" className="h-6 w-6" /></span>
                            <span className="text-xl font-bold text-[#80001C]">SmartRental</span>
                        </div>
                        <p className="text-sm text-gray-400">Hệ thống quản lý nhà trọ thông minh</p>
                        <h1 className="mt-8 text-3xl font-bold uppercase tracking-wide text-gray-900">Hóa đơn tiền thuê</h1>
                        <p className="mt-2 text-lg font-bold text-[#80001C]">#{invoice.code}</p>
                        <div className="mt-6 h-0.5 bg-[#80001C]" />
                    </div>

                    <div className="mt-8 flex justify-end">
                        <span className={`rounded-full border px-5 py-2 text-sm font-bold ${invoice.status === 'PAID' ? 'border-green-600 text-green-600' : invoice.status === 'OVERDUE' ? 'border-red-600 text-red-600' : 'border-orange-600 text-orange-600'}`}>
                            {statusConfig[invoice.status].label.toUpperCase()}
                        </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-5 rounded-2xl border border-gray-100 bg-gray-50 p-6">
                        <div>
                            <p className="text-xs font-semibold uppercase text-gray-400">Khách thuê</p>
                            <p className="mt-2 font-bold text-gray-900">{invoice.tenant}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase text-gray-400">Ngày lập hóa đơn</p>
                            <p className="mt-2 font-bold text-gray-900">13/06/2026</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase text-gray-400">Phòng</p>
                            <p className="mt-2 font-bold text-gray-900">{invoice.room}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase text-gray-400">Hạn thanh toán</p>
                            <p className="mt-2 font-bold text-gray-900">{formatDate(invoice.dueDate)}</p>
                        </div>
                    </div>

                    <table className="mt-8 w-full">
                        <thead>
                            <tr className="bg-[#80001C] text-white">
                                <th className="px-3 py-4 text-left text-sm">STT</th>
                                <th className="px-3 py-4 text-left text-sm">Danh mục</th>
                                <th className="px-3 py-4 text-center text-sm">Đơn vị</th>
                                <th className="px-3 py-4 text-center text-sm">Chỉ số đầu</th>
                                <th className="px-3 py-4 text-center text-sm">Chỉ số cuối</th>
                                <th className="px-3 py-4 text-center text-sm">Số lượng</th>
                                <th className="px-3 py-4 text-right text-sm">Đơn giá</th>
                                <th className="px-3 py-4 text-right text-sm">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((item, index) => (
                                <tr key={`${item.name}-${index}`}>
                                    <td className="px-3 py-4 text-sm">{index + 1}</td>
                                    <td className="px-3 py-4 text-sm text-gray-500">{item.name}</td>
                                    <td className="px-3 py-4 text-center text-sm text-gray-500">{item.unit}</td>
                                    <td className="px-3 py-4 text-center text-sm text-gray-500">{item.start}</td>
                                    <td className="px-3 py-4 text-center text-sm text-gray-500">{item.end}</td>
                                    <td className="px-3 py-4 text-center text-sm text-gray-500">{item.quantity}</td>
                                    <td className="px-3 py-4 text-right text-sm text-gray-500">{formatNumber(item.price)}</td>
                                    <td className="px-3 py-4 text-right text-sm font-semibold text-gray-900">{formatMoney(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-4 grid grid-cols-[1fr_240px] bg-red-50 px-8 py-6">
                        <p className="text-lg font-bold text-gray-900">TỔNG CỘNG</p>
                        <p className="text-right text-lg font-bold text-[#80001C]">{formatMoney(total)}</p>
                    </div>

                    <div className="mt-20 grid grid-cols-2 gap-20 text-center text-sm text-gray-400">
                        <div><p>Chữ ký khách thuê</p><div className="mx-auto mt-10 h-px w-40 bg-gray-300" /></div>
                        <div><p>Chữ ký ban quản lý</p><div className="mx-auto mt-10 h-px w-40 bg-gray-300" /></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Invoice = () => {
    const [invoices, setInvoices] = useState(initialInvoices)
    const [keyword, setKeyword] = useState('')
    const [status, setStatus] = useState('ALL')
    const [showForm, setShowForm] = useState(false)
    const [editingInvoice, setEditingInvoice] = useState(null)
    const [previewInvoice, setPreviewInvoice] = useState(null)
    const [deletingInvoice, setDeletingInvoice] = useState(null)
    const [formData, setFormData] = useState(emptyInvoice)

    const filteredInvoices = useMemo(() => {
        const search = keyword.trim().toLowerCase()

        return invoices.filter((invoice) => {
            const matchesSearch = !search || [invoice.code, invoice.tenant, invoice.room].some((value) => value.toLowerCase().includes(search))
            const matchesStatus = status === 'ALL' || invoice.status === status
            return matchesSearch && matchesStatus
        })
    }, [keyword, status, invoices])

    const countByStatus = (value) => invoices.filter((invoice) => invoice.status === value).length
    const revenue = invoices.filter((invoice) => invoice.status === 'PAID').reduce((total, invoice) => total + getInvoiceTotal(invoice), 0)

    const openCreateModal = () => {
        setEditingInvoice(null)
        setFormData(emptyInvoice)
        setShowForm(true)
    }

    const openEditModal = (invoice) => {
        setEditingInvoice(invoice)
        setFormData({
            ...invoice,
            rent: String(invoice.rent),
            electricStart: String(invoice.electricStart),
            electricEnd: String(invoice.electricEnd),
            electricPrice: String(invoice.electricPrice),
            waterStart: String(invoice.waterStart),
            waterEnd: String(invoice.waterEnd),
            waterPrice: String(invoice.waterPrice),
            services: invoice.services.map((service) => ({ ...service, amount: String(service.amount) }))
        })
        setShowForm(true)
    }

    const handleRoomChange = (roomValue) => {
        const selectedRoom = rooms.find((item) => item.room === roomValue)
        setFormData((prev) => ({
            ...prev,
            room: roomValue,
            tenant: selectedRoom?.tenant || prev.tenant,
            rent: selectedRoom?.rent || prev.rent
        }))
    }

    const updateService = (index, field, value) => {
        setFormData((prev) => ({
            ...prev,
            services: prev.services.map((service, currentIndex) =>
                currentIndex === index ? { ...service, [field]: value } : service
            )
        }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        const payload = {
            ...formData,
            rent: Number(formData.rent),
            electricStart: Number(formData.electricStart),
            electricEnd: Number(formData.electricEnd),
            electricPrice: Number(formData.electricPrice),
            waterStart: Number(formData.waterStart),
            waterEnd: Number(formData.waterEnd),
            waterPrice: Number(formData.waterPrice),
            services: formData.services.map((service) => ({ ...service, amount: Number(service.amount) }))
        }

        if (editingInvoice) {
            setInvoices((prev) => prev.map((invoice) => (invoice.id === editingInvoice.id ? { ...payload, id: editingInvoice.id, code: editingInvoice.code } : invoice)))
            toast.success('Cập nhật hóa đơn thành công')
        } else {
            const nextCode = `INV${String(invoices.length + 1).padStart(3, '0')}`
            setInvoices((prev) => [{ ...payload, id: Date.now(), code: nextCode }, ...prev])
            toast.success('Tạo hóa đơn thành công')
        }

        setShowForm(false)
    }

    const markPaid = (invoice) => {
        setInvoices((prev) => prev.map((item) => (item.id === invoice.id ? { ...item, status: 'PAID' } : item)))
        setPreviewInvoice({ ...invoice, status: 'PAID' })
        toast.success('Đã đánh dấu hóa đơn đã thanh toán')
    }

    const confirmDelete = () => {
        setInvoices((prev) => prev.filter((invoice) => invoice.id !== deletingInvoice.id))
        setDeletingInvoice(null)
        toast.success('Xóa hóa đơn thành công')
    }

    const formTotal = getInvoiceTotal({
        ...formData,
        rent: Number(formData.rent),
        electricStart: Number(formData.electricStart),
        electricEnd: Number(formData.electricEnd),
        electricPrice: Number(formData.electricPrice),
        waterStart: Number(formData.waterStart),
        waterEnd: Number(formData.waterEnd),
        waterPrice: Number(formData.waterPrice),
        services: formData.services.map((service) => ({ ...service, amount: Number(service.amount) }))
    })

    return (
        <div className="min-h-screen bg-[#F6F7FB]">
            <Sidebar />
            <Header title="Quản lý hóa đơn" />

            <div className="ml-[220px] px-5 pb-5 pt-[80px]">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Quản lý hóa đơn</h1>
                        <p className="mt-1 text-sm text-gray-500">Quản lý hóa đơn thu tiền phòng và dịch vụ hằng tháng</p>
                    </div>
                    <button type="button" onClick={openCreateModal} className="flex items-center gap-2 rounded-xl bg-[#80001C] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6B0018]">
                        <span className="text-lg">+</span>
                        Tạo hóa đơn
                    </button>
                </div>

                <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {Object.entries(statusConfig).map(([key, config]) => (
                        <div key={key} className={`rounded-2xl border p-5 shadow-sm ${config.statClass}`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">{config.label}</p>
                                    <p className="mt-2 text-3xl font-bold">{countByStatus(key)}</p>
                                </div>
                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.iconClass}`}>
                                    <img src={assets.icon_invoice} alt="" className="h-6 w-6 brightness-0 invert" />
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-700 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Doanh thu</p>
                                <p className="mt-2 text-2xl font-bold">{formatNumber(revenue)}đ</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
                                <img src={assets.icon_hoadonthanhtoan} alt="" className="h-6 w-6 brightness-0 invert" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-xl bg-gray-100 px-3 py-2.5">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm kiếm hóa đơn, khách thuê..." className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400" />
                        </div>
                        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl bg-gray-100 px-3 py-2.5 text-sm text-gray-700 outline-none">
                            <option value="ALL">Tất cả trạng thái</option>
                            {Object.entries(statusConfig).map(([key, config]) => <option key={key} value={key}>{config.label}</option>)}
                        </select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1240px]">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Mã hóa đơn</th>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Phòng</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Tiền phòng</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Tiền điện</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Tiền nước</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Dịch vụ</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Tổng tiền</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Hạn thanh toán</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Trạng thái</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredInvoices.map((invoice) => {
                                    const items = getInvoiceItems(invoice)
                                    const electricity = items.find((item) => item.name === 'Tiền điện')?.amount || 0
                                    const water = items.find((item) => item.name === 'Tiền nước')?.amount || 0
                                    const services = invoice.services.reduce((total, service) => total + Number(service.amount), 0)

                                    return (
                                        <tr key={invoice.id} className="transition-colors hover:bg-gray-50/70">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF2F4]">
                                                        <img className="h-4 w-4" src={assets.icon_invoice} alt="" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{invoice.code}</p>
                                                        <p className="text-xs text-gray-600">{invoice.tenant}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-700">{invoice.room}</td>
                                            <td className="px-5 py-4 text-center text-sm text-gray-700">{formatNumber(invoice.rent)}</td>
                                            <td className="px-5 py-4 text-center text-sm text-gray-700">{formatNumber(electricity)}</td>
                                            <td className="px-5 py-4 text-center text-sm text-gray-700">{formatNumber(water)}</td>
                                            <td className="px-5 py-4 text-center text-sm text-gray-700">{formatNumber(services)}</td>
                                            <td className="px-5 py-4 text-center text-base text-gray-900">{formatMoney(getInvoiceTotal(invoice))}</td>
                                            <td className="px-5 py-4 text-center text-sm text-gray-700">{formatDate(invoice.dueDate)}</td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusConfig[invoice.status].pillClass}`}>
                                                    <span className={`h-2 w-2 rounded-full ${statusConfig[invoice.status].dotClass}`} />
                                                    {statusConfig[invoice.status].label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button type="button" onClick={() => setPreviewInvoice(invoice)} className="hover:opacity-70" aria-label="Xem hóa đơn"><img className="h-4 w-4" src={assets.icon_xemchitiet} alt="" /></button>
                                                    <button type="button" onClick={() => openEditModal(invoice)} className="hover:opacity-70" aria-label="Sửa hóa đơn"><img className="h-4 w-4" src={assets.icon_sua} alt="" /></button>
                                                    <button type="button" onClick={() => setDeletingInvoice(invoice)} className="hover:opacity-70" aria-label="Xóa hóa đơn"><img className="h-4 w-4" src={assets.icon_xoa} alt="" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900">{editingInvoice ? 'Chỉnh sửa hóa đơn' : 'Thêm hóa đơn mới'}</h3>
                            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-1.5 hover:bg-gray-100">
                                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 p-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-gray-700">Phòng *</span>
                                    <select value={formData.room} onChange={(event) => handleRoomChange(event.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]">
                                        {rooms.map((item) => <option key={item.room}>{item.room}</option>)}
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-gray-700">Tháng *</span>
                                    <input type="month" value={formData.month} onChange={(event) => setFormData({ ...formData, month: event.target.value })} required className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" />
                                </label>
                            </div>

                            <div className="rounded-2xl border border-gray-100 p-4">
                                <h4 className="mb-3 font-bold text-gray-900">Tiền điện</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <input type="number" min={0} value={formData.electricStart} onChange={(event) => setFormData({ ...formData, electricStart: event.target.value })} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none" placeholder="Chỉ số đầu kỳ" />
                                    <input type="number" min={0} value={formData.electricEnd} onChange={(event) => setFormData({ ...formData, electricEnd: event.target.value })} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none" placeholder="Chỉ số cuối kỳ" />
                                    <input type="number" min={0} value={formData.electricPrice} onChange={(event) => setFormData({ ...formData, electricPrice: event.target.value })} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none" placeholder="Đơn giá" />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 p-4">
                                <h4 className="mb-3 font-bold text-gray-900">Tiền nước</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <input type="number" min={0} value={formData.waterStart} onChange={(event) => setFormData({ ...formData, waterStart: event.target.value })} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none" placeholder="Chỉ số đầu kỳ" />
                                    <input type="number" min={0} value={formData.waterEnd} onChange={(event) => setFormData({ ...formData, waterEnd: event.target.value })} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none" placeholder="Chỉ số cuối kỳ" />
                                    <input type="number" min={0} value={formData.waterPrice} onChange={(event) => setFormData({ ...formData, waterPrice: event.target.value })} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none" placeholder="Đơn giá" />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 p-4">
                                <h4 className="mb-3 font-bold text-gray-900">Dịch vụ</h4>
                                <div className="divide-y divide-gray-100">
                                    <div className="flex items-center justify-between py-2 text-sm">
                                        <span>Tiền thuê phòng</span>
                                        <span className="font-semibold">{formatMoney(formData.rent)}</span>
                                    </div>
                                    {formData.services.map((service, index) => (
                                        <div key={service.name} className="grid grid-cols-[1fr_140px] gap-3 py-2">
                                            <input value={service.name} onChange={(event) => updateService(index, 'name', event.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none" />
                                            <input type="number" min={0} value={service.amount} onChange={(event) => updateService(index, 'amount', event.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-gray-700">Hạn thanh toán *</span>
                                <input type="date" value={formData.dueDate} onChange={(event) => setFormData({ ...formData, dueDate: event.target.value })} required className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" />
                            </label>

                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-gray-700">Trạng thái</span>
                                <select value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]">
                                    {Object.entries(statusConfig).map(([key, config]) => <option key={key} value={key}>{config.label}</option>)}
                                </select>
                            </label>

                            <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4">
                                <span className="font-bold text-gray-900">Tổng cộng</span>
                                <span className="text-lg font-bold text-[#80001C]">{formatMoney(formTotal)}</span>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
                                <button type="submit" className="flex-1 rounded-xl bg-[#80001C] py-2.5 text-sm font-medium text-white hover:bg-[#6B0018]">{editingInvoice ? 'Cập nhật' : 'Thêm mới'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {previewInvoice && (
                <InvoicePreview
                    invoice={previewInvoice}
                    onClose={() => setPreviewInvoice(null)}
                    onMarkPaid={() => markPaid(previewInvoice)}
                />
            )}

            {deletingInvoice && (
                <ConfirmDialog
                    title="Xác nhận xóa hóa đơn"
                    message={`Bạn có chắc chắn muốn xóa hóa đơn ${deletingInvoice.code}? Hành động này không thể hoàn tác.`}
                    onCancel={() => setDeletingInvoice(null)}
                    onConfirm={confirmDelete}
                />
            )}
        </div>
    )
}

export default Invoice
