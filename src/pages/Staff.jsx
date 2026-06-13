import React, { useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'

const initialStaff = [
    {
        id: 1,
        code: 'NV001',
        name: 'Nguyễn Văn Hùng',
        birthDate: '1994-05-12',
        phone: '0901234567',
        email: 'hung.nv@rental.com',
        cccd: '079201001234',
        address: '45 Đường Láng, Đống Đa, HN',
        startDate: '2024-03-01',
        role: 'Quản lý',
        motel: 'Nhà trọ Hoàng Long',
        status: 'WORKING',
        history: [
            'Tạo hóa đơn INV021 cho phòng A101',
            'Cập nhật thông tin khách thuê Nguyễn Văn An',
            'Xác nhận thanh toán hóa đơn INV018'
        ]
    },
    {
        id: 2,
        code: 'NV002',
        name: 'Trần Thị Mai',
        birthDate: '1996-10-20',
        phone: '0901234568',
        email: 'mai.tt@rental.com',
        cccd: '079201001235',
        address: '12 Nguyễn Trãi, Thanh Xuân, HN',
        startDate: '2024-04-15',
        role: 'Nhân viên',
        motel: 'Nhà trọ Hoàng Long',
        status: 'WORKING',
        history: ['Thêm khách thuê mới Phạm Thị D vào phòng C302', 'Đăng nhập hệ thống']
    },
    {
        id: 3,
        code: 'NV003',
        name: 'Lê Văn Nam',
        birthDate: '1995-02-09',
        phone: '0901234569',
        email: 'nam.lv@rental.com',
        cccd: '079201001236',
        address: '18 Minh Khai, Hai Bà Trưng, HN',
        startDate: '2024-05-01',
        role: 'Nhân viên',
        motel: 'Nhà trọ Minh Anh',
        status: 'WORKING',
        history: ['Cập nhật phòng P201', 'Tạo giao dịch TX018']
    },
    {
        id: 4,
        code: 'NV004',
        name: 'Phạm Thị Hoa',
        birthDate: '1997-08-14',
        phone: '0901234570',
        email: 'hoa.pt@rental.com',
        cccd: '079201001237',
        address: '67 Hồ Tùng Mậu, Cầu Giấy, HN',
        startDate: '2024-06-10',
        role: 'Nhân viên',
        motel: 'Nhà trọ Hoàng Hà',
        status: 'WORKING',
        history: ['Gửi email nhắc thanh toán', 'Cập nhật hóa đơn INV011']
    },
    {
        id: 5,
        code: 'NV005',
        name: 'Hoàng Văn Bình',
        birthDate: '1992-12-03',
        phone: '0901234571',
        email: 'binh.hv@rental.com',
        cccd: '079201001238',
        address: '91 Kim Mã, Ba Đình, HN',
        startDate: '2023-11-20',
        role: 'Quản lý',
        motel: 'Nhà trọ Hoàng Long, Minh Anh',
        status: 'WORKING',
        history: ['Duyệt hợp đồng HD018', 'Xuất báo cáo tháng 05/2026']
    },
    {
        id: 6,
        code: 'NV006',
        name: 'Vũ Thị Lan',
        birthDate: '1993-07-19',
        phone: '0901234572',
        email: 'lan.vt@rental.com',
        cccd: '079201001239',
        address: '23 Trần Duy Hưng, Cầu Giấy, HN',
        startDate: '2023-08-01',
        role: 'Quản lý',
        motel: 'Nhà trọ Minh Khánh',
        status: 'LEFT',
        history: ['Bàn giao nhà trọ Minh Khánh', 'Khóa tài khoản nhân viên']
    },
    {
        id: 7,
        code: 'NV007',
        name: 'Đỗ Văn Sơn',
        birthDate: '1991-01-25',
        phone: '0901234573',
        email: 'son.dv@rental.com',
        cccd: '079201001240',
        address: '10 Lê Văn Lương, Thanh Xuân, HN',
        startDate: '2024-01-12',
        role: 'Quản lý',
        motel: 'Nhà trọ Hoàng Long',
        status: 'WORKING',
        history: ['Kiểm tra trạng thái hợp đồng', 'Cập nhật cài đặt hóa đơn']
    },
    {
        id: 8,
        code: 'NV008',
        name: 'Bùi Thị Ngọc',
        birthDate: '1998-09-30',
        phone: '0901234574',
        email: 'ngoc.bt@rental.com',
        cccd: '079201001241',
        address: '5 Nguyễn Chí Thanh, Đống Đa, HN',
        startDate: '2024-07-01',
        role: 'Nhân viên',
        motel: 'Nhà trọ Hoàng Hà',
        status: 'WORKING',
        history: ['Cập nhật khách thuê phòng P102', 'Tạo hóa đơn INV025']
    }
]

const emptyStaff = {
    name: '',
    birthDate: '',
    phone: '',
    email: '',
    cccd: '',
    address: '',
    startDate: '',
    role: 'Nhân viên',
    motel: 'Nhà trọ Hoàng Long',
    status: 'WORKING'
}

const motelOptions = [
    'Nhà trọ Hoàng Long',
    'Nhà trọ Minh Anh',
    'Nhà trọ Hoàng Hà',
    'Nhà trọ Minh Khánh',
    'Nhà trọ Hoàng Long, Minh Anh'
]

const statusConfig = {
    WORKING: {
        label: 'Đang làm việc',
        pillClass: 'bg-green-50 text-green-600',
        dotClass: 'bg-green-500'
    },
    LEFT: {
        label: 'Đã nghỉ việc',
        pillClass: 'bg-gray-100 text-gray-600',
        dotClass: 'bg-gray-500'
    }
}

const formatDate = (value) => {
    if (!value) return '-'
    const [year, month, day] = value.split('-')
    return `${day}/${month}/${year}`
}

const ConfirmDialog = ({ title, message, onCancel, onConfirm }) => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
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

const Staff = () => {
    const [staffList, setStaffList] = useState(initialStaff)
    const [keyword, setKeyword] = useState('')
    const [role, setRole] = useState('ALL')
    const [status, setStatus] = useState('ALL')
    const [motel, setMotel] = useState('ALL')
    const [showForm, setShowForm] = useState(false)
    const [editingStaff, setEditingStaff] = useState(null)
    const [detailStaff, setDetailStaff] = useState(null)
    const [deletingStaff, setDeletingStaff] = useState(null)
    const [formData, setFormData] = useState(emptyStaff)

    const filteredStaff = useMemo(() => {
        const search = keyword.trim().toLowerCase()

        return staffList.filter((staff) => {
            const matchesSearch =
                !search ||
                [staff.code, staff.name, staff.phone, staff.email].some((value) =>
                    value.toLowerCase().includes(search)
                )
            const matchesRole = role === 'ALL' || staff.role === role
            const matchesStatus = status === 'ALL' || staff.status === status
            const matchesMotel = motel === 'ALL' || staff.motel === motel

            return matchesSearch && matchesRole && matchesStatus && matchesMotel
        })
    }, [keyword, role, status, motel, staffList])

    const workingCount = staffList.filter((staff) => staff.status === 'WORKING').length
    const leftCount = staffList.filter((staff) => staff.status === 'LEFT').length

    const openCreateModal = () => {
        setEditingStaff(null)
        setFormData(emptyStaff)
        setShowForm(true)
    }

    const openEditModal = (staff) => {
        setEditingStaff(staff)
        setFormData({
            name: staff.name,
            birthDate: staff.birthDate,
            phone: staff.phone,
            email: staff.email,
            cccd: staff.cccd,
            address: staff.address,
            startDate: staff.startDate,
            role: staff.role,
            motel: staff.motel,
            status: staff.status
        })
        setShowForm(true)
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        if (editingStaff) {
            setStaffList((prev) =>
                prev.map((staff) =>
                    staff.id === editingStaff.id ? { ...staff, ...formData } : staff
                )
            )
            toast.success('Cập nhật nhân viên thành công')
        } else {
            const nextCode = `NV${String(staffList.length + 1).padStart(3, '0')}`
            setStaffList((prev) => [
                {
                    ...formData,
                    id: Date.now(),
                    code: nextCode,
                    history: ['Tạo hồ sơ nhân viên mới']
                },
                ...prev
            ])
            toast.success('Thêm nhân viên thành công')
        }

        setShowForm(false)
    }

    const confirmDelete = () => {
        setStaffList((prev) => prev.filter((staff) => staff.id !== deletingStaff.id))
        setDeletingStaff(null)
        toast.success('Xóa nhân viên thành công')
    }

    return (
        <div className="min-h-screen bg-[#F6F7FB]">
            <Sidebar />
            <Header title="Quản lý nhân viên" />

            <div className="ml-[220px] px-5 pb-5 pt-[80px]">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Quản lý nhân viên</h1>
                        <p className="mt-1 text-sm text-gray-500">Quản lý thông tin nhân viên và theo dõi tình trạng làm việc</p>
                    </div>

                    <button type="button" onClick={openCreateModal} className="flex items-center gap-2 rounded-xl bg-[#80001C] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6B0018]">
                        <span className="text-lg">+</span>
                        Thêm nhân viên
                    </button>
                </div>

                <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-[#80001C] shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Tổng nhân viên</p>
                                <p className="mt-2 text-3xl font-bold">{staffList.length}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#80001C]">
                                <img src={assets.icon_staff} alt="" className="h-6 w-6 brightness-0 invert" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-green-700 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Đang làm việc</p>
                                <p className="mt-2 text-3xl font-bold">{workingCount}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
                                <img src={assets.icon_staff} alt="" className="h-6 w-6 brightness-0 invert" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-gray-700 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Đã nghỉ việc</p>
                                <p className="mt-2 text-3xl font-bold">{leftCount}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-600">
                                <img src={assets.icon_staff} alt="" className="h-6 w-6 brightness-0 invert" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                        <div className="flex items-center gap-3 rounded-xl bg-gray-100 px-3 py-2.5">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm kiếm nhân viên..." className="flex-1 bg-transparent text-sm outline-none" />
                        </div>

                        <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-xl bg-gray-100 px-3 py-2.5 text-sm">
                            <option value="ALL">Tất cả vai trò</option>
                            <option value="Quản lý">Quản lý</option>
                            <option value="Nhân viên">Nhân viên</option>
                        </select>

                        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl bg-gray-100 px-3 py-2.5 text-sm">
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="WORKING">Đang làm việc</option>
                            <option value="LEFT">Đã nghỉ việc</option>
                        </select>

                        <select value={motel} onChange={(event) => setMotel(event.target.value)} className="rounded-xl bg-gray-100 px-3 py-2.5 text-sm">
                            <option value="ALL">Tất cả nhà trọ</option>
                            {motelOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1180px]">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Mã NV</th>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Họ và tên</th>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Số điện thoại</th>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Vai trò</th>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Nhà trọ phụ trách</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Trạng thái</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStaff.map((staff) => (
                                    <tr key={staff.id} className="transition-colors hover:bg-gray-50/70">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF2F4]">
                                                    <img src={assets.icon_staff} alt="" className="h-4 w-4" />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">{staff.code}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{staff.name}</td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{staff.phone}</td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{staff.email}</td>
                                        <td className="px-5 py-4 text-center text-sm text-gray-700">{staff.role}</td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{staff.motel}</td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusConfig[staff.status].pillClass}`}>
                                                <span className={`h-2 w-2 rounded-full ${statusConfig[staff.status].dotClass}`} />
                                                {statusConfig[staff.status].label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-3">
                                                <button type="button" onClick={() => setDetailStaff(staff)} className="hover:opacity-70" aria-label="Xem chi tiết nhân viên">
                                                    <img className="h-4 w-4" src={assets.icon_xemprofile} alt="" />
                                                </button>
                                                <button type="button" onClick={() => openEditModal(staff)} className="hover:opacity-70" aria-label="Sửa nhân viên">
                                                    <img className="h-4 w-4" src={assets.icon_sua} alt="" />
                                                </button>
                                                <button type="button" onClick={() => setDeletingStaff(staff)} className="hover:opacity-70" aria-label="Xóa nhân viên">
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
                    <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900">{editingStaff ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</h3>
                            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-1.5 hover:bg-gray-100">
                                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4 p-6">
                            {[
                                ['Họ và tên *', 'name', 'Nhập họ và tên', 'text', true],
                                ['Ngày sinh *', 'birthDate', '', 'date', true],
                                ['Số điện thoại', 'phone', 'Nhập số điện thoại', 'text', false],
                                ['Email *', 'email', 'Nhập email', 'email', true],
                                ['Số CCCD', 'cccd', 'Nhập số CCCD', 'text', false],
                                ['Địa chỉ', 'address', 'Nhập địa chỉ', 'text', false],
                                ['Ngày vào làm', 'startDate', '', 'date', false]
                            ].map(([label, field, placeholder, type, required]) => (
                                <label key={field} className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
                                    <input
                                        type={type}
                                        required={required}
                                        value={formData[field]}
                                        onChange={(event) => setFormData({ ...formData, [field]: event.target.value })}
                                        placeholder={placeholder}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]"
                                    />
                                </label>
                            ))}

                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-gray-700">Vai trò *</span>
                                <select value={formData.role} onChange={(event) => setFormData({ ...formData, role: event.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]">
                                    <option>Quản lý</option>
                                    <option>Nhân viên</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-gray-700">Khu trọ phụ trách</span>
                                <select value={formData.motel} onChange={(event) => setFormData({ ...formData, motel: event.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]">
                                    {motelOptions.map((item) => <option key={item}>{item}</option>)}
                                </select>
                            </label>

                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-gray-700">Trạng thái</span>
                                <select value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value })} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]">
                                    <option value="WORKING">Đang làm việc</option>
                                    <option value="LEFT">Đã nghỉ việc</option>
                                </select>
                            </label>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
                                <button type="submit" className="flex-1 rounded-xl bg-[#80001C] py-2.5 text-sm font-medium text-white hover:bg-[#6B0018]">{editingStaff ? 'Cập nhật' : 'Thêm mới'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {detailStaff && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Chi tiết nhân viên</h3>
                            <button type="button" onClick={() => setDetailStaff(null)} className="rounded-lg p-1.5 hover:bg-gray-100">
                                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#80001C] text-xl font-bold text-white">{detailStaff.name.charAt(0)}</div>
                                <div>
                                    <p className="text-lg font-bold text-gray-900">{detailStaff.name}</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">{detailStaff.role}</span>
                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusConfig[detailStaff.status].pillClass}`}>{statusConfig[detailStaff.status].label}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="mb-3 mt-6 text-sm font-bold uppercase text-gray-400">Thông tin cá nhân</p>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {[
                                ['Số điện thoại', detailStaff.phone],
                                ['Email', detailStaff.email],
                                ['Số CCCD', detailStaff.cccd],
                                ['Ngày vào làm', formatDate(detailStaff.startDate)],
                                ['Ngày sinh', formatDate(detailStaff.birthDate)],
                                ['Địa chỉ', detailStaff.address]
                            ].map(([label, value]) => (
                                <div key={label} className={`rounded-xl bg-gray-50 p-4 ${label === 'Địa chỉ' ? 'md:col-span-2' : ''}`}>
                                    <p className="text-xs font-medium text-gray-400">{label}</p>
                                    <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
                                </div>
                            ))}
                        </div>

                        <p className="mb-3 mt-6 text-sm font-bold uppercase text-gray-400">Phạm vi quản lý</p>
                        <div className="flex flex-wrap gap-3">
                            {detailStaff.motel.split(',').map((item) => (
                                <span key={item.trim()} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-[#80001C]">
                                    {item.trim()}
                                </span>
                            ))}
                        </div>

                        <p className="mb-3 mt-6 text-sm font-bold uppercase text-gray-400">Lịch sử thao tác gần đây</p>
                        <div className="divide-y divide-gray-100">
                            {detailStaff.history.map((item, index) => (
                                <div key={item} className="flex gap-3 py-3">
                                    <span className="mt-2 h-2 w-2 rounded-full bg-[#80001C]" />
                                    <div>
                                        <p className="text-sm text-gray-700">{item}</p>
                                        <p className="text-xs text-gray-400">{formatDate(`2026-06-${String(13 - index).padStart(2, '0')}`)} 09:{15 + index * 5}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 flex gap-3 border-t border-gray-100 pt-4">
                            <button type="button" onClick={() => setDetailStaff(null)} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
                            <button
                                type="button"
                                onClick={() => {
                                    setDetailStaff(null)
                                    openEditModal(detailStaff)
                                }}
                                className="flex-1 rounded-xl bg-[#80001C] py-2.5 text-sm font-medium text-white hover:bg-[#6B0018]"
                            >
                                Chỉnh sửa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deletingStaff && (
                <ConfirmDialog
                    title="Xác nhận xóa nhân viên"
                    message={`Bạn có chắc chắn muốn xóa nhân viên ${deletingStaff.name}? Hành động này không thể hoàn tác.`}
                    onCancel={() => setDeletingStaff(null)}
                    onConfirm={confirmDelete}
                />
            )}
        </div>
    )
}

export default Staff
