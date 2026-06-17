import { useContext, useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { RentalContext } from '../context/RentalContext'

const statusConfig = {
    CHUA_THANH_TOAN: { label: 'Chưa thanh toán', pillClass: 'bg-orange-50 text-orange-600', dotClass: 'bg-orange-500', statClass: 'bg-orange-50 border-orange-200 text-orange-700', iconClass: 'bg-orange-500', filterKey: 'UNPAID' },
    DA_THANH_TOAN: { label: 'Đã thanh toán', pillClass: 'bg-green-50 text-green-600', dotClass: 'bg-green-500', statClass: 'bg-green-50 border-green-200 text-green-700', iconClass: 'bg-green-500', filterKey: 'PAID' },
    QUA_HAN: { label: 'Quá hạn', pillClass: 'bg-red-50 text-red-600', dotClass: 'bg-red-500', statClass: 'bg-red-50 border-red-200 text-red-700', iconClass: 'bg-red-500', filterKey: 'OVERDUE' }
}

const filterKeyToStatus = {
    ALL: null,
    PAID: 'DA_THANH_TOAN',
    UNPAID: 'CHUA_THANH_TOAN',
    OVERDUE: 'QUA_HAN'
}

const waterModes = {
    CHI_SO: { label: 'Theo chỉ số', unit: 'm³' },
    THEO_NGUOI: { label: 'Theo người', unit: 'người' },
    THEO_PHONG: { label: 'Theo phòng', unit: 'phòng' }
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

const toMonthInput = (value) => {
    if (!value) return ''
    if (typeof value === 'string') {
        if (value.length >= 7) return value.substring(0, 7)
        return value
    }
    return ''
}

const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(Number(value || 0))
const formatMoney = (value) => `${formatNumber(value)} VNĐ`

const buildItemsFromInvoice = (invoice) => {
    const rent = Number(invoice.rent || 0)
    const elecStart = Number(invoice.electricStart || 0)
    const elecEnd = Number(invoice.electricEnd || 0)
    const elecPrice = Number(invoice.electricPrice || 0)
    const waterStart = Number(invoice.waterStart || 0)
    const waterEnd = Number(invoice.waterEnd || 0)
    const waterPrice = Number(invoice.waterPrice || 0)
    const waterMode = invoice.waterMode || 'CHI_SO'

    const elecQty = Math.max(elecEnd - elecStart, 0)

    const items = [
        { name: 'Tiền phòng', unit: 'Phòng', start: '', end: '', soLuong: 1, donGia: rent, amount: rent },
        {
            name: 'Tiền điện', unit: 'Số', start: elecStart, end: elecEnd,
            soLuong: elecQty, donGia: elecPrice,
            amount: elecQty * elecPrice
        }
    ]

    if (waterMode === 'CHI_SO') {
        const waterQty = Math.max(waterEnd - waterStart, 0)
        items.push({
            name: 'Tiền nước', unit: 'm³', start: waterStart, end: waterEnd,
            soLuong: waterQty, donGia: waterPrice,
            amount: waterQty * waterPrice
        })
    } else     if (waterMode === 'THEO_NGUOI') {
        const stored = Number(invoice.waterPeople)
        const people = Number.isFinite(stored) && stored > 0 ? stored : 1
        items.push({
            name: 'Tiền nước', unit: 'người', start: '', end: '',
            soLuong: people, donGia: waterPrice,
            amount: people * waterPrice
        })
    } else {
        items.push({
            name: 'Tiền nước', unit: 'phòng', start: '', end: '',
            soLuong: 1, donGia: waterPrice,
            amount: waterPrice
        })
    }

    const services = Array.isArray(invoice.services) ? invoice.services : []
    services.forEach((service) => {
        const donGia = Number(service.amount || 0)
        const kieuTinh = (service.kieuTinh || 'Theo phong').toLowerCase()
        const tenDichVu = (service.name || '').toLowerCase()
        const isChiSo = kieuTinh.includes('chi so') || kieuTinh.includes('chỉ số')
        const isElectricOrWaterByMeter = isChiSo && (
            tenDichVu.includes('điện') || tenDichVu.includes('dien') ||
            tenDichVu.includes('nước') || tenDichVu.includes('nuoc')
        )
        if (isElectricOrWaterByMeter) return

        let soLuong, unit
        if (kieuTinh.includes('nguoi') || kieuTinh.includes('người')) {
            unit = 'người'
        } else if (isChiSo) {
            unit = 'Số'
        } else {
            unit = 'Phòng'
        }
        const stored = Number(service.soLuong)
        soLuong = Number.isFinite(stored) && stored > 0 ? stored : 1

        items.push({
            name: service.name,
            unit,
            start: '',
            end: '',
            soLuong,
            donGia,
            amount: soLuong * donGia
        })
    })

    return items
}

const computeInvoiceTotal = (invoice) => buildItemsFromInvoice(invoice).reduce((sum, item) => sum + item.amount, 0)

const roomDisplay = (contract) => {
    if (!contract || !contract.phongTro) return '-'
    const room = contract.phongTro
    const motel = room.nhaTro?.tenTro
    return motel ? `${room.maPhong} - ${motel}` : room.maPhong
}

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

const InvoicePreview = ({ invoice, onClose, onMarkPaid, onDownload }) => {
    const items = buildItemsFromInvoice(invoice)
    const total = computeInvoiceTotal(invoice)

    return (
        <div className="fixed inset-0 z-[60] bg-gray-200">
            <div className="flex h-14 items-center justify-between bg-[#1F2937] px-8 text-white">
                <button type="button" onClick={onClose} className="flex items-center gap-2 text-sm">
                    <span className="text-xl">←</span>
                    Quay lại
                </button>
                <div className="flex items-center gap-3">
                    {invoice.status !== 'DA_THANH_TOAN' && (
                        <button type="button" onClick={onMarkPaid} className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium hover:bg-green-700">
                            Đánh dấu đã thanh toán (tiền mặt)
                        </button>
                    )}
                    <button type="button" onClick={onDownload} className="flex items-center gap-2 rounded-xl bg-[#80001C] px-4 py-2 text-sm font-medium hover:bg-[#6B0018]">
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
                        <span className={`rounded-full border px-5 py-2 text-sm font-bold ${invoice.status === 'DA_THANH_TOAN' ? 'border-green-600 text-green-600' : invoice.status === 'QUA_HAN' ? 'border-red-600 text-red-600' : 'border-orange-600 text-orange-600'}`}>
                            {(statusConfig[invoice.status]?.label || invoice.status).toUpperCase()}
                        </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-5 rounded-2xl border border-gray-100 bg-gray-50 p-6">
                        <div>
                            <p className="text-xs font-semibold uppercase text-gray-400">Khách thuê</p>
                            <p className="mt-2 font-bold text-gray-900">{invoice.tenant}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase text-gray-400">Kỳ hóa đơn</p>
                            <p className="mt-2 font-bold text-gray-900">{formatMonth(invoice.month)}</p>
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
                                <th className="px-3 py-4 text-center text-sm">SL</th>
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
                                    <td className="px-3 py-4 text-center text-sm text-gray-500">{item.soLuong}</td>
                                    <td className="px-3 py-4 text-right text-sm text-gray-500">{formatNumber(item.donGia)}</td>
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

const emptyForm = {
    maHopDong: '',
    room: '',
    tenant: '',
    month: '',
    rent: '',
    electricStart: 0,
    electricEnd: '',
    electricPrice: '',
    waterMode: 'CHI_SO',
    waterStart: 0,
    waterEnd: '',
    waterPrice: '',
    waterPeople: 1,
    services: [],
    dueDate: '',
    status: 'CHUA_THANH_TOAN'
}

const Invoice = () => {
    const { backendUrl, token } = useContext(RentalContext)

    const [invoices, setInvoices] = useState([])
    const [activeContracts, setActiveContracts] = useState([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [keyword, setKeyword] = useState('')
    const [status, setStatus] = useState('ALL')
    const [showForm, setShowForm] = useState(false)
    const [editingInvoice, setEditingInvoice] = useState(null)
    const [previewInvoice, setPreviewInvoice] = useState(null)
    const [deletingInvoice, setDeletingInvoice] = useState(null)
    const [formData, setFormData] = useState(emptyForm)

    const mapInvoice = (i) => {
        const services = (i.danhSachDichVu || []).map((s) => ({
            id: s.id,
            name: s.tenDichVu,
            kieuTinh: s.kieuTinh || 'Theo phong',
            soLuong: Number(s.soLuong || 1),
            amount: Number(s.donGia || 0),
            laTuHopDong: s.laTuHopDong !== false
        }))
        const roommateCount = (i.hopDong?.khachThue?.danhSachNguoiOCung || []).length
        const roomPeople = Number(i.hopDong?.phongTro?.soNguoi || 0)
        const people = roomPeople > 0 ? roomPeople : (roommateCount > 0 ? 1 + roommateCount : 1)
        return {
            id: i.id,
            code: i.maHoaDon,
            tenant: i.hopDong?.khachThue?.hoTen || '-',
            room: roomDisplay(i.hopDong),
            maHopDong: i.hopDong?.id || null,
            month: toMonthInput(i.kyHoaDon),
            rent: Number(i.tienPhong || 0),
            electricStart: i.chiSoDienCu == null ? 0 : i.chiSoDienCu,
            electricEnd: i.chiSoDienMoi == null ? '' : i.chiSoDienMoi,
            electricPrice: Number(i.giaDien || 0),
            waterMode: i.kieuTinhNuoc || 'CHI_SO',
            waterStart: i.chiSoNuocCu == null ? 0 : i.chiSoNuocCu,
            waterEnd: i.chiSoNuocMoi == null ? '' : i.chiSoNuocMoi,
            waterPrice: Number(i.giaNuoc || 0),
            waterPeople: people,
            services,
            dueDate: i.hanThanhToan || '',
            status: i.trangThai || 'CHUA_THANH_TOAN',
            tongTien: Number(i.tongTien || 0),
            ghiChu: i.ghiChu || ''
        }
    }

    const fetchInvoices = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/invoices', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setInvoices((response.data || []).map(mapInvoice))
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Khong the tai danh sach hoa don')
        }
    }

    const fetchActiveContracts = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/contracts/active', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setActiveContracts(response.data || [])
        } catch (error) {
            console.log(error)
            toast.error('Khong the tai danh sach phong dang thue')
        }
    }

    useEffect(() => {
        if (!token) return
        const loadData = async () => {
            setLoading(true)
            try {
                await Promise.all([fetchInvoices(), fetchActiveContracts()])
            } finally {
                setLoading(false)
            }
        }
        loadData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token])

    const filteredInvoices = useMemo(() => {
        const search = keyword.trim().toLowerCase()
        const targetStatus = filterKeyToStatus[status]
        return invoices.filter((invoice) => {
            const matchesSearch = !search || [invoice.code, invoice.tenant, invoice.room].some((value) => value?.toLowerCase().includes(search))
            const matchesStatus = targetStatus == null || invoice.status === targetStatus
            return matchesSearch && matchesStatus
        })
    }, [keyword, status, invoices])

    const countByStatus = (value) => invoices.filter((invoice) => invoice.status === value).length
    const revenue = invoices.filter((invoice) => invoice.status === 'DA_THANH_TOAN').reduce((total, invoice) => total + Number(invoice.tongTien || computeInvoiceTotal(invoice)), 0)

    const findContractByRoomString = (roomStr) => {
        if (!roomStr) return null
        return activeContracts.find((c) => roomDisplay(c) === roomStr) || null
    }

    const openCreateModal = () => {
        setEditingInvoice(null)
        setFormData({ ...emptyForm })
        setShowForm(true)
    }

    const openEditModal = async (invoice) => {
        setEditingInvoice(invoice)
        let people = 1
        if (invoice.maHopDong) {
            try {
                const matchedContract = activeContracts.find((c) => c.id === invoice.maHopDong)
                if (matchedContract?.phongTro?.id) {
                    const res = await axios.get(backendUrl + `/api/rooms/${matchedContract.phongTro.id}/people`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    if (res.data && Number(res.data.soNguoi) > 0) {
                        people = Number(res.data.soNguoi)
                    } else if (matchedContract.khachThue?.danhSachNguoiOCung) {
                        people = 1 + (matchedContract.khachThue.danhSachNguoiOCung.length || 0)
                    } else if (matchedContract.phongTro?.soNguoi) {
                        people = Number(matchedContract.phongTro.soNguoi)
                    }
                }
            } catch {
                const matchedContract = activeContracts.find((c) => c.id === invoice.maHopDong)
                if (matchedContract?.khachThue?.danhSachNguoiOCung) {
                    people = 1 + (matchedContract.khachThue.danhSachNguoiOCung.length || 0)
                } else if (matchedContract?.phongTro?.soNguoi) {
                    people = Number(matchedContract.phongTro.soNguoi)
                }
            }
        }
        setFormData({
            maHopDong: invoice.maHopDong || '',
            room: invoice.room,
            tenant: invoice.tenant,
            month: invoice.month || '',
            rent: String(invoice.rent ?? ''),
            electricStart: invoice.electricStart === '' || invoice.electricStart == null ? 0 : invoice.electricStart,
            electricEnd: invoice.electricEnd === '' || invoice.electricEnd == null ? '' : invoice.electricEnd,
            electricPrice: String(invoice.electricPrice ?? ''),
            waterMode: invoice.waterMode || 'CHI_SO',
            waterStart: invoice.waterStart === '' || invoice.waterStart == null ? 0 : invoice.waterStart,
            waterEnd: invoice.waterEnd === '' || invoice.waterEnd == null ? '' : invoice.waterEnd,
            waterPrice: String(invoice.waterPrice ?? ''),
            waterPeople: people,
            services: (invoice.services || []).map((s) => ({ ...s, amount: String(s.amount) })),
            dueDate: invoice.dueDate || '',
            status: invoice.status || 'CHUA_THANH_TOAN'
        })
        setShowForm(true)
    }

    const applyContractToForm = async (contract) => {
        if (!contract) return
        let electricPrice = 0
        let waterMode = 'CHI_SO'
        let waterPrice = 0
        const services = []
        for (const s of (contract.danhSachDichVu || [])) {
            const kieuTinh = (s.kieuTinh || '').toLowerCase()
            const tenDichVu = (s.tenDichVu || '').toLowerCase()
            if (kieuTinh.includes('chi so') || tenDichVu.includes('điện') || tenDichVu.includes('dien')) {
                if (electricPrice === 0) electricPrice = Number(s.donGia || 0)
                continue
            }
            if (kieuTinh.includes('m3') || tenDichVu.includes('nước') || tenDichVu.includes('nuoc')) {
                if (waterPrice === 0) waterPrice = Number(s.donGia || 0)
                if (kieuTinh.includes('m3')) waterMode = 'CHI_SO'
                else if (kieuTinh.includes('nguoi') || kieuTinh.includes('người')) waterMode = 'THEO_NGUOI'
                else if (kieuTinh.includes('phong') || kieuTinh.includes('phòng')) waterMode = 'THEO_PHONG'
                continue
            }
            services.push({
                name: s.tenDichVu,
                kieuTinh: s.kieuTinh || 'Theo phong',
                soLuong: 1,
                amount: String(Number(s.donGia || 0)),
                laTuHopDong: true
            })
        }

        let people = 1
        try {
            const res = await axios.get(backendUrl + `/api/rooms/${contract.phongTro?.id}/people`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.data && Number(res.data.soNguoi) > 0) {
                people = Number(res.data.soNguoi)
            }
        } catch {
            try {
                const room = contract.phongTro
                if (room?.soNguoi) people = Number(room.soNguoi)
                else if (contract.khachThue?.danhSachNguoiOCung) {
                    people = 1 + (contract.khachThue.danhSachNguoiOCung.length || 0)
                }
            } catch {
                /* fallback da bi bo qua */
            }
        }

        let previousMeters = { electricStart: '', waterStart: '' }
        try {
            const latestRes = await axios.get(backendUrl + `/api/invoices/contract/${contract.id}/latest`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (latestRes.data) {
                previousMeters.electricStart = latestRes.data.chiSoDienMoi ?? latestRes.data.chiSoDienCu ?? ''
                previousMeters.waterStart = latestRes.data.chiSoNuocMoi ?? latestRes.data.chiSoNuocCu ?? ''
            }
        } catch (error) {
            if (error.response?.status !== 204) {
                console.log('Khong co hoa don truoc:', error.message)
            }
        }

        setFormData((prev) => ({
            ...prev,
            maHopDong: contract.id,
            room: roomDisplay(contract),
            tenant: contract.khachThue?.hoTen || '',
            rent: contract.giaThue != null ? String(contract.giaThue) : prev.rent,
            electricStart: previousMeters.electricStart === '' || previousMeters.electricStart == null ? 0 : previousMeters.electricStart,
            electricEnd: '',
            electricPrice: String(electricPrice || prev.electricPrice || ''),
            waterMode,
            waterStart: previousMeters.waterStart === '' || previousMeters.waterStart == null ? 0 : previousMeters.waterStart,
            waterEnd: '',
            waterPrice: String(waterPrice || prev.waterPrice || ''),
            waterPeople: people,
            services
        }))
    }

    const handleRoomChange = (roomValue) => {
        if (editingInvoice) return
        const selected = findContractByRoomString(roomValue)
        if (selected) {
            applyContractToForm(selected)
        } else {
            setFormData((prev) => ({ ...prev, room: roomValue }))
        }
    }

    const num = (val) => (val === '' || val == null ? null : Number(val))
    const toMonth = (val) => {
        if (!val) return null
        if (typeof val === 'string' && val.length === 7) return `${val}-01`
        return val
    }

    const calcFormTotal = (data) => {
        const rent = Number(data.rent || 0)
        const electricAmount = calcElectricAmount(data)
        const waterAmount = calcWaterAmount(data)
        const servicesTotal = (data.services || []).reduce((sum, s) => {
            const kieuTinh = (s.kieuTinh || 'Theo phong').toLowerCase()
            const donGia = Number(s.amount || 0)
            let soLuong = 1
            if (kieuTinh.includes('nguoi') || kieuTinh.includes('người')) {
                soLuong = Number(data.waterPeople || 1)
            } else if (kieuTinh.includes('chi so') || kieuTinh.includes('chỉ số')) {
                soLuong = Number(s.soLuong || 1)
            }
            return sum + soLuong * donGia
        }, 0)
        return rent + electricAmount + waterAmount + servicesTotal
    }

    const calcElectricAmount = (data) => {
        const elecQty = Math.max(Number(data.electricEnd || 0) - Number(data.electricStart || 0), 0)
        return elecQty * Number(data.electricPrice || 0)
    }

    const calcWaterAmount = (data) => {
        if (data.waterMode === 'CHI_SO') {
            const waterQty = Math.max(Number(data.waterEnd || 0) - Number(data.waterStart || 0), 0)
            return waterQty * Number(data.waterPrice || 0)
        }
        if (data.waterMode === 'THEO_NGUOI') {
            return Number(data.waterPeople || 1) * Number(data.waterPrice || 0)
        }
        return Number(data.waterPrice || 0)
    }

    const buildPayload = (data) => {
        const services = (data.services || []).map((s) => {
            const kieuTinh = (s.kieuTinh || 'Theo phong').toLowerCase()
            const donGia = Number(s.amount || 0)
            let soLuong = 1
            if (kieuTinh.includes('nguoi') || kieuTinh.includes('người')) {
                soLuong = Number(data.waterPeople || 1)
            } else if (kieuTinh.includes('chi so') || kieuTinh.includes('chỉ số')) {
                soLuong = Number(s.soLuong || 1)
            }
            return {
                tenDichVu: s.name,
                kieuTinh: s.kieuTinh,
                soLuong,
                donGia,
                laTuHopDong: s.laTuHopDong !== false
            }
        })
        return {
            maHopDong: data.maHopDong ? Number(data.maHopDong) : null,
            kyHoaDon: toMonth(data.month),
            chiSoDienCu: num(data.electricStart),
            chiSoDienMoi: num(data.electricEnd),
            giaDien: num(data.electricPrice),
            chiSoNuocCu: data.waterMode === 'CHI_SO' ? num(data.waterStart) : null,
            chiSoNuocMoi: data.waterMode === 'CHI_SO' ? num(data.waterEnd) : null,
            giaNuoc: num(data.waterPrice),
            kieuTinhNuoc: data.waterMode,
            tienPhong: num(data.rent),
            tongTien: calcFormTotal(data),
            hanThanhToan: data.dueDate || null,
            trangThai: data.status || 'CHUA_THANH_TOAN',
            ghiChu: data.ghiChu || '',
            danhSachDichVu: services
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!formData.maHopDong) {
            toast.error('Vui long chon phong')
            return
        }
        if (!formData.month) {
            toast.error('Vui long chon thang')
            return
        }
        if (!formData.dueDate) {
            toast.error('Vui long chon han thanh toan')
            return
        }
        if (formData.waterMode === 'CHI_SO' && (formData.waterEnd === '' || formData.waterEnd == null)) {
            toast.error('Vui long nhap chi so nuoc cuoi ky')
            return
        }
        if (formData.electricEnd === '' || formData.electricEnd == null) {
            toast.error('Vui long nhap chi so dien cuoi ky')
            return
        }
        const payload = buildPayload(formData)
        setSubmitting(true)
        try {
            if (editingInvoice) {
                await axios.put(backendUrl + '/api/invoices/' + editingInvoice.id, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                toast.success('Cap nhat hoa don thanh cong')
            } else {
                await axios.post(backendUrl + '/api/invoices', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                toast.success('Tao hoa don thanh cong')
            }
            setShowForm(false)
            await fetchInvoices()
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Co loi xay ra')
        }
        setSubmitting(false)
    }

    const markPaid = async (invoice) => {
        try {
            await axios.put(backendUrl + '/api/invoices/' + invoice.id + '/pay', null, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setPreviewInvoice({ ...invoice, status: 'DA_THANH_TOAN' })
            toast.success('Da danh dau hoa don da thanh toan')
            await fetchInvoices()
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Khong the danh dau da thanh toan')
        }
    }

    const confirmDelete = async () => {
        if (!deletingInvoice) return
        try {
            await axios.delete(backendUrl + '/api/invoices/' + deletingInvoice.id, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setDeletingInvoice(null)
            toast.success('Xoa hoa don thanh cong')
            await fetchInvoices()
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Khong the xoa hoa don')
        }
    }

    const downloadInvoicePdf = async (invoice) => {
        if (!invoice?.id) return
        try {
            const response = await axios.get(backendUrl + '/api/invoices/' + invoice.id + '/pdf', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            })
            const blob = new Blob([response.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            const safeCode = (invoice.code || 'hoa-don').replace(/[^\w-]/g, '_')
            link.setAttribute('download', `${safeCode}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.log(error)
            toast.error('Khong the tai xuong hoa don')
        }
    }

    const formTotal = calcFormTotal(formData)
    const formElectricAmount = calcElectricAmount(formData)
    const formWaterAmount = calcWaterAmount(formData)
    const electricConsumption = Math.max(Number(formData.electricEnd || 0) - Number(formData.electricStart || 0), 0)
    const waterConsumption = Math.max(Number(formData.waterEnd || 0) - Number(formData.waterStart || 0), 0)

    const roomOptions = useMemo(() => activeContracts.map((c) => ({
        value: roomDisplay(c),
        contract: c
    })), [activeContracts])

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
                            {Object.entries(statusConfig).map(([key, config]) => <option key={key} value={config.filterKey}>{config.label}</option>)}
                        </select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1340px]">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Mã hóa đơn</th>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Phòng</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Tiền phòng</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Tiền điện</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Tiền nước</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Dịch vụ</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Kỳ hóa đơn</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Tổng tiền</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Hạn thanh toán</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Trạng thái</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={11} className="px-5 py-12 text-center text-sm text-gray-400">Đang tải dữ liệu...</td>
                                    </tr>
                                ) : filteredInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="px-5 py-12 text-center text-sm text-gray-400">Chưa có hóa đơn nào</td>
                                    </tr>
                                ) : (
                                    filteredInvoices.map((invoice) => {
                                        const items = buildItemsFromInvoice(invoice)
                                        const electricity = items.find((item) => item.name === 'Tiền điện')?.amount || 0
                                        const water = items.find((item) => item.name === 'Tiền nước')?.amount || 0
                                        const services = items.filter((item) => item.name !== 'Tiền phòng' && item.name !== 'Tiền điện' && item.name !== 'Tiền nước').reduce((total, item) => total + item.amount, 0)
                                        const statusInfo = statusConfig[invoice.status] || statusConfig.CHUA_THANH_TOAN
                                        const displayTotal = Number(invoice.tongTien || computeInvoiceTotal(invoice))

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
                                                <td className="px-5 py-4 text-center text-sm text-gray-700">{formatMonth(invoice.month)}</td>
                                                <td className="px-5 py-4 text-center text-base text-gray-900">{formatMoney(displayTotal)}</td>
                                                <td className="px-5 py-4 text-center text-sm text-gray-700">{formatDate(invoice.dueDate)}</td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusInfo.pillClass}`}>
                                                        <span className={`h-2 w-2 rounded-full ${statusInfo.dotClass}`} />
                                                        {statusInfo.label}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button type="button" onClick={() => setPreviewInvoice(invoice)} className="hover:opacity-70" aria-label="Xem hóa đơn"><img className="h-4 w-4" src={assets.icon_xemchitiet} alt="" /></button>
                                                        <button type="button" onClick={() => openEditModal(invoice)} disabled={invoice.status === 'DA_THANH_TOAN'} className={`hover:opacity-70 ${invoice.status === 'DA_THANH_TOAN' ? 'cursor-not-allowed opacity-30' : ''}`} aria-label="Sửa hóa đơn"><img className="h-4 w-4" src={assets.icon_sua} alt="" /></button>
                                                        <button type="button" onClick={() => setDeletingInvoice(invoice)} disabled={invoice.status === 'DA_THANH_TOAN'} className={`hover:opacity-70 ${invoice.status === 'DA_THANH_TOAN' ? 'cursor-not-allowed opacity-30' : ''}`} aria-label="Xóa hóa đơn"><img className="h-4 w-4" src={assets.icon_xoa} alt="" /></button>
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
                                    <select
                                        value={formData.room}
                                        onChange={(event) => handleRoomChange(event.target.value)}
                                        required
                                        disabled={!!editingInvoice}
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E] disabled:bg-gray-50 disabled:text-gray-500"
                                    >
                                        <option value="">-- Chọn phòng --</option>
                                        {roomOptions.map((opt) => <option key={opt.contract.id} value={opt.value}>{opt.value}</option>)}
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-gray-700">Tháng *</span>
                                    <input
                                        type="month"
                                        value={formData.month}
                                        onChange={(event) => setFormData({ ...formData, month: event.target.value })}
                                        required
                                        readOnly={!!editingInvoice}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E] read-only:bg-gray-50 read-only:text-gray-500"
                                    />
                                </label>
                            </div>

                            <div className="rounded-2xl border border-gray-100 p-4">
                                <h4 className="mb-3 font-bold text-gray-900">Tiền điện</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <input
                                            type="number"
                                            min={0}
                                            value={formData.electricStart}
                                            onChange={(event) => setFormData({ ...formData, electricStart: event.target.value })}
                                            readOnly
                                            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 outline-none"
                                            placeholder="Chỉ số đầu kỳ"
                                        />
                                        <p className="mt-1 text-[11px] text-gray-400">Chỉ đọc</p>
                                    </div>
                                    <input type="number" min={0} value={formData.electricEnd} onChange={(event) => setFormData({ ...formData, electricEnd: event.target.value })} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none" placeholder="Chỉ số cuối kỳ" />
                                    <input type="number" min={0} value={formData.electricPrice} onChange={(event) => setFormData({ ...formData, electricPrice: event.target.value })} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none" placeholder="Đơn giá" />
                                </div>
                                <div className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-700">
                                    Tiêu thụ: <span className="font-semibold">{formatNumber(electricConsumption)} kWh</span>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 p-4">
                                <div className="mb-3 flex items-center gap-3">
                                    <h4 className="font-bold text-gray-900">Tiền nước</h4>
                                    <select
                                        value={formData.waterMode}
                                        onChange={(event) => setFormData({ ...formData, waterMode: event.target.value })}
                                        className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]"
                                    >
                                        {Object.entries(waterModes).map(([key, value]) => (
                                            <option key={key} value={key}>Tính theo: {value.label}</option>
                                        ))}
                                    </select>
                                </div>
                                {formData.waterMode === 'CHI_SO' && (
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <input
                                                type="number"
                                                min={0}
                                                value={formData.waterStart}
                                                onChange={(event) => setFormData({ ...formData, waterStart: event.target.value })}
                                                readOnly
                                                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 outline-none"
                                                placeholder="Chỉ số đầu kỳ"
                                            />
                                            <p className="mt-1 text-[11px] text-gray-400">Chỉ đọc</p>
                                        </div>
                                        <input type="number" min={0} value={formData.waterEnd} onChange={(event) => setFormData({ ...formData, waterEnd: event.target.value })} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none" placeholder="Chỉ số cuối kỳ" />
                                        <input type="number" min={0} value={formData.waterPrice} onChange={(event) => setFormData({ ...formData, waterPrice: event.target.value })} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none" placeholder="Đơn giá" />
                                    </div>
                                )}
                                {formData.waterMode === 'THEO_NGUOI' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <input
                                                type="number"
                                                min={1}
                                                value={formData.waterPeople}
                                                onChange={(event) => setFormData({ ...formData, waterPeople: Number(event.target.value) || 1 })}
                                                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none"
                                                placeholder="Số người"
                                            />
                                            <p className="mt-1 text-[11px] text-gray-400">Số người trong phòng</p>
                                        </div>
                                        <input type="number" min={0} value={formData.waterPrice} onChange={(event) => setFormData({ ...formData, waterPrice: event.target.value })} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none" placeholder="Đơn giá/người" />
                                    </div>
                                )}
                                {formData.waterMode === 'THEO_PHONG' && (
                                    <div className="grid grid-cols-1 gap-3">
                                        <input type="number" min={0} value={formData.waterPrice} onChange={(event) => setFormData({ ...formData, waterPrice: event.target.value })} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none" placeholder="Đơn giá phòng" />
                                    </div>
                                )}
                                {formData.waterMode === 'CHI_SO' && (
                                    <div className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-700">
                                        Tiêu thụ: <span className="font-semibold">{formatNumber(waterConsumption)} m³</span>
                                    </div>
                                )}
                                {formData.waterMode === 'THEO_NGUOI' && (
                                    <div className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-700">
                                        Số người: <span className="font-semibold">{formatNumber(formData.waterPeople || 1)}</span> · Đơn giá: {formatMoney(formData.waterPrice || 0)}
                                    </div>
                                )}
                                {formData.waterMode === 'THEO_PHONG' && (
                                    <div className="mt-3 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-700">
                                        Tính theo phòng · Số tiền cố định: {formatMoney(formData.waterPrice || 0)}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl border border-gray-100 p-4">
                                <h4 className="mb-3 font-bold text-gray-900">
                                    Chi tiết chi phí
                                </h4>

                                <div className="divide-y divide-gray-100">
                                    <div className="flex items-center justify-between py-3 text-sm">
                                        <span className="font-medium text-gray-700">
                                            Tiền thuê phòng
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                            {formatMoney(formData.rent === '' ? 0 : Number(formData.rent))}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 text-sm">
                                        <span className="font-medium text-gray-500">
                                            Tiền điện tạm tính
                                        </span>
                                        <span className="font-semibold text-gray-500">
                                            {formatMoney(formElectricAmount)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 text-sm">
                                        <span className="font-medium text-gray-500">
                                            Tiền nước tạm tính
                                        </span>
                                        <span className="font-semibold text-gray-500">
                                            {formatMoney(formWaterAmount)}
                                        </span>
                                    </div>

                                    {formData.services.map((service, index) => {
                                        const kieuTinh = (service.kieuTinh || 'Theo phong').toLowerCase()
                                        const donGia = Number(service.amount || 0)
                                        let soLuong = 1
                                        let unit = 'phòng'
                                        if (kieuTinh.includes('nguoi') || kieuTinh.includes('người')) {
                                            soLuong = formData.waterPeople || 1
                                            unit = 'người'
                                        } else if (kieuTinh.includes('chi so') || kieuTinh.includes('chỉ số')) {
                                            soLuong = Number(service.soLuong || 1)
                                            unit = 'số'
                                        }
                                        const thanhTien = soLuong * donGia
                                        return (
                                            <div
                                                key={`${service.name}-${index}`}
                                                className="py-3 text-sm"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-gray-700">
                                                        {service.name}
                                                    </span>
                                                    <span className="font-semibold text-gray-900">
                                                        {formatMoney(thanhTien)}
                                                    </span>
                                                </div>
                                                <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                                                    <span>SL: {formatNumber(soLuong)} {unit} × {formatNumber(donGia)} VNĐ/{unit}</span>
                                                    <span>{service.kieuTinh || 'Theo phòng'}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="mt-3 rounded-xl bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">
                                        Dịch vụ áp dụng (theo hợp đồng) và dịch vụ bổ sung sẽ được cộng dồn vào tổng hóa đơn.
                                        Thành tiền = đơn giá (hợp đồng) × số lượng theo kiểu tính (theo phòng = 1, theo người = số người trong phòng).
                                    </p>
                                </div>
                            </div>

                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-gray-700">Hạn thanh toán *</span>
                                <input type="date" value={formData.dueDate} onChange={(event) => setFormData({ ...formData, dueDate: event.target.value })} required className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E]" />
                            </label>

                            <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4">
                                <span className="font-bold text-gray-900">Tổng cộng</span>
                                <span className="text-lg font-bold text-[#80001C]">{formatMoney(formTotal)}</span>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
                                <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-[#80001C] py-2.5 text-sm font-medium text-white hover:bg-[#6B0018] disabled:opacity-60">{submitting ? 'Đang xử lý...' : (editingInvoice ? 'Cập nhật' : 'Thêm mới')}</button>
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
                    onDownload={() => downloadInvoicePdf(previewInvoice)}
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
