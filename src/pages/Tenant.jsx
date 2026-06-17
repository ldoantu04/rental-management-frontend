import React, { useContext, useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { RentalContext } from '../context/RentalContext'

const statusConfig = {
    CHUA_NHAN_PHONG: {
        label: 'Chưa nhận phòng',
        pillClass: 'bg-red-50 text-red-600',
        dotClass: 'bg-red-500'
    },
    DANG_THUE: {
        label: 'Đang thuê',
        pillClass: 'bg-green-50 text-green-600',
        dotClass: 'bg-green-500'
    },
    DA_CHUYEN_DI: {
        label: 'Đã chuyển đi',
        pillClass: 'bg-gray-100 text-gray-600',
        dotClass: 'bg-gray-500'
    }
}

const formatDate = (value) => {
    if (!value) return '-'
    const date = new Date(value)
    if (isNaN(date.getTime())) return value
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

const formatMoney = (value) => new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + ' VNĐ'

const ConfirmDialog = ({ title, message, confirmText = 'Xác nhận', onCancel, onConfirm }) => (
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
                    {confirmText}
                </button>
            </div>
        </div>
    </div>
)

const emptyRoommate = { hoTen: '', quanHe: '', cccd: '', sdt: '' }

const mapTenant = (t) => ({
    id: t.id,
    hoTen: t.hoTen || '',
    ngaySinh: t.ngaySinh || '',
    gioiTinh: t.gioiTinh || null,
    cccd: t.cccd || '',
    sdt: t.sdt || '',
    email: t.email || '',
    diaChi: t.diaChi || '',
    anhGiayTo: Array.isArray(t.anhGiayTo) ? t.anhGiayTo : [],
    danhSachNguoiOCung: Array.isArray(t.danhSachNguoiOCung) ? t.danhSachNguoiOCung : [],
    phongTro: t.phongTro || null,
    ngayBatDauThue: t.ngayBatDauThue || null,
    tienCoc: t.tienCoc != null ? t.tienCoc : null,
    trangThai: t.trangThai || 'CHUA_NHAN_PHONG',
    ghiChu: t.ghiChu || ''
})

const uploadImageFile = async (file, backendUrl, token) => {
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    const response = await axios.post(backendUrl + '/api/upload/image', formDataUpload, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
    })
    return response.data?.url
}

const Tenant = () => {
    const { backendUrl, token } = useContext(RentalContext)

    const [tenants, setTenants] = useState([])
    const [keyword, setKeyword] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingTenant, setEditingTenant] = useState(null)
    const [detailTenant, setDetailTenant] = useState(null)
    const [movingOutTenant, setMovingOutTenant] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [uploadingDoc, setUploadingDoc] = useState(false)
    const [formData, setFormData] = useState({
        hoTen: '',
        ngaySinh: '',
        gioiTinh: null,
        cccd: '',
        sdt: '',
        email: '',
        diaChi: '',
        ghiChu: '',
        anhGiayTo: [],
        danhSachNguoiOCung: [{ ...emptyRoommate }]
    })

    const fetchTenants = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/tenants', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setTenants((response.data || []).map(mapTenant))
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Không thể tải danh sách khách thuê')
        }
        setLoading(false)
    }

    useEffect(() => {
        if (token) {
            setLoading(true)
            fetchTenants()
        }
    }, [token])

    const filteredTenants = useMemo(() => {
        const search = keyword.trim().toLowerCase()
        if (!search) return tenants
        return tenants.filter((tenant) =>
            [tenant.hoTen, tenant.cccd, tenant.sdt, tenant.email].some((value) =>
                value && value.toLowerCase().includes(search)
            )
        )
    }, [keyword, tenants])

    const rentingCount = tenants.filter((tenant) => tenant.trangThai === 'DANG_THUE').length
    const unpaidCount = tenants.filter((tenant) => tenant.trangThai === 'CHUA_NHAN_PHONG').length

    const openCreateModal = () => {
        setEditingTenant(null)
        setFormData({
            hoTen: '',
            ngaySinh: '',
            gioiTinh: null,
            cccd: '',
            sdt: '',
            email: '',
            diaChi: '',
            ghiChu: '',
            anhGiayTo: [],
            danhSachNguoiOCung: [{ ...emptyRoommate }]
        })
        setShowForm(true)
    }

    const openEditModal = (tenant) => {
        setEditingTenant(tenant)
        setFormData({
            hoTen: tenant.hoTen || '',
            ngaySinh: tenant.ngaySinh || '',
            gioiTinh: tenant.gioiTinh || null,
            cccd: tenant.cccd || '',
            sdt: tenant.sdt || '',
            email: tenant.email || '',
            diaChi: tenant.diaChi || '',
            ghiChu: tenant.ghiChu || '',
            anhGiayTo: tenant.anhGiayTo || [],
            danhSachNguoiOCung: tenant.danhSachNguoiOCung.length
                ? tenant.danhSachNguoiOCung.map((r) => ({ hoTen: r.hoTen || '', quanHe: r.quanHe || '', cccd: r.cccd || '', sdt: r.sdt || '' }))
                : [{ ...emptyRoommate }]
        })
        setShowForm(true)
    }

    const updateRoommate = (index, field, value) => {
        setFormData((prev) => ({
            ...prev,
            danhSachNguoiOCung: prev.danhSachNguoiOCung.map((roommate, currentIndex) =>
                currentIndex === index ? { ...roommate, [field]: value } : roommate
            )
        }))
    }

    const addRoommate = () => {
        setFormData((prev) => ({
            ...prev,
            danhSachNguoiOCung: [...prev.danhSachNguoiOCung, { ...emptyRoommate }]
        }))
    }

    const removeRoommate = (index) => {
        setFormData((prev) => ({
            ...prev,
            danhSachNguoiOCung: prev.danhSachNguoiOCung.filter((_, currentIndex) => currentIndex !== index)
        }))
    }

    const handleDocumentUpload = async (event) => {
        const files = Array.from(event.target.files || [])
        if (files.length === 0) return
        setUploadingDoc(true)
        try {
            const uploadedUrls = []
            for (const file of files) {
                const url = await uploadImageFile(file, backendUrl, token)
                if (url) uploadedUrls.push(url)
            }
            if (uploadedUrls.length > 0) {
                setFormData((prev) => ({ ...prev, anhGiayTo: [...(prev.anhGiayTo || []), ...uploadedUrls] }))
                toast.success(`Đã tải lên ${uploadedUrls.length} ảnh giấy tờ`)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Không thể tải ảnh lên')
        } finally {
            setUploadingDoc(false)
            event.target.value = ''
        }
    }

    const removeDocumentImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            anhGiayTo: prev.anhGiayTo.filter((_, currentIndex) => currentIndex !== index)
        }))
    }

    const buildPayload = () => ({
        hoTen: formData.hoTen || null,
        ngaySinh: formData.ngaySinh || null,
        gioiTinh: formData.gioiTinh || null,
        cccd: formData.cccd || null,
        sdt: formData.sdt || null,
        email: formData.email || null,
        diaChi: formData.diaChi || null,
        ghiChu: formData.ghiChu || null,
        anhGiayTo: formData.anhGiayTo || [],
        danhSachNguoiOCung: (formData.danhSachNguoiOCung || []).filter((r) => r.hoTen && r.hoTen.trim() !== '')
    })

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSubmitting(true)
        const payload = buildPayload()
        try {
            if (editingTenant) {
                await axios.put(backendUrl + '/api/tenants/' + editingTenant.id, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                toast.success('Cập nhật khách thuê thành công')
            } else {
                await axios.post(backendUrl + '/api/tenants', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                toast.success('Thêm khách thuê thành công')
            }
            setShowForm(false)
            await fetchTenants()
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
        } finally {
            setSubmitting(false)
        }
    }

    const confirmMoveOut = async () => {
        if (!movingOutTenant) return
        try {
            await axios.put(backendUrl + '/api/tenants/' + movingOutTenant.id + '/move-out', {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('Đã cập nhật khách trả phòng thành công')
            setMovingOutTenant(null)
            await fetchTenants()
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái khách thuê')
        }
    }

    const roomLabel = (room) => {
        if (!room) return '-'
        const motelName = room.nhaTro?.tenTro
        return motelName ? `${room.maPhong} - ${motelName}` : (room.maPhong || '-')
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
                                <p className="text-sm font-medium">Chưa nhận phòng</p>
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
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">Đang tải dữ liệu...</td>
                                    </tr>
                                ) : filteredTenants.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">Chưa có khách thuê nào</td>
                                    </tr>
                                ) : (
                                    filteredTenants.map((tenant) => {
                                        const config = statusConfig[tenant.trangThai] || statusConfig.CHUA_NHAN_PHONG
                                        const hasContract = tenant.trangThai === 'DANG_THUE' && tenant.phongTro
                                        return (
                                            <tr key={tenant.id} className="transition-colors hover:bg-gray-50/70">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF2F4]">
                                                            <img className="h-4 w-4" src={assets.icon_tenant} alt="" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-900">{tenant.hoTen}</span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{tenant.cccd || '-'}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{tenant.sdt || '-'}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{hasContract ? roomLabel(tenant.phongTro) : '-'}</td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{hasContract ? formatDate(tenant.ngayBatDauThue) : '-'}</td>
                                                <td className="px-5 py-4 text-center text-sm text-gray-700">{tenant.danhSachNguoiOCung.length}</td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.pillClass}`}>
                                                        <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
                                                        {config.label}
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
                                                        {tenant.trangThai !== 'DA_CHUYEN_DI' && (
                                                            <button type="button" onClick={() => setMovingOutTenant(tenant)} className="hover:opacity-70" aria-label="Khách trả phòng">
                                                                <img className="h-4 w-4" src={assets.icon_xoa} alt="" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
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
                                        <input required value={formData.hoTen} onChange={(event) => setFormData({ ...formData, hoTen: event.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" placeholder="Nguyễn Văn A" />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Ngày sinh</span>
                                        <input type="date" value={formData.ngaySinh || ''} onChange={(event) => setFormData({ ...formData, ngaySinh: event.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Số CCCD *</span>
                                        <input required value={formData.cccd} onChange={(event) => setFormData({ ...formData, cccd: event.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" placeholder="033333333333" />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Số điện thoại</span>
                                        <input value={formData.sdt} onChange={(event) => setFormData({ ...formData, sdt: event.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" placeholder="0123454523" />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Email</span>
                                        <input type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" placeholder="email@gmail.com" />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Địa chỉ</span>
                                        <input value={formData.diaChi} onChange={(event) => setFormData({ ...formData, diaChi: event.target.value })} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" placeholder="Địa chỉ thường trú" />
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
                                    {formData.danhSachNguoiOCung.map((roommate, index) => (
                                        <div key={index} className="rounded-xl bg-gray-50 p-3">
                                            <div className="mb-2 flex items-center justify-between">
                                                <p className="text-xs font-semibold uppercase text-gray-500">Người ở cùng #{index + 1}</p>
                                                {formData.danhSachNguoiOCung.length > 1 && (
                                                    <button type="button" onClick={() => removeRoommate(index)} className="flex h-7 w-7 items-center justify-center rounded-full border border-red-200 bg-white text-[#80001C] transition-colors hover:bg-red-50" aria-label="Xóa người ở cùng">
                                                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                                <label className="block">
                                                    <span className="mb-1 block text-xs font-medium text-gray-500">Họ và tên</span>
                                                    <input value={roommate.hoTen} onChange={(event) => updateRoommate(index, 'hoTen', event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none" placeholder="Họ và tên" />
                                                </label>
                                                <label className="block">
                                                    <span className="mb-1 block text-xs font-medium text-gray-500">Quan hệ</span>
                                                    <input value={roommate.quanHe} onChange={(event) => updateRoommate(index, 'quanHe', event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none" placeholder="Quan hệ" />
                                                </label>
                                                <label className="block">
                                                    <span className="mb-1 block text-xs font-medium text-gray-500">Số CCCD</span>
                                                    <input value={roommate.cccd} onChange={(event) => updateRoommate(index, 'cccd', event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none" placeholder="Số CCCD" />
                                                </label>
                                                <label className="block">
                                                    <span className="mb-1 block text-xs font-medium text-gray-500">Số điện thoại</span>
                                                    <input value={roommate.sdt} onChange={(event) => updateRoommate(index, 'sdt', event.target.value)} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none" placeholder="Số điện thoại" />
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-sm font-bold uppercase text-gray-400">Ảnh giấy tờ</p>
                                    <label className="cursor-pointer rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-[#80001C] hover:bg-red-100">
                                        {uploadingDoc ? 'Đang tải lên...' : 'Tải ảnh lên'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            disabled={uploadingDoc}
                                            onChange={handleDocumentUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                {formData.anhGiayTo.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                                        {formData.anhGiayTo.map((url, index) => (
                                            <div key={`${url}-${index}`} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                                                <img src={url} alt={`Ảnh giấy tờ ${index + 1}`} className="h-32 w-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeDocumentImage(index)}
                                                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#80001C] shadow-sm transition-opacity hover:bg-white"
                                                    aria-label="Xóa ảnh"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-xs text-gray-400">
                                        Chưa có ảnh giấy tờ nào
                                    </div>
                                )}
                            </div>

                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-gray-700">Ghi chú</span>
                                <textarea rows={3} value={formData.ghiChu} onChange={(event) => setFormData({ ...formData, ghiChu: event.target.value })} className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" placeholder="Nhập ghi chú (tùy chọn)" />
                            </label>

                            <div className="flex gap-3 border-t border-gray-100 pt-4">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Hủy
                                </button>
                                <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-[#80001C] py-2.5 text-sm font-medium text-white hover:bg-[#6B0018] disabled:opacity-60">
                                    {submitting ? 'Đang xử lý...' : (editingTenant ? 'Cập nhật' : 'Thêm mới')}
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
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#80001C] text-xl font-bold text-white">
                                    {(detailTenant.hoTen || '?').charAt(0)}
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-gray-900">{detailTenant.hoTen}</p>
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                        {detailTenant.trangThai === 'DANG_THUE' && detailTenant.phongTro && (
                                            <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-700">{roomLabel(detailTenant.phongTro)}</span>
                                        )}
                                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${(statusConfig[detailTenant.trangThai] || statusConfig.CHUA_NHAN_PHONG).pillClass}`}>
                                            {(statusConfig[detailTenant.trangThai] || statusConfig.CHUA_NHAN_PHONG).label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                            {[
                                ['Số CCCD', detailTenant.cccd],
                                ['Số điện thoại', detailTenant.sdt],
                                ['Email', detailTenant.email],
                                ['Địa chỉ', detailTenant.diaChi],
                                ['Ngày sinh', formatDate(detailTenant.ngaySinh)],
                                ['Phòng thuê', detailTenant.trangThai === 'DANG_THUE' && detailTenant.phongTro ? roomLabel(detailTenant.phongTro) : '-'],
                                ['Ngày bắt đầu thuê', detailTenant.trangThai === 'DANG_THUE' ? formatDate(detailTenant.ngayBatDauThue) : '-'],
                                ['Tiền cọc', detailTenant.trangThai === 'DANG_THUE' ? formatMoney(detailTenant.tienCoc) : '-']
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-xl bg-gray-50 p-4">
                                    <p className="text-xs font-medium text-gray-400">{label}</p>
                                    <p className="mt-1 text-sm font-semibold text-gray-900">{value || '-'}</p>
                                </div>
                            ))}
                        </div>

                        {detailTenant.danhSachNguoiOCung.length > 0 && (
                            <div className="mt-5">
                                <p className="mb-3 text-sm font-bold uppercase text-gray-400">Người ở cùng ({detailTenant.danhSachNguoiOCung.length})</p>
                                <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                                    <div className="grid grid-cols-4 px-4 py-3 text-xs font-medium text-gray-400">
                                        <span>Họ và tên</span>
                                        <span>Quan hệ</span>
                                        <span>Số CCCD</span>
                                        <span>Số điện thoại</span>
                                    </div>
                                    {detailTenant.danhSachNguoiOCung.map((roommate, index) => (
                                        <div key={`${roommate.hoTen}-${index}`} className="grid grid-cols-4 border-t border-gray-100 px-4 py-3 text-sm text-gray-900">
                                            <span>{roommate.hoTen}</span>
                                            <span>{roommate.quanHe || '-'}</span>
                                            <span>{roommate.cccd || '-'}</span>
                                            <span>{roommate.sdt || '-'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {detailTenant.anhGiayTo && detailTenant.anhGiayTo.length > 0 && (
                            <div className="mt-5">
                                <p className="mb-3 text-sm font-bold uppercase text-gray-400">Ảnh giấy tờ ({detailTenant.anhGiayTo.length})</p>
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                    {detailTenant.anhGiayTo.map((url, index) => (
                                        <a
                                            key={`${url}-${index}`}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group block overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                                        >
                                            <img src={url} alt={`Ảnh giấy tờ ${index + 1}`} className="h-36 w-full object-cover transition-transform group-hover:scale-105" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {detailTenant.ghiChu && (
                            <div className="mt-5 rounded-xl bg-gray-50 p-4">
                                <p className="text-xs font-medium text-gray-400">Ghi chú</p>
                                <p className="mt-1 whitespace-pre-line text-sm text-gray-700">{detailTenant.ghiChu}</p>
                            </div>
                        )}

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

            {movingOutTenant && (
                <ConfirmDialog
                    title="Xác nhận khách trả phòng"
                    message={
                        movingOutTenant.trangThai === 'DANG_THUE'
                            ? `Khách thuê ${movingOutTenant.hoTen} đang thuê phòng. Hệ thống sẽ cập nhật trạng thái khách thuê thành "Đã chuyển đi", giải phóng phòng về trạng thái trống và hủy các hợp đồng còn hạn với lý do "Khách trả phòng trước hạn".`
                            : `Khách thuê ${movingOutTenant.hoTen} sẽ được cập nhật trạng thái thành "Đã chuyển đi".`
                    }
                    confirmText="Xác nhận trả phòng"
                    onCancel={() => setMovingOutTenant(null)}
                    onConfirm={confirmMoveOut}
                />
            )}
        </div>
    )
}

export default Tenant
