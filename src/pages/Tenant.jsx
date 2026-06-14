import React, { useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'

const initialTenants = [
    {
        id: 1,
        name: 'Nguyễn Văn An',
        birthDate: '1998-04-12',
        cccd: '001234567890',
        phone: '0912345678',
        email: 'nguyenvanan@email.com',
        room: 'P101 - Nhà trọ Hoàng Long',
        startDate: '2026-01-01',
        deposit: 7000000,
        roommates: [{ name: 'Nguyễn Thị B', relation: 'Vợ', cccd: '001234567899' }],
        documents: '',
        status: 'RENTING'
    },
    {
        id: 2,
        name: 'Trần Thị Bích',
        birthDate: '1999-08-20',
        cccd: '001234567891',
        phone: '0912345679',
        email: 'bich.tt@email.com',
        room: 'P102 - Nhà trọ Hoàng Long',
        startDate: '2026-01-01',
        deposit: 7000000,
        roommates: [{ name: 'Trần Văn Bình', relation: 'Em', cccd: '001234567898' }],
        documents: '',
        status: 'RENTING'
    },
    {
        id: 3,
        name: 'Lê Văn Cường',
        birthDate: '1997-03-02',
        cccd: '001234567892',
        phone: '0912345680',
        email: 'cuong.lv@email.com',
        room: 'P201 - Nhà trọ Minh Anh',
        startDate: '2026-02-01',
        deposit: 7600000,
        roommates: [
            { name: 'Lê Thị Hạnh', relation: 'Chị', cccd: '001234567897' },
            { name: 'Lê Văn Minh', relation: 'Bạn', cccd: '001234567896' }
        ],
        documents: '',
        status: 'RENTING'
    },
    {
        id: 4,
        name: 'Phạm Thị Dung',
        birthDate: '2000-11-09',
        cccd: '001234567893',
        phone: '0912345681',
        email: 'dung.pt@email.com',
        room: 'P101 - Nhà trọ Hoàng Hà',
        startDate: '2026-02-15',
        deposit: 7000000,
        roommates: [{ name: 'Phạm Văn Duy', relation: 'Anh', cccd: '001234567895' }],
        documents: '',
        status: 'RENTING'
    },
    {
        id: 5,
        name: 'Hoàng Thị Em',
        birthDate: '1996-06-18',
        cccd: '001234567894',
        phone: '0912345682',
        email: 'em.ht@email.com',
        room: 'P102 - Nhà trọ Hoàng Hà',
        startDate: '2026-03-01',
        deposit: 7000000,
        roommates: [{ name: 'Hoàng Văn Khoa', relation: 'Chồng', cccd: '001234567894' }],
        documents: '',
        status: 'RENTING'
    },
    {
        id: 6,
        name: 'Võ Văn F',
        birthDate: '1995-12-04',
        cccd: '001234567895',
        phone: '0912345683',
        email: 'f.vv@email.com',
        room: 'P201 - Nhà trọ Minh Khánh',
        startDate: '2026-03-01',
        deposit: 7600000,
        roommates: [{ name: 'Võ Thị G', relation: 'Em', cccd: '001234567893' }],
        documents: '',
        status: 'UNPAID'
    }
]

const emptyTenant = {
    name: '',
    birthDate: '',
    cccd: '',
    phone: '',
    email: '',
    room: 'P101 - Nhà trọ Hoàng Long',
    startDate: '',
    deposit: '',
    roommates: [{ name: '', relation: '', cccd: '' }],
    documents: '',
    status: 'RENTING'
}

const rooms = [
    'P101 - Nhà trọ Hoàng Long',
    'P102 - Nhà trọ Hoàng Long',
    'P201 - Nhà trọ Minh Anh',
    'P101 - Nhà trọ Hoàng Hà',
    'P102 - Nhà trọ Hoàng Hà',
    'P201 - Nhà trọ Minh Khánh'
]

const statusConfig = {
    RENTING: {
        label: 'Đang thuê',
        pillClass: 'bg-green-50 text-green-600',
        dotClass: 'bg-green-500'
    },
    UNPAID: {
        label: 'Chưa thanh toán',
        pillClass: 'bg-red-50 text-red-600',
        dotClass: 'bg-red-500'
    }
}

const formatDate = (value) => {
    if (!value) return '-'
    const [year, month, day] = value.split('-')
    return `${day}/${month}/${year}`
}

const formatMoney = (value) => new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + ' VNĐ'

const ConfirmDialog = ({ title, message, onCancel, onConfirm }) => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-gray-500">{message}</p>
            <div className="mt-6 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Hủy
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    className="rounded-xl bg-[#80001C] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#6B0018]"
                >
                    Xác nhận
                </button>
            </div>
        </div>
    </div>
)

