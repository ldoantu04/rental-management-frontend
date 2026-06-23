import React, { useContext, useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { RentalContext } from '../context/RentalContext'

const serviceCatalog = [
    { name: 'Điện', type: 'Theo chỉ số', price: 3500 },
    { name: 'Nước', type: 'Theo m3', price: 15000 },
    { name: 'Internet', type: 'Theo phòng', price: 100000 },
    { name: 'Vệ sinh', type: 'Theo phòng', price: 80000 },
    { name: 'Máy giặt', type: 'Theo phòng', price: 20000 },
    { name: 'Thang máy', type: 'Theo phòng', price: 50000 },
    { name: 'Gửi xe', type: 'Theo phòng', price: 100000 }
]

const serviceTypes = [
    'Theo chỉ số',
    'Theo người',
    'Theo phòng'
]

const emptyContract = {
    maKhachThue: '',
    maPhongTro: '',
    ngayBatDau: '',
    ngayKetThuc: '',
    tienCoc: '',
    giaThue: '',
    ngayThanhToan: 5,
    chuKyThanhToan: 5,
    danhSachDichVu: [],
    dieuKhoan: '- Thanh toán đầy đủ trước ngày thanh toán hằng tháng\n- Không được nuôi thú cưng\n- Giữ gìn vệ sinh chung'
}

const statusConfig = {
    DANG_HIEU_LUC: { label: 'Đang hiệu lực', pillClass: 'bg-green-50 text-green-600', dotClass: 'bg-green-500', statClass: 'bg-green-50 border-green-200 text-green-700', iconClass: 'bg-green-500' },
    SAP_HET_HAN: { label: 'Sắp hết hạn', pillClass: 'bg-orange-50 text-orange-600', dotClass: 'bg-orange-500', statClass: 'bg-orange-50 border-orange-200 text-orange-700', iconClass: 'bg-orange-500' },
    DA_HET_HAN: { label: 'Đã hết hạn', pillClass: 'bg-red-50 text-red-600', dotClass: 'bg-red-500', statClass: 'bg-red-50 border-red-200 text-red-700', iconClass: 'bg-red-500' },
    DA_HUY: { label: 'Đã hủy', pillClass: 'bg-gray-100 text-gray-600', dotClass: 'bg-gray-500', statClass: 'bg-white border-gray-200 text-gray-700', iconClass: 'bg-gray-700' }
}

const statusKeyMap = {
    DANG_HIEU_LUC: 'active',
    SAP_HET_HAN: 'expiring',
    DA_HET_HAN: 'expired',
    DA_HUY: 'cancelled'
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

const ContractPreview = ({ contract, onClose }) => {
    const [downloading, setDownloading] = useState(false)
    const { backendUrl, token } = useContext(RentalContext)

    const catalogSelected = (contract.danhSachDichVu || []).filter((s) => !s.laDichVuBoSung)
    const extraSelected = (contract.danhSachDichVu || []).filter((s) => s.laDichVuBoSung)

    const handleDownload = async () => {
        if (!contract?.id) return
        setDownloading(true)
        try {
            const response = await axios.get(backendUrl + '/api/contracts/' + contract.id + '/pdf', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            })
            const blob = new Blob([response.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            const safeCode = (contract.code || 'hop-dong').replace(/[^\w\-]/g, '_')
            link.setAttribute('download', `${safeCode}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
            toast.success('Đã tải xuống hợp đồng')
        } catch (error) {
            console.error('Lỗi tải hợp đồng:', error)
            const message = error?.response?.data?.message ? `: ${error.response.data.message}` : ''
            toast.error('Không thể tải xuống hợp đồng' + message)
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[60] bg-gray-200">
            <div className="flex h-14 items-center justify-between bg-[#1F2937] px-8 text-white">
                <button type="button" onClick={onClose} className="flex items-center gap-2 text-sm">
                    <span className="text-xl">←</span>
                    Quay lại
                </button>
                <button type="button" onClick={handleDownload} disabled={downloading} className="flex items-center gap-2 rounded-xl bg-[#80001C] px-4 py-2 text-sm font-medium hover:bg-[#6B0018] disabled:opacity-60">
                    <img src={assets.icon_download} alt="" className="h-4 w-4 brightness-0 invert" />
                    {downloading ? 'Đang tải...' : 'Tải xuống hợp đồng'}
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
                            <p className="mt-2 font-bold text-gray-900">Ngày {contract.paymentDay || '-'}</p>
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
                            {catalogSelected.map((service, index) => (
                                <div key={`catalog-${index}`} className="grid grid-cols-3 px-5 py-3 text-sm">
                                    <span className="font-medium text-gray-900">{service.tenDichVu}</span>
                                    <span className="text-gray-500">{service.kieuTinh || '-'}</span>
                                    <span className="text-right font-semibold text-gray-900">{formatMoney(service.donGia)}</span>
                                </div>
                            ))}
                            {extraSelected.map((service, index) => (
                                <div key={`extra-${index}`} className="grid grid-cols-3 px-5 py-3 text-sm">
                                    <span className="font-medium text-gray-900">{service.tenDichVu}</span>
                                    <span className="text-gray-500">{service.kieuTinh || '-'}</span>
                                    <span className="text-right font-semibold text-gray-900">{formatMoney(service.donGia)}</span>
                                </div>
                            ))}
                            {catalogSelected.length === 0 && extraSelected.length === 0 && (
                                <div className="px-5 py-4 text-sm text-gray-400">Chưa có dịch vụ áp dụng</div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8">
                        <h2 className="mb-3 text-lg font-bold text-gray-900">Điều khoản hợp đồng</h2>
                        <pre className="rounded-2xl border border-gray-100 bg-gray-50 p-5 font-sans text-sm leading-7 text-gray-700 whitespace-pre-wrap">{contract.terms || '-'}</pre>
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
}

const mapContract = (c) => {
    if (!c) return null
    const motel = c.phongTro?.nhaTro?.tenTro
    const room = c.phongTro
    const roomDisplay = room
        ? `${room.maPhong}${motel ? ' - ' + motel : ''}`
        : '-'
    return {
        id: c.id,
        code: c.maHopDong,
        tenant: c.khachThue?.hoTen || '-',
        tenantId: c.khachThue?.id || null,
        room: roomDisplay,
        roomId: room?.id || null,
        roomObj: room || null,
        startDate: c.ngayBatDau || '',
        endDate: c.ngayKetThuc || '',
        deposit: c.tienCoc || 0,
        rent: c.giaThue || 0,
        paymentDay: c.ngayThanhToan || 5,
        status: c.trangThaiHienThi || c.trangThai || 'DANG_HIEU_LUC',
        terms: c.dieuKhoan || '',
        danhSachDichVu: Array.isArray(c.danhSachDichVu) ? c.danhSachDichVu : []
    }
}

const Contract = () => {
    const { backendUrl, token } = useContext(RentalContext)

    const [allContracts, setAllContracts] = useState([])
    const [contracts, setContracts] = useState([])
    const [tenants, setTenants] = useState([])
    const [rooms, setRooms] = useState([])
    const [formData, setFormData] = useState(emptyContract)
    const [loading, setLoading] = useState(true)
    const [keyword, setKeyword] = useState('')
    const [status, setStatus] = useState('ALL')
    const [showForm, setShowForm] = useState(false)
    const [editingContract, setEditingContract] = useState(null)
    const [previewContract, setPreviewContract] = useState(null)
    const [deletingContract, setDeletingContract] = useState(null)
    const [lyDoHuy, setLyDoHuy] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const statistics = useMemo(() => {
        const stats = { total: 0, active: 0, expiring: 0, expired: 0, cancelled: 0 }
        allContracts.forEach((c) => {
            stats.total += 1
            if (c.status === 'DANG_HIEU_LUC') stats.active += 1
            else if (c.status === 'SAP_HET_HAN') stats.expiring += 1
            else if (c.status === 'DA_HET_HAN') stats.expired += 1
            else if (c.status === 'DA_HUY') stats.cancelled += 1
        })
        return stats
    }, [allContracts])

    const fetchAllContracts = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/contracts', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const list = (response.data || []).map(mapContract)
            setAllContracts(list)
            setContracts(list)
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Không thể tải danh sách hợp đồng')
        }
        setLoading(false)
    }

    const fetchTenants = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/tenants/available', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setTenants(response.data || [])
        } catch (error) {
            console.log(error)
        }
    }

    const fetchRooms = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/rooms/available', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setRooms(response.data || [])
        } catch (error) {
            console.log(error)
        }
    }

    const fetchAll = async () => {
        await Promise.all([fetchAllContracts(), fetchTenants(), fetchRooms()])
    }

    useEffect(() => {
        if (token) {
            setLoading(true)
            fetchAll()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token])

    useEffect(() => {
        const search = keyword.trim().toLowerCase()
        const filtered = allContracts.filter((c) => {
            const matchSearch = !search ||
                (c.code && c.code.toLowerCase().includes(search)) ||
                (c.tenant && c.tenant.toLowerCase().includes(search)) ||
                (c.room && c.room.toLowerCase().includes(search))
            const matchStatus = status === 'ALL' || c.status === status
            return matchSearch && matchStatus
        })
        setContracts(filtered)
    }, [keyword, status, allContracts])

    const openCreateModal = () => {
        setEditingContract(null)
        setFormData({
            ...emptyContract,
            maKhachThue: tenants[0]?.id ? String(tenants[0].id) : '',
            maPhongTro: rooms[0]?.id ? String(rooms[0].id) : '',
            giaThue: rooms[0]?.giaThue != null ? String(rooms[0].giaThue) : ''
        })
        setShowForm(true)
    }

    const openEditModal = (contract) => {
        setEditingContract(contract)
        setFormData({
            maKhachThue: contract.tenantId ? String(contract.tenantId) : '',
            maPhongTro: contract.roomId ? String(contract.roomId) : '',
            ngayBatDau: contract.startDate || '',
            ngayKetThuc: contract.endDate || '',
            tienCoc: contract.deposit != null ? String(contract.deposit) : '',
            giaThue: contract.rent != null ? String(contract.rent) : '',
            ngayThanhToan: contract.paymentDay || 5,
            chuKyThanhToan: 5,
            danhSachDichVu: (contract.danhSachDichVu || []).map((s) => ({
                tenDichVu: s.tenDichVu,
                kieuTinh: s.kieuTinh || serviceCatalog.find((x) => x.name === s.tenDichVu)?.type || 'Theo phòng',
                donGia: s.donGia != null ? String(s.donGia) : '0',
                laDichVuBoSung: !!s.laDichVuBoSung
            })),
            dieuKhoan: contract.terms || ''
        })
        setShowForm(true)
    }

    const handleRoomChange = (roomId) => {
        const room = rooms.find((r) => r.id === Number(roomId))
        setFormData((prev) => ({
            ...prev,
            maPhongTro: roomId,
            giaThue: room?.giaThue != null ? String(room.giaThue) : prev.giaThue
        }))
    }

    const isCatalogSelected = (name) =>
        (formData.danhSachDichVu || []).some((s) => s.tenDichVu === name && !s.laDichVuBoSung)

    const getCatalogService = (name) =>
        (formData.danhSachDichVu || []).find((s) => s.tenDichVu === name && !s.laDichVuBoSung)

    const getCatalogKieuTinh = (service) => {
        const selected = getCatalogService(service.name)
        if (selected && selected.kieuTinh) return selected.kieuTinh
        return service.type
    }

    const getCatalogDonGia = (service) => {
        const selected = getCatalogService(service.name)
        if (selected && selected.donGia !== '' && selected.donGia != null) return String(selected.donGia)
        return String(service.price)
    }

    const toggleCatalogService = (name) => {
        setFormData((prev) => {
            const exists = (prev.danhSachDichVu || []).find((s) => s.tenDichVu === name && !s.laDichVuBoSung)
            const catalogItem = serviceCatalog.find((s) => s.name === name)
            if (exists) {
                return {
                    ...prev,
                    danhSachDichVu: (prev.danhSachDichVu || []).filter(
                        (s) => !(s.tenDichVu === name && !s.laDichVuBoSung)
                    )
                }
            }
            return {
                ...prev,
                danhSachDichVu: [
                    ...(prev.danhSachDichVu || []),
                    {
                        tenDichVu: name,
                        kieuTinh: catalogItem?.type || 'Theo phòng',
                        donGia: String(catalogItem?.price || 0),
                        laDichVuBoSung: false
                    }
                ]
            }
        })
    }

    const updateCatalogService = (name, field, value) => {
        setFormData((prev) => ({
            ...prev,
            danhSachDichVu: (prev.danhSachDichVu || []).map((s) =>
                s.tenDichVu === name && !s.laDichVuBoSung
                    ? { ...s, [field]: value }
                    : s
            )
        }))
    }

    const addExtraService = () => {
        setFormData((prev) => ({
            ...prev,
            danhSachDichVu: [
                ...(prev.danhSachDichVu || []),
                { tenDichVu: '', kieuTinh: 'Theo phòng', donGia: '', laDichVuBoSung: true }
            ]
        }))
    }

    const removeExtraService = (index) => {
        setFormData((prev) => {
            const extras = (prev.danhSachDichVu || []).filter((s) => s.laDichVuBoSung)
            const target = extras[index]
            if (!target) return prev
            return {
                ...prev,
                danhSachDichVu: (prev.danhSachDichVu || []).filter((s) => s !== target)
            }
        })
    }

    const updateExtraService = (extraIndex, field, value) => {
        setFormData((prev) => {
            const extras = (prev.danhSachDichVu || []).filter((s) => s.laDichVuBoSung)
            const target = extras[extraIndex]
            if (!target) return prev
            return {
                ...prev,
                danhSachDichVu: (prev.danhSachDichVu || []).map((s) =>
                    s === target ? { ...s, [field]: value } : s
                )
            }
        })
    }

    const buildPayload = () => {
        const dichVuList = (formData.danhSachDichVu || [])
            .filter((s) => s.tenDichVu && String(s.tenDichVu).trim() !== '')
            .map((s) => ({
                tenDichVu: s.tenDichVu,
                kieuTinh: s.kieuTinh || null,
                donGia: s.donGia !== '' && s.donGia != null ? Number(s.donGia) : 0,
                laDichVuBoSung: !!s.laDichVuBoSung
            }))

        return {
            maKhachThue: formData.maKhachThue ? Number(formData.maKhachThue) : null,
            maPhongTro: formData.maPhongTro ? Number(formData.maPhongTro) : null,
            ngayBatDau: formData.ngayBatDau || null,
            ngayKetThuc: formData.ngayKetThuc || null,
            tienCoc: formData.tienCoc !== '' && formData.tienCoc != null ? Number(formData.tienCoc) : null,
            giaThue: formData.giaThue !== '' && formData.giaThue != null ? Number(formData.giaThue) : null,
            chuKyThanhToan: formData.chuKyThanhToan ? Number(formData.chuKyThanhToan) : 5,
            ngayThanhToan: formData.ngayThanhToan ? Number(formData.ngayThanhToan) : 5,
            dieuKhoan: formData.dieuKhoan || null,
            danhSachDichVu: dichVuList
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!formData.maKhachThue || !formData.maPhongTro) {
            toast.error('Vui lòng chọn khách thuê và phòng')
            return
        }
        setSubmitting(true)
        const payload = buildPayload()
        try {
            if (editingContract) {
                await axios.put(backendUrl + '/api/contracts/' + editingContract.id, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                toast.success('Cập nhật hợp đồng thành công')
            } else {
                await axios.post(backendUrl + '/api/contracts', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                toast.success('Tạo hợp đồng thành công')
            }
            setShowForm(false)
            await fetchAll()
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
        } finally {
            setSubmitting(false)
        }
    }

    const confirmDelete = async () => {
        if (!deletingContract) return
        try {
            await axios.put(
                backendUrl + '/api/contracts/' + deletingContract.id + '/cancel',
                { lyDoHuy: lyDoHuy || null },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            toast.success('Đã hủy hợp đồng thành công')
            setDeletingContract(null)
            setLyDoHuy('')
            await fetchAll()
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Không thể hủy hợp đồng')
        }
    }

    const tenantLabel = (t) => t?.hoTen || '-'
    const roomLabel = (r) => {
        if (!r) return '-'
        const motel = r.nhaTro?.tenTro
        return motel ? `${r.maPhong} - ${motel}` : r.maPhong
    }

    const extraServicesList = (formData.danhSachDichVu || []).filter((s) => s.laDichVuBoSung)

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
                                    <p className="mt-2 text-3xl font-bold">{statistics[statusKeyMap[key]] ?? 0}</p>
                                </div>
                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.iconClass}`}>
                                    <img src={key === 'SAP_HET_HAN' ? assets.icon_hopdonghethan : assets.icon_contract} alt="" className="h-6 w-6 brightness-0 invert" />
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
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                ) : contracts.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">
                                            Chưa có hợp đồng phù hợp
                                        </td>
                                    </tr>
                                ) : (
                                    contracts.map((contract) => {
                                        const config = statusConfig[contract.status] || statusConfig.DANG_HIEU_LUC
                                        return (
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
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.pillClass}`}>
                                                        <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
                                                        {config.label}
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
                                                        {contract.status !== 'DA_HUY' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => { setLyDoHuy(''); setDeletingContract(contract) }}
                                                                className="hover:opacity-70"
                                                            >
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
                                        <select value={String(formData.maKhachThue ?? '')} onChange={(event) => setFormData((prev) => ({ ...prev, maKhachThue: event.target.value }))} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]">
                                            <option value="">-- Chọn khách thuê --</option>
                                            {tenants.map((t) => <option key={t.id} value={t.id}>{tenantLabel(t)}</option>)}
                                        </select>
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Phòng *</span>
                                        <select value={String(formData.maPhongTro ?? '')} onChange={(event) => handleRoomChange(event.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]">
                                            <option value="">-- Chọn phòng --</option>
                                            {(() => {
                                                const currentRoomId = Number(formData.maPhongTro)
                                                const hasCurrent = rooms.some((r) => r.id === currentRoomId)
                                                if (!hasCurrent && currentRoomId && editingContract?.roomObj) {
                                                    return <option key={editingContract.roomObj.id} value={editingContract.roomObj.id}>{roomLabel(editingContract.roomObj)}</option>
                                                }
                                                return rooms.map((r) => <option key={r.id} value={r.id}>{roomLabel(r)}</option>)
                                            })()}
                                        </select>
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Ngày bắt đầu</span>
                                        <input type="date" value={formData.ngayBatDau} onChange={(event) => setFormData((prev) => ({ ...prev, ngayBatDau: event.target.value }))} required className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Ngày kết thúc</span>
                                        <input type="date" value={formData.ngayKetThuc} onChange={(event) => setFormData((prev) => ({ ...prev, ngayKetThuc: event.target.value }))} required className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" />
                                    </label>
                                    
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Tiền cọc (VNĐ)</span>
                                        <input type="number" min={0} value={formData.tienCoc} onChange={(event) => setFormData((prev) => ({ ...prev, tienCoc: event.target.value }))} required className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" placeholder="7000000" />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Ngày thanh toán hàng tháng</span>
                                        <input type="number" min={1} max={31} value={formData.ngayThanhToan} onChange={(event) => setFormData((prev) => ({ ...prev, ngayThanhToan: event.target.value }))} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" />
                                    </label>
                                    <label className="block md:col-span-2">
                                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Tiền thuê hàng tháng (VNĐ)</span>
                                        <input type="number" min={0} value={formData.giaThue} onChange={(event) => setFormData((prev) => ({ ...prev, giaThue: event.target.value }))} required className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" placeholder="3500000" />
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
                                    {serviceCatalog.map((service) => {
                                        const checked = isCatalogSelected(service.name)
                                        const kieuTinh = getCatalogKieuTinh(service)
                                        const donGia = getCatalogDonGia(service)
                                        return (
                                            <div key={service.name} className={`grid grid-cols-[56px_1fr_1fr_1fr] items-center px-4 py-3 text-sm ${checked ? 'text-gray-900' : 'text-gray-400'}`}>
                                                <input type="checkbox" checked={checked} onChange={() => toggleCatalogService(service.name)} className="h-4 w-4 accent-[#80001C]" />
                                                <span>{service.name}</span>
                                                <select
                                                    value={kieuTinh}
                                                    onChange={(e) => updateCatalogService(service.name, 'kieuTinh', e.target.value)}
                                                    disabled={!checked}
                                                    className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm outline-none disabled:bg-gray-100"
                                                >
                                                    {serviceTypes.map((type) => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={donGia}
                                                    onChange={(e) => updateCatalogService(service.name, 'donGia', e.target.value)}
                                                    disabled={!checked}
                                                    className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-right text-sm outline-none disabled:bg-gray-100"
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="mt-5">
                                    <div className="mb-3 flex items-center justify-between">
                                        <p className="text-sm font-bold uppercase text-gray-400">
                                            Dịch vụ bổ sung
                                        </p>

                                        <button
                                            type="button"
                                            onClick={addExtraService}
                                            className="flex items-center gap-2 rounded-xl border border-[#80001C]/20 bg-[#FDF2F4] px-3 py-2 text-sm font-medium text-[#80001C] transition-all hover:bg-[#F8E6EA]"
                                        >
                                            Thêm dịch vụ
                                        </button>
                                    </div>

                                    {extraServicesList.length > 0 && (
                                        <div className="space-y-3">
                                            {extraServicesList.map((service, index) => (
                                                <div
                                                    key={`extra-form-${index}`}
                                                    className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                                                >
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            Dịch vụ bổ sung #{index + 1}
                                                        </p>

                                                        <button
                                                            type="button"
                                                            onClick={() => removeExtraService(index)}
                                                            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all hover:bg-red-100"
                                                        >
                                                            <svg
                                                                className="h-4 w-4"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M6 18L18 6M6 6l12 12"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Tên dịch vụ"
                                                            value={service.tenDichVu}
                                                            onChange={(e) => updateExtraService(index, 'tenDichVu', e.target.value)}
                                                            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E]"
                                                        />

                                                        <select
                                                            value={service.kieuTinh || 'Theo phòng'}
                                                            onChange={(e) => updateExtraService(index, 'kieuTinh', e.target.value)}
                                                            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E]"
                                                        >
                                                            {serviceTypes.map((type) => (
                                                                <option key={type} value={type}>{type}</option>
                                                            ))}
                                                        </select>

                                                        <input
                                                            type="number"
                                                            placeholder="Đơn giá"
                                                            value={service.donGia}
                                                            onChange={(e) => updateExtraService(index, 'donGia', e.target.value)}
                                                            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E]"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-gray-700">Điều khoản hợp đồng</span>
                                <textarea rows={4} value={formData.dieuKhoan} onChange={(event) => setFormData((prev) => ({ ...prev, dieuKhoan: event.target.value }))} className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" />
                            </label>

                            <div className="flex gap-3 border-t border-gray-100 pt-4">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
                                <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-[#80001C] py-2.5 text-sm font-medium text-white hover:bg-[#6B0018] disabled:opacity-60">{submitting ? 'Đang xử lý...' : (editingContract ? 'Cập nhật' : 'Thêm mới')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {previewContract && <ContractPreview contract={previewContract} onClose={() => setPreviewContract(null)} />}

            {deletingContract && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900">Xác nhận hủy hợp đồng</h3>
                        <p className="mt-3 text-sm leading-6 text-gray-500">
                            Bạn có chắc chắn muốn hủy hợp đồng <span className="font-semibold text-gray-900">{deletingContract.code}</span>? Trạng thái hợp đồng sẽ được cập nhật thành "Đã hủy".
                        </p>
                        <label className="mt-5 block">
                            <span className="mb-1.5 block text-sm font-medium text-gray-700">Lý do hủy</span>
                            <textarea
                                rows={3}
                                value={lyDoHuy}
                                onChange={(event) => setLyDoHuy(event.target.value)}
                                placeholder="Nhập lý do hủy hợp đồng (tùy chọn)"
                                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]"
                            />
                        </label>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => { setDeletingContract(null); setLyDoHuy('') }}
                                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="rounded-xl bg-[#80001C] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#6B0018]"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Contract
