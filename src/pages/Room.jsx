import React, { useContext, useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { RentalContext } from '../context/RentalContext'

const emptyForm = {
    maPhong: '',
    maNhaTro: '',
    giaThue: '',
    dienTich: '',
    soNguoi: '',
    tang: '',
    trangThai: 'TRONG',
    ghiChu: ''
}

const statusConfig = {
    TRONG: {
        label: 'Phòng trống',
        pillClass: 'bg-green-50 text-green-600',
        dotClass: 'bg-green-500',
        statClass: 'bg-green-50 border-green-200 text-green-700',
        iconClass: 'bg-green-500'
    },
    DANG_THUE: {
        label: 'Đang thuê',
        pillClass: 'bg-rose-50 text-rose-700',
        dotClass: 'bg-[#80001C]',
        statClass: 'bg-rose-50 border-rose-200 text-[#80001C]',
        iconClass: 'bg-[#80001C]'
    },
    BAO_TRI: {
        label: 'Bảo trì',
        pillClass: 'bg-orange-50 text-orange-600',
        dotClass: 'bg-orange-500',
        statClass: 'bg-orange-50 border-orange-200 text-orange-700',
        iconClass: 'bg-orange-500'
    }
}

const Room = () => {
    const { backendUrl, token } = useContext(RentalContext)

    const [rooms, setRooms] = useState([])
    const [motels, setMotels] = useState([])
    const [searchKeyword, setSearchKeyword] = useState('')
    const [selectedMotel, setSelectedMotel] = useState('ALL')
    const [selectedStatus, setSelectedStatus] = useState('ALL')
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingRoom, setEditingRoom] = useState(null)
    const [deletingRoom, setDeletingRoom] = useState(null)
    const [formData, setFormData] = useState(emptyForm)

    const fetchRooms = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/rooms', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setRooms(response.data)
        } catch (error) {
            console.log(error)
            toast.error('Không thể tải danh sách phòng trọ')
        }
        setLoading(false)
    }

    const fetchMotels = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/motels', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setMotels(response.data)
        } catch (error) {
            console.log(error)
        }
    }

    const searchRooms = async (keyword) => {
        if (!keyword.trim()) {
            fetchRooms()
            return
        }
        try {
            const response = await axios.get(backendUrl + '/api/rooms/search?maPhong=' + keyword, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setRooms(response.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (token) {
            fetchRooms()
            fetchMotels()
        }
    }, [token])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (token) {
                searchRooms(searchKeyword)
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [searchKeyword])

    const roomStats = useMemo(() => {
        return rooms.reduce(
            (stats, room) => ({
                ...stats,
                [room.trangThai]: (stats[room.trangThai] || 0) + 1
            }),
            { TRONG: 0, DANG_THUE: 0, BAO_TRI: 0 }
        )
    }, [rooms])

    const filteredRooms = useMemo(() => {
        return rooms.filter((room) => {
            const matchesMotel = selectedMotel === 'ALL' || room.nhaTro?.id === Number(selectedMotel)
            const matchesStatus = selectedStatus === 'ALL' || room.trangThai === selectedStatus

            return matchesMotel && matchesStatus
        })
    }, [rooms, selectedMotel, selectedStatus])

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ'
    }

    const openCreateModal = () => {
        setEditingRoom(null)
        setFormData({
            ...emptyForm,
            maNhaTro: motels[0]?.id?.toString() || ''
        })
        setShowModal(true)
    }

    const openEditModal = (room) => {
        setEditingRoom(room)
        setFormData({
            maPhong: room.maPhong || '',
            maNhaTro: room.nhaTro?.id?.toString() || '',
            giaThue: room.giaThue ?? '',
            dienTich: room.dienTich ?? '',
            soNguoi: room.soNguoi ?? '',
            tang: room.tang ?? '',
            trangThai: room.trangThai || 'TRONG',
            ghiChu: room.ghiChu || ''
        })
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const payload = {
            maNhaTro: Number(formData.maNhaTro),
            maPhong: formData.maPhong,
            giaThue: Number(formData.giaThue),
            dienTich: Number(formData.dienTich),
            soNguoi: Number(formData.soNguoi),
            tang: Number(formData.tang),
            trangThai: formData.trangThai,
            ghiChu: formData.ghiChu
        }

        try {
            if (editingRoom) {
                await axios.put(backendUrl + '/api/rooms/' + editingRoom.id, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                toast.success('Cập nhật phòng trọ thành công')
            } else {
                await axios.post(backendUrl + '/api/rooms', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                toast.success('Thêm phòng trọ thành công')
            }
            setShowModal(false)
            fetchRooms()
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
        }
    }

    const handleDelete = async () => {
        if (!deletingRoom) return
        try {
            await axios.delete(backendUrl + '/api/rooms/' + deletingRoom.id, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('Xóa phòng trọ thành công')
            setDeletingRoom(null)
            fetchRooms()
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Không thể xóa phòng trọ')
        }
    }

    return (
        <div className="min-h-screen bg-[#F6F7FB]">
            <Sidebar />
            <Header title="Quản lý phòng trọ" />

            <div className="ml-[220px] pt-[80px] px-5 pb-5">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Quản lý phòng trọ
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Quản lý chi tiết các phòng trong từng nhà trọ
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-[#80001C] hover:bg-[#6B0018] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    >
                        <span className="text-lg">+</span>
                        Thêm phòng
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                    {Object.entries(statusConfig).map(([status, config]) => (
                        <div
                            key={status}
                            className={`border rounded-2xl p-5 shadow-sm ${config.statClass}`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">{config.label}</p>
                                    <p className="text-3xl font-bold mt-2">{roomStats[status]}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.iconClass}`}>
                                    <img className="w-6 h-6 brightness-0 invert" src={assets.icon_room} alt="" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-2.5">
                            <svg
                                className="w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                placeholder="Tìm kiếm phòng..."
                                className="flex-1 outline-none text-sm bg-transparent text-gray-700 placeholder-gray-400"
                            />
                        </div>

                        <select
                            value={selectedMotel}
                            onChange={(e) => setSelectedMotel(e.target.value)}
                            className="bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none cursor-pointer"
                        >
                            <option value="ALL">Tất cả nhà trọ</option>
                            {motels.map((motel) => (
                                <option key={motel.id} value={motel.id}>
                                    {motel.tenTro}
                                </option>
                            ))}
                        </select>

                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none cursor-pointer"
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            {Object.entries(statusConfig).map(([status, config]) => (
                                <option key={status} value={status}>
                                    {config.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px]">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Mã phòng</th>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Nhà trọ</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Giá thuê</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Diện tích</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Số người tối đa</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Trạng thái</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                ) : filteredRooms.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                                            Chưa có phòng trọ phù hợp
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRooms.map((room) => {
                                        const config = statusConfig[room.trangThai] || statusConfig.TRONG

                                        return (
                                            <tr key={room.id} className="hover:bg-gray-50/70 transition-colors">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-[#FDF2F4] rounded-xl flex items-center justify-center">
                                                            <img className="w-4 h-4" src={assets.icon_room} alt="" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {room.maPhong}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-700">{room.nhaTro?.tenTro || '-'}</td>
                                                <td className="px-5 py-4 text-sm font-semibold text-gray-900 text-center">
                                                    {formatCurrency(room.giaThue)}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-gray-700 text-center">{room.dienTich} m²</td>
                                                <td className="px-5 py-4 text-sm text-gray-700 text-center">{room.soNguoi} người</td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.pillClass}`}>
                                                        <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
                                                        {config.label}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(room)}
                                                            className="text-[#80001C] hover:opacity-70 transition-opacity"
                                                            aria-label="Sửa phòng"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingRoom(room)}
                                                            className="text-red-600 hover:opacity-70 transition-opacity"
                                                            aria-label="Xóa phòng"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
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

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingRoom ? 'Chỉnh sửa phòng trọ' : 'Thêm phòng trọ mới'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            >
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Mã phòng</label>
                                    <input
                                        type="text"
                                        value={formData.maPhong}
                                        onChange={(e) => setFormData({ ...formData, maPhong: e.target.value })}
                                        placeholder="Nhập mã phòng"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E] transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nhà trọ</label>
                                    <select
                                        value={formData.maNhaTro}
                                        onChange={(e) => setFormData({ ...formData, maNhaTro: e.target.value })}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E] transition-all bg-white cursor-pointer"
                                        required
                                    >
                                        {motels.map((motel) => (
                                            <option key={motel.id} value={motel.id}>
                                                {motel.tenTro}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Giá thuê</label>
                                    <input
                                        type="number"
                                        value={formData.giaThue}
                                        onChange={(e) => setFormData({ ...formData, giaThue: e.target.value })}
                                        placeholder="Nhập giá thuê"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E] transition-all"
                                        min={0}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Diện tích</label>
                                    <input
                                        type="number"
                                        value={formData.dienTich}
                                        onChange={(e) => setFormData({ ...formData, dienTich: e.target.value })}
                                        placeholder="Nhập diện tích"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E] transition-all"
                                        min={1}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Số người tối đa</label>
                                    <input
                                        type="number"
                                        value={formData.soNguoi}
                                        onChange={(e) => setFormData({ ...formData, soNguoi: e.target.value })}
                                        placeholder="Số người"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E] transition-all"
                                        min={1}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tầng</label>
                                    <input
                                        type="number"
                                        value={formData.tang}
                                        onChange={(e) => setFormData({ ...formData, tang: e.target.value })}
                                        placeholder="Tầng"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E] transition-all"
                                        min={1}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái</label>
                                    <select
                                        value={formData.trangThai}
                                        onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E] transition-all bg-white cursor-pointer"
                                    >
                                        {Object.entries(statusConfig).map(([status, config]) => (
                                            <option key={status} value={status}>
                                                {config.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ghi chú</label>
                                <textarea
                                    value={formData.ghiChu}
                                    onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                                    placeholder="Nhập ghi chú (tùy chọn)"
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E] transition-all resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 border border-gray-300 text-gray-700 font-medium text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#7A1B2E] hover:bg-[#611624] text-white font-medium text-sm py-2.5 rounded-xl transition-colors cursor-pointer"
                                >
                                    {editingRoom ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deletingRoom && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900">Xác nhận xóa phòng trọ</h3>
                        <p className="mt-3 text-sm leading-6 text-gray-500">
                            Bạn có chắc chắn muốn xóa phòng trọ <span className="font-semibold text-gray-900">{deletingRoom.maPhong}</span>? Hành động này không thể hoàn tác.
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDeletingRoom(null)}
                                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
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

export default Room