const Tenant = () => {
    const [tenants, setTenants] = useState(initialTenants)
    const [keyword, setKeyword] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingTenant, setEditingTenant] = useState(null)
    const [detailTenant, setDetailTenant] = useState(null)
    const [deletingTenant, setDeletingTenant] = useState(null)
    const [formData, setFormData] = useState(emptyTenant)

    const filteredTenants = useMemo(() => {
        const search = keyword.trim().toLowerCase()
        if (!search) return tenants

        return tenants.filter((tenant) =>
            [tenant.name, tenant.cccd, tenant.phone, tenant.room].some((value) =>
                value.toLowerCase().includes(search)
            )
        )
    }, [keyword, tenants])

    const rentingCount = tenants.filter((tenant) => tenant.status === 'RENTING').length
    const unpaidCount = tenants.filter((tenant) => tenant.status === 'UNPAID').length

    const openCreateModal = () => {
        setEditingTenant(null)
        setFormData(emptyTenant)
        setShowForm(true)
    }

    const openEditModal = (tenant) => {
        setEditingTenant(tenant)
        setFormData({
            ...tenant,
            deposit: String(tenant.deposit),
            roommates: tenant.roommates.length ? tenant.roommates : [{ name: '', relation: '', cccd: '' }]
        })
        setShowForm(true)
    }

    const updateRoommate = (index, field, value) => {
        setFormData((prev) => ({
            ...prev,
            roommates: prev.roommates.map((roommate, currentIndex) =>
                currentIndex === index ? { ...roommate, [field]: value } : roommate
            )
        }))
    }

    const addRoommate = () => {
        setFormData((prev) => ({
            ...prev,
            roommates: [...prev.roommates, { name: '', relation: '', cccd: '' }]
        }))
    }

    const removeRoommate = (index) => {
        setFormData((prev) => ({
            ...prev,
            roommates: prev.roommates.filter((_, currentIndex) => currentIndex !== index)
        }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        const payload = {
            ...formData,
            deposit: Number(formData.deposit),
            roommates: formData.roommates.filter((roommate) => roommate.name || roommate.relation || roommate.cccd)
        }

        if (editingTenant) {
            setTenants((prev) =>
                prev.map((tenant) => (tenant.id === editingTenant.id ? { ...payload, id: editingTenant.id } : tenant))
            )
            toast.success('Cập nhật khách thuê thành công')
        } else {
            setTenants((prev) => [{ ...payload, id: Date.now() }, ...prev])
            toast.success('Thêm khách thuê thành công')
        }

        setShowForm(false)
    }

    const confirmDelete = () => {
        setTenants((prev) => prev.filter((tenant) => tenant.id !== deletingTenant.id))
        setDeletingTenant(null)
        toast.success('Xóa khách thuê thành công')
    }

    return (
        <div className="min-h-screen bg-[#F6F7FB]">
            <Sidebar />
            <Header title="Quản lý khách thuê" />

            <div className="ml-[220px] pt-[80px] px-5 pb-5">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Quản lý khách thuê</h1>
                        <p className="mt-1 text-sm text-gray-500">Quản lý thông tin khách thuê và lịch sử thuê phòng</p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="flex items-center gap-2 rounded-xl bg-[#80001C] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6B0018]"
                    >
                        <span className="text-lg">+</span>
                        Thêm khách thuê
                    </button>
                </div>

                <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-[#80001C] shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Tổng khách thuê</p>
                                <p className="mt-2 text-3xl font-bold">{tenants.length}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#80001C]">
                                <img src={assets.icon_tenant} alt="" className="h-6 w-6 brightness-0 invert" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-green-700 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Đang thuê</p>
                                <p className="mt-2 text-3xl font-bold">{rentingCount}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
                                <img src={assets.icon_tenant} alt="" className="h-6 w-6 brightness-0 invert" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Chưa thanh toán</p>
                                <p className="mt-2 text-3xl font-bold">{unpaidCount}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500">
                                <img src={assets.icon_tenant} alt="" className="h-6 w-6 brightness-0 invert" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3 rounded-xl bg-gray-100 px-3 py-2.5">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                            placeholder="Tìm theo tên, CCCD hoặc số điện thoại..."
                            className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400"
                        />
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1120px]">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Họ và tên</th>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Số CCCD</th>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Số điện thoại</th>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Phòng thuê</th>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Ngày thuê</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Người ở cùng</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Trạng thái</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredTenants.map((tenant) => (
                                    <tr key={tenant.id} className="transition-colors hover:bg-gray-50/70">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF2F4]">
                                                    <img className="h-4 w-4" src={assets.icon_tenant} alt="" />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">{tenant.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{tenant.cccd}</td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{tenant.phone}</td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{tenant.room}</td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{formatDate(tenant.startDate)}</td>
                                        <td className="px-5 py-4 text-center text-sm text-gray-700">{tenant.roommates.length}</td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusConfig[tenant.status].pillClass}`}>
                                                <span className={`h-2 w-2 rounded-full ${statusConfig[tenant.status].dotClass}`} />
                                                {statusConfig[tenant.status].label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-3">
                                                <button type="button" onClick={() => setDetailTenant(tenant)} className="hover:opacity-70" aria-label="Xem chi tiết khách thuê">
                                                    <img className="h-4 w-4" src={assets.icon_xemchitiet} alt="" />
                                                </button>
                                                <button type="button" onClick={() => openEditModal(tenant)} className="hover:opacity-70" aria-label="Sửa khách thuê">
                                                    <img className="h-4 w-4" src={assets.icon_sua} alt="" />
                                                </button>
                                                <button type="button" onClick={() => setDeletingTenant(tenant)} className="hover:opacity-70" aria-label="Xóa khách thuê">
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
                            <h3 className="text-lg font-bold text-gray-900">{editingTenant ? 'Chỉnh sửa khách thuê' : 'Tạo khách thuê mới'}</h3>
                            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-1.5 transition-colors hover:bg-gray-100">
                                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5 p-6">
                            <div>
                                <p className="mb-3 text-sm font-bold uppercase text-gray-400">Thông tin khách thuê</p>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Họ và tên *</span>
                                        <input required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" placeholder="Nguyễn Văn A" />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Ngày sinh</span>
                                        <input type="date" value={formData.birthDate} onChange={(event) => setFormData({ ...formData, birthDate: event.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Số CCCD *</span>
                                        <input required value={formData.cccd} onChange={(event) => setFormData({ ...formData, cccd: event.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" placeholder="033333333333" />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Số điện thoại</span>
                                        <input value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" placeholder="0123454523" />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Email</span>
                                        <input type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" placeholder="email@gmail.com" />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Tiền cọc (VNĐ)</span>
                                        <input type="number" min={0} value={formData.deposit} onChange={(event) => setFormData({ ...formData, deposit: event.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" placeholder="7000000" />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-sm font-bold uppercase text-gray-400">Người ở cùng</p>
                                    <button type="button" onClick={addRoommate} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-[#80001C]">
                                        Thêm người ở cùng
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {formData.roommates.map((roommate, index) => (
                                        <div key={index} className="rounded-xl bg-gray-50 p-3">
                                            <div className="mb-2 flex items-center justify-between">
                                                <p className="text-xs font-semibold uppercase text-gray-500">Người ở cùng #{index + 1}</p>
                                                {formData.roommates.length > 1 && (
                                                    <button type="button" onClick={() => removeRoommate(index)} className="flex h-7 w-7 items-center justify-center rounded-full border border-red-200 bg-white text-[#80001C] transition-colors hover:bg-red-50" aria-label="Xóa người ở cùng">
                                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                                <label className="block">
                                                    <span className="mb-1 block text-xs font-medium text-gray-500">Họ và tên</span>
                                                    <input value={roommate.name} onChange={(event) => updateRoommate(index, 'name', event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none" placeholder="Họ và tên" />
                                                </label>
                                                <label className="block">
                                                    <span className="mb-1 block text-xs font-medium text-gray-500">Quan hệ</span>
                                                    <input value={roommate.relation} onChange={(event) => updateRoommate(index, 'relation', event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none" placeholder="Quan hệ" />
                                                </label>
                                                <label className="block">
                                                    <span className="mb-1 block text-xs font-medium text-gray-500">Số CCCD</span>
                                                    <input value={roommate.cccd} onChange={(event) => updateRoommate(index, 'cccd', event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none" placeholder="Số CCCD" />
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-gray-700">Ảnh giấy tờ</span>
                                <input type="file" multiple onChange={(event) => setFormData({ ...formData, documents: Array.from(event.target.files).map((file) => file.name).join(', ') })} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-700" />
                            </label>

                            <div className="flex gap-3 border-t border-gray-100 pt-4">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Hủy
                                </button>
                                <button type="submit" className="flex-1 rounded-xl bg-[#80001C] py-2.5 text-sm font-medium text-white hover:bg-[#6B0018]">
                                    {editingTenant ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {detailTenant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-5">
                            <h3 className="text-lg font-bold text-gray-900">Chi tiết khách thuê</h3>
                            <button type="button" onClick={() => setDetailTenant(null)} className="rounded-lg p-1.5 hover:bg-gray-100">
                                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#80001C] text-xl font-bold text-white">{detailTenant.name.charAt(0)}</div>
                                <div>
                                    <p className="text-lg font-bold text-gray-900">{detailTenant.name}</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-700">{detailTenant.room}</span>
                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusConfig[detailTenant.status].pillClass}`}>{statusConfig[detailTenant.status].label}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                            {[
                                ['Số CCCD', detailTenant.cccd],
                                ['Số điện thoại', detailTenant.phone],
                                ['Email', detailTenant.email],
                                ['Ngày bắt đầu thuê', formatDate(detailTenant.startDate)],
                                ['Ngày sinh', formatDate(detailTenant.birthDate)],
                                ['Tiền cọc', formatMoney(detailTenant.deposit)]
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-xl bg-gray-50 p-4">
                                    <p className="text-xs font-medium text-gray-400">{label}</p>
                                    <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5">
                            <p className="mb-3 text-sm font-bold uppercase text-gray-400">Người ở cùng ({detailTenant.roommates.length})</p>
                            <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                                <div className="grid grid-cols-3 px-4 py-3 text-xs font-medium text-gray-400">
                                    <span>Họ và tên</span>
                                    <span>Quan hệ</span>
                                    <span>Số CCCD</span>
                                </div>
                                {detailTenant.roommates.map((roommate) => (
                                    <div key={`${roommate.name}-${roommate.cccd}`} className="grid grid-cols-3 border-t border-gray-100 px-4 py-3 text-sm text-gray-900">
                                        <span>{roommate.name}</span>
                                        <span>{roommate.relation}</span>
                                        <span>{roommate.cccd}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3 border-t border-gray-100 pt-4">
                            <button type="button" onClick={() => setDetailTenant(null)} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
                            <button
                                type="button"
                                onClick={() => {
                                    setDetailTenant(null)
                                    openEditModal(detailTenant)
                                }}
                                className="flex-1 rounded-xl bg-[#80001C] py-2.5 text-sm font-medium text-white hover:bg-[#6B0018]"
                            >
                                Chỉnh sửa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deletingTenant && (
                <ConfirmDialog
                    title="Xác nhận xóa khách thuê"
                    message={`Bạn có chắc chắn muốn xóa khách thuê ${deletingTenant.name}? Hành động này không thể hoàn tác.`}
                    onCancel={() => setDeletingTenant(null)}
                    onConfirm={confirmDelete}
                />
            )}
        </div>
    )
}

export default Tenant
