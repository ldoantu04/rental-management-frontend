import React, { useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'

const initialContracts = [
    { id: 1, code: 'HD001', tenant: 'Nguyễn Văn A', room: 'P101 - Nhà trọ Hoàng Long', startDate: '2026-01-01', endDate: '2026-12-31', deposit: 7000000, rent: 3500000, paymentDay: 5, status: 'ACTIVE', services: ['Điện', 'Nước', 'Internet'], terms: '- Thanh toán đầy đủ trước ngày thanh toán hằng tháng\n- Không được nuôi thú cưng\n- Giữ gìn vệ sinh chung' },
    { id: 2, code: 'HD002', tenant: 'Trần Thị B', room: 'P102 - Nhà trọ Hoàng Long', startDate: '2026-01-01', endDate: '2026-12-31', deposit: 7000000, rent: 3500000, paymentDay: 5, status: 'ACTIVE', services: ['Điện', 'Nước', 'Internet'], terms: '- Thanh toán đầy đủ trước ngày thanh toán hằng tháng' },
    { id: 3, code: 'HD003', tenant: 'Lê Văn C', room: 'P201 - Nhà trọ Minh Anh', startDate: '2026-01-01', endDate: '2026-06-30', deposit: 7000000, rent: 3800000, paymentDay: 5, status: 'EXPIRING', services: ['Điện', 'Nước', 'Internet', 'Vệ sinh'], terms: '- Gia hạn hợp đồng trước 15 ngày' },
    { id: 4, code: 'HD004', tenant: 'Phạm Văn D', room: 'P101 - Nhà trọ Hoàng Hà', startDate: '2026-01-01', endDate: '2026-12-31', deposit: 7000000, rent: 3500000, paymentDay: 5, status: 'ACTIVE', services: ['Điện', 'Nước'], terms: '- Thanh toán đúng hạn' },
    { id: 5, code: 'HD005', tenant: 'Hoàng Thị E', room: 'P102 - Nhà trọ Hoàng Hà', startDate: '2026-01-01', endDate: '2026-05-31', deposit: 7000000, rent: 3500000, paymentDay: 5, status: 'EXPIRED', services: ['Điện', 'Nước', 'Internet'], terms: '- Hợp đồng đã hết hạn' },
    { id: 6, code: 'HD006', tenant: 'Võ Văn F', room: 'P201 - Nhà trọ Minh Khánh', startDate: '2026-01-01', endDate: '2026-06-30', deposit: 7000000, rent: 3800000, paymentDay: 5, status: 'EXPIRING', services: ['Điện', 'Nước'], terms: '- Gia hạn hợp đồng trước 15 ngày' },
    { id: 7, code: 'HD007', tenant: 'Nguyễn Văn G', room: 'P301 - Nhà trọ Minh Khánh', startDate: '2026-01-01', endDate: '2026-12-31', deposit: 7000000, rent: 4000000, paymentDay: 5, status: 'CANCELLED', services: ['Điện', 'Nước'], terms: '- Hợp đồng đã hủy' }
]

const tenants = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Văn D', 'Hoàng Thị E', 'Võ Văn F']
const rooms = ['P101 - Nhà trọ Hoàng Long', 'P102 - Nhà trọ Hoàng Long', 'P201 - Nhà trọ Minh Anh', 'P101 - Nhà trọ Hoàng Hà', 'P102 - Nhà trọ Hoàng Hà', 'P201 - Nhà trọ Minh Khánh']

const serviceCatalog = [
    { name: 'Điện', type: 'Theo kWh', price: 3500 },
    { name: 'Nước', type: 'Theo số người', price: 15000 },
    { name: 'Internet', type: 'Theo phòng', price: 100000 },
    { name: 'Vệ sinh', type: 'Theo phòng', price: 80000 },
    { name: 'Máy giặt', type: 'Theo phòng', price: 20000 },
    { name: 'Thang máy', type: 'Theo phòng', price: 50000 },
    { name: 'Gửi xe', type: 'Theo phòng', price: 100000 }
]

const emptyContract = {
    tenant: 'Nguyễn Văn A',
    room: 'P101 - Nhà trọ Hoàng Long',
    startDate: '',
    endDate: '',
    deposit: '',
    rent: '',
    paymentDay: 5,
    status: 'ACTIVE',
    services: ['Điện', 'Nước', 'Internet'],
    terms: '- Thanh toán đầy đủ trước ngày thanh toán hằng tháng\n- Không được nuôi thú cưng\n- Giữ gìn vệ sinh chung'
}

const statusConfig = {
    ACTIVE: { label: 'Đang hiệu lực', pillClass: 'bg-green-50 text-green-600', dotClass: 'bg-green-500', statClass: 'bg-green-50 border-green-200 text-green-700', iconClass: 'bg-green-500' },
    EXPIRING: { label: 'Sắp hết hạn', pillClass: 'bg-orange-50 text-orange-600', dotClass: 'bg-orange-500', statClass: 'bg-orange-50 border-orange-200 text-orange-700', iconClass: 'bg-orange-500' },
    EXPIRED: { label: 'Đã hết hạn', pillClass: 'bg-red-50 text-red-600', dotClass: 'bg-red-50', statClass: 'bg-red-50 border-red-200 text-red-700', iconClass: 'bg-red-500' },
    CANCELLED: { label: 'Đã hủy', pillClass: 'bg-gray-100 text-gray-600', dotClass: 'bg-gray-500', statClass: 'bg-white border-gray-200 text-gray-700', iconClass: 'bg-gray-700' }
}

const formatDate = (value) => {
    if (!value) return '-'
    const [year, month, day] = value.split('-')
    return `${day}/${month}/${year}`
}

const formatMoney = (value) => new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + ' VNĐ'

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

const ContractPreview = ({ contract, onClose }) => (
    <div className="fixed inset-0 z-[60] bg-gray-200">
        <div className="flex h-14 items-center justify-between bg-[#1F2937] px-8 text-white">
            <button type="button" onClick={onClose} className="flex items-center gap-2 text-sm">
                <span className="text-xl">←</span>
                Quay lại
            </button>
            <button type="button" onClick={() => toast.info('Tính năng tải xuống sẽ được nối backend sau')} className="flex items-center gap-2 rounded-xl bg-[#80001C] px-4 py-2 text-sm font-medium hover:bg-[#6B0018]">
                <img src={assets.icon_download} alt="" className="h-4 w-4 brightness-0 invert" />
                Tải xuống hợp đồng
            </button>
        </div>

        <div className="h-[calc(100vh-56px)] overflow-auto py-10">
            <div className="mx-auto min-h-[1120px] w-[820px] bg-white px-12 py-12 shadow-2xl">
                <div className="text-center">
                    <div className="mb-4 inline-flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#80001C]">
                            <img src={assets.logo} alt="" className="h-6 w-6" />
                        </span>
                        <span className="text-xl font-bold text-[#80001C]">SmartRental</span>
                    </div>
                    <p className="text-sm text-gray-400">Hệ thống quản lý nhà trọ thông minh</p>
                    <h1 className="mt-8 text-3xl font-bold tracking-wide text-gray-900">Hợp đồng thuê nhà</h1>
                    <p className="mt-2 text-lg font-bold text-[#80001C]">#{contract.code}</p>
                    <div className="mt-6 h-0.5 bg-[#80001C]" />
                </div>

                <div className="mt-10 grid grid-cols-2 gap-5 rounded-2xl border border-gray-100 bg-gray-50 p-6">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">Khách thuê</p>
                        <p className="mt-2 font-bold text-gray-900">{contract.tenant}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">Phòng</p>
                        <p className="mt-2 font-bold text-gray-900">{contract.room}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">Thời hạn</p>
                        <p className="mt-2 font-bold text-gray-900">{formatDate(contract.startDate)} - {formatDate(contract.endDate)}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-400">Thanh toán hàng tháng</p>
                        <p className="mt-2 font-bold text-gray-900">Ngày {contract.paymentDay}</p>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-5">
                    <div className="rounded-2xl border border-gray-100 p-5">
                        <p className="text-sm text-gray-500">Tiền thuê hàng tháng</p>
                        <p className="mt-2 text-xl font-bold text-gray-900">{formatMoney(contract.rent)}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 p-5">
                        <p className="text-sm text-gray-500">Tiền cọc</p>
                        <p className="mt-2 text-xl font-bold text-gray-900">{formatMoney(contract.deposit)}</p>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="mb-3 text-lg font-bold text-gray-900">Dịch vụ áp dụng</h2>
                    <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
                        {serviceCatalog.filter((service) => contract.services.includes(service.name)).map((service) => (
                            <div key={service.name} className="grid grid-cols-3 px-5 py-3 text-sm">
                                <span className="font-medium text-gray-900">{service.name}</span>
                                <span className="text-gray-500">{service.type}</span>
                                <span className="text-right font-semibold text-gray-900">{formatMoney(service.price)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="mb-3 text-lg font-bold text-gray-900">Điều khoản hợp đồng</h2>
                    <pre className="rounded-2xl border border-gray-100 bg-gray-50 p-5 font-sans text-sm leading-7 text-gray-700 whitespace-pre-wrap">{contract.terms}</pre>
                </div>

                <div className="mt-24 grid grid-cols-2 gap-20 text-center text-sm text-gray-400">
                    <div>
                        <p>Chữ ký khách thuê</p>
                        <div className="mx-auto mt-10 h-px w-40 bg-gray-300" />
                    </div>
                    <div>
                        <p>Chữ ký ban quản lý</p>
                        <div className="mx-auto mt-10 h-px w-40 bg-gray-300" />
                    </div>
                </div>
            </div>
        </div>
    </div>
)

const Contract = () => {
    const [contracts, setContracts] = useState(initialContracts)
    const [keyword, setKeyword] = useState('')
    const [status, setStatus] = useState('ALL')
    const [showForm, setShowForm] = useState(false)
    const [editingContract, setEditingContract] = useState(null)
    const [previewContract, setPreviewContract] = useState(null)
    const [deletingContract, setDeletingContract] = useState(null)
    const [formData, setFormData] = useState(emptyContract)

    const filteredContracts = useMemo(() => {
        const search = keyword.trim().toLowerCase()

        return contracts.filter((contract) => {
            const matchesSearch = !search || [contract.code, contract.tenant, contract.room].some((value) => value.toLowerCase().includes(search))
            const matchesStatus = status === 'ALL' || contract.status === status
            return matchesSearch && matchesStatus
        })
    }, [keyword, status, contracts])

    const countByStatus = (value) => contracts.filter((contract) => contract.status === value).length

    const openCreateModal = () => {
        setEditingContract(null)
        setFormData(emptyContract)
        setShowForm(true)
    }

    const openEditModal = (contract) => {
        setEditingContract(contract)
        setFormData({ ...contract, deposit: String(contract.deposit), rent: String(contract.rent) })
        setShowForm(true)
    }

    const toggleService = (serviceName) => {
        setFormData((prev) => ({
            ...prev,
            services: prev.services.includes(serviceName)
                ? prev.services.filter((service) => service !== serviceName)
                : [...prev.services, serviceName]
        }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        const payload = {
            ...formData,
            deposit: Number(formData.deposit),
            rent: Number(formData.rent),
            paymentDay: Number(formData.paymentDay)
        }

        if (editingContract) {
            setContracts((prev) => prev.map((contract) => (contract.id === editingContract.id ? { ...payload, id: editingContract.id, code: editingContract.code } : contract)))
            toast.success('Cập nhật hợp đồng thành công')
        } else {
            const nextCode = `HD${String(contracts.length + 1).padStart(3, '0')}`
            setContracts((prev) => [{ ...payload, id: Date.now(), code: nextCode }, ...prev])
            toast.success('Tạo hợp đồng thành công')
        }

        setShowForm(false)
    }

    const confirmDelete = () => {
        setContracts((prev) => prev.filter((contract) => contract.id !== deletingContract.id))
        setDeletingContract(null)
        toast.success('Xóa hợp đồng thành công')
    }

    return (
        <div className="min-h-screen bg-[#F6F7FB]">
            <Sidebar />
            <Header title="Quản lý hợp đồng" />

            <div className="ml-[220px] px-5 pb-5 pt-[80px]">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Quản lý hợp đồng</h1>
                        <p className="mt-1 text-sm text-gray-500">Quản lý hợp đồng thuê phòng và theo dõi thời hạn</p>
                    </div>

                    <button type="button" onClick={openCreateModal} className="flex items-center gap-2 rounded-xl bg-[#80001C] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6B0018]">
                        <span className="text-lg">+</span>
                        Tạo hợp đồng
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
                                    <img src={key === 'EXPIRING' ? assets.icon_hopdonghethan : assets.icon_contract} alt="" className="h-6 w-6 brightness-0 invert" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="flex items-center gap-3 rounded-xl bg-gray-100 px-3 py-2.5">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm kiếm hợp đồng, khách thuê..." className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400" />
                        </div>
                        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl bg-gray-100 px-3 py-2.5 text-sm text-gray-700 outline-none">
                            <option value="ALL">Tất cả trạng thái</option>
                            {Object.entries(statusConfig).map(([key, config]) => <option key={key} value={key}>{config.label}</option>)}
                        </select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1160px]">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Mã HĐ</th>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Khách thuê</th>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Phòng</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Ngày bắt đầu</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Ngày kết thúc</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Tiền cọc</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Trạng thái</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredContracts.map((contract) => (
                                    <tr key={contract.id} className="transition-colors hover:bg-gray-50/70">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF2F4]">
                                                    <img className="h-4 w-4" src={assets.icon_contract} alt="" />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">{contract.code}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{contract.tenant}</td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{contract.room}</td>
                                        <td className="px-5 py-4 text-center text-sm text-gray-700">{formatDate(contract.startDate)}</td>
                                        <td className="px-5 py-4 text-center text-sm text-gray-700">{formatDate(contract.endDate)}</td>
                                        <td className="px-5 py-4 text-center text-sm text-gray-700">{formatMoney(contract.deposit)}</td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusConfig[contract.status].pillClass}`}>
                                                <span className={`h-2 w-2 rounded-full ${statusConfig[contract.status].dotClass}`} />
                                                {statusConfig[contract.status].label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-3">
                                                <button type="button" onClick={() => setPreviewContract(contract)} className="hover:opacity-70" aria-label="Xem hợp đồng">
                                                    <img className="h-4 w-4" src={assets.icon_xemchitiet} alt="" />
                                                </button>
                                                <button type="button" onClick={() => openEditModal(contract)} className="hover:opacity-70" aria-label="Sửa hợp đồng">
                                                    <img className="h-4 w-4" src={assets.icon_sua} alt="" />
                                                </button>
                                                <button type="button" onClick={() => setDeletingContract(contract)} className="hover:opacity-70" aria-label="Xóa hợp đồng">
                                                    <img className="h-4 w-4" src={assets.icon_xoa} alt="" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900">{editingContract ? 'Chỉnh sửa hợp đồng' : 'Tạo hợp đồng mới'}</h3>
                            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-1.5 hover:bg-gray-100">
                                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 p-6">
                            <div>
                                <p className="mb-3 text-sm font-bold uppercase text-gray-400">Thông tin hợp đồng</p>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Khách thuê *</span>
                                        <select value={formData.tenant} onChange={(event) => setFormData({ ...formData, tenant: event.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]">
                                            {tenants.map((tenant) => <option key={tenant}>{tenant}</option>)}
                                        </select>
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Phòng *</span>
                                        <select value={formData.room} onChange={(event) => setFormData({ ...formData, room: event.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]">
                                            {rooms.map((room) => <option key={room}>{room}</option>)}
                                        </select>
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Ngày bắt đầu</span>
                                        <input type="date" value={formData.startDate} onChange={(event) => setFormData({ ...formData, startDate: event.target.value })} required className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Ngày kết thúc</span>
                                        <input type="date" value={formData.endDate} onChange={(event) => setFormData({ ...formData, endDate: event.target.value })} required className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Tiền cọc (VNĐ)</span>
                                        <input type="number" min={0} value={formData.deposit} onChange={(event) => setFormData({ ...formData, deposit: event.target.value })} required className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" placeholder="7000000" />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Ngày thanh toán hàng tháng</span>
                                        <input type="number" min={1} max={31} value={formData.paymentDay} onChange={(event) => setFormData({ ...formData, paymentDay: event.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" />
                                    </label>
                                    <label className="block md:col-span-2">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Tiền thuê hàng tháng (VNĐ)</span>
                                        <input type="number" min={0} value={formData.rent} onChange={(event) => setFormData({ ...formData, rent: event.target.value })} required className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" placeholder="3500000" />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <p className="mb-3 text-sm font-bold uppercase text-gray-400">Dịch vụ áp dụng</p>
                                <div className="overflow-hidden rounded-2xl border border-gray-200">
                                    <div className="grid grid-cols-[56px_1fr_1fr_1fr] bg-gray-50 px-4 py-3 text-sm font-medium text-gray-500">
                                        <span />
                                        <span>Dịch vụ</span>
                                        <span>Kiểu tính</span>
                                        <span className="text-right">Đơn giá</span>
                                    </div>
                                    {serviceCatalog.map((service) => (
                                        <label key={service.name} className={`grid grid-cols-[56px_1fr_1fr_1fr] items-center px-4 py-3 text-sm ${formData.services.includes(service.name) ? 'text-gray-900' : 'text-gray-400'}`}>
                                            <input type="checkbox" checked={formData.services.includes(service.name)} onChange={() => toggleService(service.name)} className="h-4 w-4 accent-[#80001C]" />
                                            <span>{service.name}</span>
                                            <span>{service.type}</span>
                                            <span className="text-right">{formatMoney(service.price)}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-gray-700">Trạng thái</span>
                                <select value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]">
                                    {Object.entries(statusConfig).map(([key, config]) => <option key={key} value={key}>{config.label}</option>)}
                                </select>
                            </label>

                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-gray-700">Điều khoản hợp đồng</span>
                                <textarea rows={4} value={formData.terms} onChange={(event) => setFormData({ ...formData, terms: event.target.value })} className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" />
                            </label>

                            <div className="flex gap-3 border-t border-gray-100 pt-4">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
                                <button type="submit" className="flex-1 rounded-xl bg-[#80001C] py-2.5 text-sm font-medium text-white hover:bg-[#6B0018]">{editingContract ? 'Cập nhật' : 'Thêm mới'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {previewContract && <ContractPreview contract={previewContract} onClose={() => setPreviewContract(null)} />}

            {deletingContract && (
                <ConfirmDialog
                    title="Xác nhận xóa hợp đồng"
                    message={`Bạn có chắc chắn muốn xóa hợp đồng ${deletingContract.code}? Hành động này không thể hoàn tác.`}
                    onCancel={() => setDeletingContract(null)}
                    onConfirm={confirmDelete}
                />
            )}
        </div>
    )
}

export default Contract
