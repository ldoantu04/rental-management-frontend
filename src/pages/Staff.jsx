import React, { useContext, useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { RentalContext } from '../context/RentalContext'

// ============================================================
// Validation helpers
// ============================================================
const isValidPhone = (v) => !v || /^0[0-9]{9,10}$/.test(v)
const isValidCccd = (v) => !v || /^[0-9]{12}$/.test(v)
const isValidEmail = (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const isValidName = (v) => !v || (v.trim().length >= 2 && /^[\p{L}\s]+$/u.test(v))

const formatPhone = (v) => v ? v.replace(/[^\d]/g, '').slice(0, 11) : ''
const formatCccd = (v) => v ? v.replace(/[^\d]/g, '').slice(0, 12) : ''
const formatName = (v) => v ? v.replace(/[0-9]/g, '').slice(0, 100) : ''

const VALIDATE = {
  sdt:    { ok: isValidPhone,   msg: 'Số điện thoại phải là 10-11 chữ số, bắt đầu bằng số 0' },
  cccd:   { ok: isValidCccd,    msg: 'Số CCCD phải là 12 chữ số' },
  email:  { ok: isValidEmail,   msg: 'Email không hợp lệ' },
  hoTen:  { ok: isValidName,    msg: 'Họ tên phải từ 2 ký tự, không chứa số' }
}

const statusConfig = {
    HOAT_DONG: {
        label: 'Đang làm việc',
        pillClass: 'bg-green-50 text-green-600',
        dotClass: 'bg-green-500'
    },
    KHOA: {
        label: 'Đã nghỉ việc',
        pillClass: 'bg-gray-100 text-gray-600',
        dotClass: 'bg-gray-500'
    }
}

const roleMap = {
    QUAN_LY: 'Quản trị',
    NHAN_VIEN: 'Nhân viên'
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
    const { backendUrl, token } = useContext(RentalContext)
    const [staffList, setStaffList] = useState([])
    const [motels, setMotels] = useState([])
    const [keyword, setKeyword] = useState('')
    const [role, setRole] = useState('ALL')
    const [status, setStatus] = useState('ALL')
    const [motel, setMotel] = useState('ALL')
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingStaff, setEditingStaff] = useState(null)
    const [detailStaff, setDetailStaff] = useState(null)
    const [deletingStaff, setDeletingStaff] = useState(null)
    const [formData, setFormData] = useState({
        hoTen: '',
        ngaySinh: '',
        sdt: '',
        email: '',
        cccd: '',
        diaChi: '',
        ngayVaoLam: '',
        vaiTro: 'NHAN_VIEN',
        assignedMotelIds: [],
        trangThai: 'HOAT_DONG'
    })
    const [fieldErrors, setFieldErrors] = useState({})

    const fetchStaff = async () => {
        if (!token) return
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (keyword) params.append('keyword', keyword)
            if (role !== 'ALL') params.append('vaiTro', role)
            if (status !== 'ALL') params.append('trangThai', status)
            const url = `${backendUrl}/api/employees${params.toString() ? '?' + params.toString() : ''}`
            const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
            setStaffList(res.data || [])
        } catch (error) {
            toast.error('Lỗi khi tải danh sách nhân viên')
        } finally {
            setLoading(false)
        }
    }

    const fetchMotels = async () => {
        if (!token) return
        try {
            const res = await axios.get(`${backendUrl}/api/employees/motels/all`, { headers: { Authorization: `Bearer ${token}` } })
            setMotels(res.data || [])
        } catch (error) {
            console.log('Lỗi khi tải nhà trọ')
        }
    }

    useEffect(() => { fetchMotels() }, [])
    useEffect(() => { fetchStaff() }, [keyword, role, status])

    const filteredStaff = useMemo(() => {
        if (motel === 'ALL') return staffList
        return staffList.filter(s => {
            if (!s.assignedMotels || s.assignedMotels.length === 0) return false
            return s.assignedMotels.some(m => String(m.id) === String(motel))
        })
    }, [staffList, motel])

    const workingCount = staffList.filter(s => s.trangThai === 'HOAT_DONG').length
    const leftCount = staffList.filter(s => s.trangThai === 'KHOA').length

    const openCreateModal = () => {
        setEditingStaff(null)
        setFormData({
            hoTen: '', ngaySinh: '', sdt: '', email: '', cccd: '', diaChi: '',
            ngayVaoLam: '', vaiTro: 'NHAN_VIEN', assignedMotelIds: [], trangThai: 'HOAT_DONG'
        })
        setFieldErrors({})
        setShowForm(true)
    }

    const openEditModal = (staff) => {
        setEditingStaff(staff)
        setFormData({
            hoTen: staff.hoTen || '',
            ngaySinh: staff.ngaySinh || '',
            sdt: staff.sdt || '',
            email: staff.email || '',
            cccd: staff.cccd || '',
            diaChi: staff.diaChi || '',
            ngayVaoLam: staff.ngayVaoLam || '',
            vaiTro: staff.vaiTro || 'NHAN_VIEN',
            assignedMotelIds: staff.assignedMotels ? staff.assignedMotels.map(m => m.id) : [],
            trangThai: staff.trangThai || 'HOAT_DONG'
        })
        setFieldErrors({})
        setShowForm(true)
    }

    const validateFields = () => {
        const errs = {}
        if (formData.hoTen && !VALIDATE.hoTen.ok(formData.hoTen)) errs.hoTen = VALIDATE.hoTen.msg
        if (formData.sdt && !VALIDATE.sdt.ok(formData.sdt)) errs.sdt = VALIDATE.sdt.msg
        if (formData.cccd && !VALIDATE.cccd.ok(formData.cccd)) errs.cccd = VALIDATE.cccd.msg
        if (formData.email && !VALIDATE.email.ok(formData.email)) errs.email = VALIDATE.email.msg
        return errs
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!token) return
        const errs = validateFields()
        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs)
            return
        }
        try {
            const payload = { ...formData }
            if (payload.vaiTro === 'QUAN_LY') {
                payload.assignedMotelIds = []
            }
            if (editingStaff) {
                await axios.put(`${backendUrl}/api/employees/${editingStaff.id}`, payload, { headers: { Authorization: `Bearer ${token}` } })
                toast.success('Cập nhật nhân viên thành công')
            } else {
                await axios.post(`${backendUrl}/api/employees`, payload, { headers: { Authorization: `Bearer ${token}` } })
                toast.success('Thêm nhân viên thành công')
            }
            setShowForm(false)
            fetchStaff()
        } catch (error) {
            const msg = error.response?.data?.message || error.response?.data || 'Có lỗi xảy ra'
            toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg))
        }
    }

    const confirmDelete = async () => {
        if (!token || !deletingStaff) return
        try {
            await axios.delete(`${backendUrl}/api/employees/${deletingStaff.id}`, { headers: { Authorization: `Bearer ${token}` } })
            toast.success('Xóa nhân viên thành công')
            setDeletingStaff(null)
            fetchStaff()
        } catch (error) {
            const msg = error.response?.data?.message || 'Có lỗi xảy ra'
            toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg))
        }
    }

    const handleMotelToggle = (id) => {
        setFormData(prev => {
            const cur = prev.assignedMotelIds || []
            return { ...prev, assignedMotelIds: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] }
        })
    }

    const getMotelsLabel = (assignedMotels) => {
        if (!assignedMotels || assignedMotels.length === 0) return '-'
        return assignedMotels.map(m => m.tenTro).join(', ')
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
                        <span className="text-lg">+</span>Thêm nhân viên
                    </button>
                </div>

                <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-[#80001C] shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Tổng nhân viên</p>
                                <p className="mt-2 text-3xl font-bold">{loading ? '...' : staffList.length}</p>
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
                                <p className="mt-2 text-3xl font-bold">{loading ? '...' : workingCount}</p>
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
                                <p className="mt-2 text-3xl font-bold">{loading ? '...' : leftCount}</p>
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
                            <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Tìm kiếm nhân viên..." className="flex-1 bg-transparent text-sm outline-none" />
                        </div>
                        <select value={role} onChange={e => setRole(e.target.value)} className="rounded-xl bg-gray-100 px-3 py-2.5 text-sm">
                            <option value="ALL">Tất cả vai trò</option>
                            <option value="QUAN_LY">Quản trị</option>
                            <option value="NHAN_VIEN">Nhân viên</option>
                        </select>
                        <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-xl bg-gray-100 px-3 py-2.5 text-sm">
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="HOAT_DONG">Đang làm việc</option>
                            <option value="KHOA">Đã nghỉ việc</option>
                        </select>
                        <select value={motel} onChange={e => setMotel(e.target.value)} className="rounded-xl bg-gray-100 px-3 py-2.5 text-sm">
                            <option value="ALL">Tất cả nhà trọ</option>
                            {motels.map(m => <option key={m.id} value={m.id}>{m.tenTro}</option>)}
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
                                {loading ? (
                                    <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-500">Đang tải...</td></tr>
                                ) : filteredStaff.length === 0 ? (
                                    <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-gray-500">Không có nhân viên nào</td></tr>
                                ) : filteredStaff.map(staff => (
                                    <tr key={staff.id} className="transition-colors hover:bg-gray-50/70">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF2F4]">
                                                    <img src={assets.icon_staff} alt="" className="h-4 w-4" />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">{staff.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{staff.hoTen || '-'}</td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{staff.sdt || '-'}</td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{staff.email || '-'}</td>
                                        <td className="px-5 py-4 text-center text-sm text-gray-700">
                                            {roleMap[staff.vaiTro] || staff.vaiTro}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-700">
                                            {staff.vaiTro === 'QUAN_LY' ? 'Tất cả' : getMotelsLabel(staff.assignedMotels)}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusConfig[staff.trangThai]?.pillClass || 'bg-gray-100 text-gray-600'}`}>
                                                <span className={`h-2 w-2 rounded-full ${statusConfig[staff.trangThai]?.dotClass || 'bg-gray-500'}`} />
                                                {statusConfig[staff.trangThai]?.label || staff.trangThai}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-3">
                                                <button type="button" onClick={() => setDetailStaff(staff)} className="hover:opacity-70" aria-label="Xem chi tiết">
                                                    <img className="h-4 w-4" src={assets.icon_xemprofile} alt="" />
                                                </button>
                                                <button type="button" onClick={() => openEditModal(staff)} className="hover:opacity-70" aria-label="Sửa">
                                                    <img className="h-4 w-4" src={assets.icon_sua} alt="" />
                                                </button>
                                                <button type="button" onClick={() => setDeletingStaff(staff)} className="hover:opacity-70" aria-label="Xóa">
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
                            {/* Ho va ten */}
                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-gray-700">Họ và tên *</span>
                                <input
                                    type="text"
                                    required
                                    value={formData.hoTen}
                                    onChange={e => {
                                        const v = formatName(e.target.value)
                                        setFormData(p => ({ ...p, hoTen: v }))
                                        if (fieldErrors.hoTen) setFieldErrors(p => ({ ...p, hoTen: undefined }))
                                    }}
                                    placeholder="Nguyễn Văn A"
                                    className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-1 ${
                                        fieldErrors.hoTen ? 'border-red-400 focus:border-red-500 focus:ring-red-300' : 'border-gray-300 focus:border-[#7A1B2E] focus:ring-[#7A1B2E]'
                                    }`}
                                />
                                {fieldErrors.hoTen && <p className="mt-1 text-xs text-red-500">{fieldErrors.hoTen}</p>}
                            </label>

                            {/* Ngay sinh + So dien thoai */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-gray-700">Ngày sinh</span>
                                    <input
                                        type="date"
                                        value={formData.ngaySinh}
                                        onChange={e => setFormData(p => ({ ...p, ngaySinh: e.target.value }))}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]"
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-gray-700">Số điện thoại</span>
                                    <input
                                        type="tel"
                                        value={formData.sdt}
                                        onChange={e => {
                                            const v = formatPhone(e.target.value)
                                            setFormData(p => ({ ...p, sdt: v }))
                                            if (fieldErrors.sdt) setFieldErrors(p => ({ ...p, sdt: undefined }))
                                        }}
                                        placeholder="0901234567"
                                        className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-1 ${
                                            fieldErrors.sdt ? 'border-red-400 focus:border-red-500 focus:ring-red-300' : 'border-gray-300 focus:border-[#7A1B2E] focus:ring-[#7A1B2E]'
                                        }`}
                                    />
                                    {fieldErrors.sdt && <p className="mt-1 text-xs text-red-500">{fieldErrors.sdt}</p>}
                                </label>
                            </div>

                            {/* Email + CCCD */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-gray-700">Email *</span>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={e => {
                                            setFormData(p => ({ ...p, email: e.target.value }))
                                            if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: undefined }))
                                        }}
                                        placeholder="email@domain.com"
                                        className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-1 ${
                                            fieldErrors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-300' : 'border-gray-300 focus:border-[#7A1B2E] focus:ring-[#7A1B2E]'
                                        }`}
                                    />
                                    {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-gray-700">Số CCCD</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={formData.cccd}
                                        onChange={e => {
                                            const v = formatCccd(e.target.value)
                                            setFormData(p => ({ ...p, cccd: v }))
                                            if (fieldErrors.cccd) setFieldErrors(p => ({ ...p, cccd: undefined }))
                                        }}
                                        placeholder="033333333333"
                                        className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:ring-1 ${
                                            fieldErrors.cccd ? 'border-red-400 focus:border-red-500 focus:ring-red-300' : 'border-gray-300 focus:border-[#7A1B2E] focus:ring-[#7A1B2E]'
                                        }`}
                                    />
                                    {fieldErrors.cccd && <p className="mt-1 text-xs text-red-500">{fieldErrors.cccd}</p>}
                                </label>
                            </div>

                            {/* Dia chi + Ngay vao lam */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-gray-700">Địa chỉ</span>
                                    <input
                                        type="text"
                                        value={formData.diaChi}
                                        onChange={e => setFormData(p => ({ ...p, diaChi: e.target.value }))}
                                        placeholder="Địa chỉ thường trú"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]"
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-gray-700">Ngày vào làm</span>
                                    <input
                                        type="date"
                                        value={formData.ngayVaoLam}
                                        onChange={e => setFormData(p => ({ ...p, ngayVaoLam: e.target.value }))}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]"
                                    />
                                </label>
                            </div>

                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-gray-700">Vai trò *</span>
                                <select
                                    value={formData.vaiTro}
                                    onChange={e => setFormData({ ...formData, vaiTro: e.target.value })}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]"
                                >
                                    <option value="NHAN_VIEN">Nhân viên</option>
                                    <option value="QUAN_LY">Quản trị</option>
                                </select>
                            </label>

                            {formData.vaiTro !== 'QUAN_LY' && (
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-gray-700">Khu trọ phụ trách</span>
                                    {motels.length === 0 ? (
                                        <p className="text-sm text-gray-500">Đang tải...</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2 rounded-xl border border-gray-300 p-3">
                                            {motels.map(m => (
                                                <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.assignedMotelIds.includes(m.id)}
                                                        onChange={() => handleMotelToggle(m.id)}
                                                        className="h-4 w-4 rounded border-gray-300 text-[#80001C] focus:ring-[#80001C]"
                                                    />
                                                    <span className="text-sm text-gray-700">{m.tenTro}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </label>
                            )}

                            {formData.vaiTro === 'QUAN_LY' && (
                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                                    <p className="text-sm text-blue-700">Quản trị viên có quyền truy cập tất cả nhà trọ. Không cần phân công.</p>
                                </div>
                            )}

                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-gray-700">Trạng thái</span>
                                <select
                                    value={formData.trangThai}
                                    onChange={e => setFormData({ ...formData, trangThai: e.target.value })}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]"
                                >
                                    <option value="HOAT_DONG">Đang làm việc</option>
                                    <option value="KHOA">Đã nghỉ việc</option>
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
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#80001C] text-xl font-bold text-white">
                                    {detailStaff.hoTen ? detailStaff.hoTen.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-gray-900">{detailStaff.hoTen || '-'}</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
                                            {roleMap[detailStaff.vaiTro] || detailStaff.vaiTro}
                                        </span>
                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusConfig[detailStaff.trangThai]?.pillClass || 'bg-gray-100 text-gray-600'}`}>
                                            {statusConfig[detailStaff.trangThai]?.label || detailStaff.trangThai}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="mb-3 mt-6 text-sm font-bold uppercase text-gray-400">Thông tin cá nhân</p>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {[
                                ['Số điện thoại', detailStaff.sdt],
                                ['Email', detailStaff.email],
                                ['Số CCCD', detailStaff.cccd],
                                ['Ngày vào làm', formatDate(detailStaff.ngayVaoLam)]
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-xl bg-gray-50 p-4">
                                    <p className="text-xs font-medium text-gray-400">{label}</p>
                                    <p className="mt-1 text-sm font-semibold text-gray-900">{value || '-'}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div className="rounded-xl bg-gray-50 p-4">
                                <p className="text-xs font-medium text-gray-400">Ngày sinh</p>
                                <p className="mt-1 text-sm font-semibold text-gray-900">{formatDate(detailStaff.ngaySinh)}</p>
                            </div>
                            <div className="rounded-xl bg-gray-50 p-4">
                                <p className="text-xs font-medium text-gray-400">Địa chỉ</p>
                                <p className="mt-1 text-sm font-semibold text-gray-900">{detailStaff.diaChi || '-'}</p>
                            </div>
                        </div>

                        <p className="mb-3 mt-6 text-sm font-bold uppercase text-gray-400">Phạm vi quản lý</p>
                        <div className="flex flex-wrap gap-3">
                            {detailStaff.vaiTro === 'QUAN_LY' ? (
                                <span className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">Tất cả nhà trọ</span>
                            ) : detailStaff.assignedMotels && detailStaff.assignedMotels.length > 0 ? (
                                detailStaff.assignedMotels.map(m => (
                                    <span key={m.id} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-[#80001C]">{m.tenTro}</span>
                                ))
                            ) : (
                                <span className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-500">-</span>
                            )}
                        </div>

                        <div className="mt-5 flex gap-3 border-t border-gray-100 pt-4">
                            <button type="button" onClick={() => setDetailStaff(null)} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
                            <button
                                type="button"
                                onClick={() => { setDetailStaff(null); openEditModal(detailStaff) }}
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
                    message={`Bạn có chắc chắn muốn xóa nhân viên ${deletingStaff.hoTen}? Hành động này không thể hoàn tác.`}
                    onCancel={() => setDeletingStaff(null)}
                    onConfirm={confirmDelete}
                />
            )}
        </div>
    )
}

export default Staff
