import React, { useContext, useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { assets } from '../assets/assets'
import { RentalContext } from '../context/RentalContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Motel = () => {

    const { backendUrl, token } = useContext(RentalContext)
    const [motels, setMotels] = useState([])
    const [searchKeyword, setSearchKeyword] = useState('')
    const [loading, setLoading] = useState(true)

    // Modal states
    const [showModal, setShowModal] = useState(false)
    const [editingMotel, setEditingMotel] = useState(null)
    const [formData, setFormData] = useState({
        tenTro: '',
        diaChi: '',
        soTang: '',
        tongPhong: '',
        trangThai: 'HOAT_DONG',
        ghiChu: ''
    })

    const fetchMotels = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/motels', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setMotels(response.data)
        } catch (error) {
            console.log(error)
            toast.error('Không thể tải danh sách nhà trọ')
        }
        setLoading(false)
    }

    const searchMotels = async (keyword) => {
        if (!keyword.trim()) {
            fetchMotels()
            return
        }
        try {
            const response = await axios.get(backendUrl + '/api/motels/search?keyword=' + keyword, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setMotels(response.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (token) {
            fetchMotels()
        }
    }, [token])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (token) {
                searchMotels(searchKeyword)
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [searchKeyword])

    const openCreateModal = () => {
        setEditingMotel(null)
        setFormData({
            tenTro: '',
            diaChi: '',
            soTang: '',
            tongPhong: '',
            trangThai: 'HOAT_DONG',
            ghiChu: ''
        })
        setShowModal(true)
    }

    const openEditModal = (motel) => {
        setEditingMotel(motel)
        setFormData({
            tenTro: motel.tenTro || '',
            diaChi: motel.diaChi || '',
            soTang: motel.soTang || '',
            tongPhong: motel.tongPhong || '',
            trangThai: motel.trangThai || 'HOAT_DONG',
            ghiChu: motel.ghiChu || ''
        })
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const payload = {
                ...formData,
                soTang: parseInt(formData.soTang),
                tongPhong: parseInt(formData.tongPhong)
            }

            if (editingMotel) {
                await axios.put(backendUrl + '/api/motels/' + editingMotel.id, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                toast.success('Cập nhật nhà trọ thành công')
            } else {
                await axios.post(backendUrl + '/api/motels', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                toast.success('Thêm nhà trọ thành công')
            }
            setShowModal(false)
            fetchMotels()
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa nhà trọ này?')) return
        try {
            await axios.delete(backendUrl + '/api/motels/' + id, {
                headers: { Authorization: `Bearer ${token}` }
            })
            toast.success('Xóa nhà trọ thành công')
            fetchMotels()
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Không thể xóa nhà trọ')
        }
    }

    return (
        <div className="min-h-screen bg-[#F6F7FB]">
            <Sidebar />
            <Header title='Quản lý nhà trọ' />

             <div className="ml-[220px] pt-[80px] px-5 pb-5">

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Quản lý nhà trọ
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Quản lý thông tin các nhà trọ và tài sản cho thuê
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-[#80001C] hover:bg-[#6B0018] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    >
                        <span className="text-lg">+</span>
                        Thêm nhà trọ
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5">
                    <div className="flex items-center gap-3">
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
                            placeholder="Tìm kiếm nhà trọ..."
                            className="flex-1 outline-none text-sm bg-transparent"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    <div className='overflow-x-auto'>
                        <table className='w-full'>
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Tên nhà trọ</th>
                                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Địa chỉ</th>
                                <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Tổng phòng</th>
                                <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Số tầng</th>
                                <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Trạng thái</th>
                                <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Thao tác</th>
                            </tr>
                        </thead>
                            <tbody className='divide-y divide-gray-50'>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className='text-center py-12 text-gray-400 text-sm'>Đang tải dữ liệu...</td>
                                    </tr>
                                ) : motels.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className='text-center py-12 text-gray-400 text-sm'>Chưa có nhà trọ nào</td>
                                    </tr>
                                ) : (
                                    motels.map((motel) => (
                                        <tr key={motel.id} className='hover:bg-gray-50/50 transition-colors'>
                                            <td className='px-5 py-4'>
                                                <div className='flex items-center gap-3'>
                                                        <div className="w-9 h-9 bg-[#FDF2F4] rounded-xl flex items-center justify-center">
                                                        <img className='w-4 h-4' src={assets.icon_motel} alt='Motel' />
                                                    </div>
                                                    <span className='text-sm font-medium text-gray-900'>{motel.tenTro}</span>
                                                </div>
                                            </td>
                                            <td className='px-5 py-4 text-sm text-gray-600'>{motel.diaChi}</td>
                                            <td className='px-5 py-4 text-sm text-gray-600 text-center'>{motel.tongPhong}</td>
                                            <td className='px-5 py-4 text-sm text-gray-600 text-center'>{motel.soTang}</td>
                                            <td className='px-5 py-4 text-center'>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium${motel.trangThai === "HOAT_DONG" ? "bg-green-50 text-green-600": "bg-red-50 text-red-600"}`}>
                                                    <span className={`w-2 h-2 rounded-full${motel.trangThai === "HOAT_DONG" ? "bg-green-500": "bg-red-500"}`}/>
                                                    {motel.trangThai === "HOAT_DONG" ? "Hoạt động" : "Ngừng hoạt động"}
                                                </span>
                                            </td>
                                            <td className='px-5 py-4'>
                                                <div className='flex items-center justify-center gap-2'>
                                                    <button
                                                        onClick={() => openEditModal(motel)}
                                                        className="text-[#80001C] hover:opacity-70 transition-opacity"
                                                    >
                                                        <svg className='w-4 h-4 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(motel.id)}
                                                        className="text-red-500 hover:opacity-70 transition-opacity"
                                                    >
                                                        <svg className='w-4 h-4 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Thêm/Sửa Nhà Trọ */}
            {showModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
                    <div className='bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto'>
                        <div className='flex items-center justify-between p-6 border-b border-gray-100'>
                            <h3 className='text-lg font-bold text-gray-900'>
                                {editingMotel ? 'Chỉnh sửa nhà trọ' : 'Thêm nhà trọ mới'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className='p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer'>
                                <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className='p-6 space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1.5'>Tên nhà trọ</label>
                                <input
                                    type='text'
                                    value={formData.tenTro}
                                    onChange={(e) => setFormData({ ...formData, tenTro: e.target.value })}
                                    placeholder='Nhập tên nhà trọ'
                                    className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E] transition-all'
                                    required
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1.5'>Địa chỉ</label>
                                <input
                                    type='text'
                                    value={formData.diaChi}
                                    onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                                    placeholder='Nhập địa chỉ'
                                    className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E] transition-all'
                                    required
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1.5'>Số tầng</label>
                                    <input
                                        type='number'
                                        value={formData.soTang}
                                        onChange={(e) => setFormData({ ...formData, soTang: e.target.value })}
                                        placeholder='Số tầng'
                                        className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E] transition-all'
                                        required
                                        min={1}
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 mb-1.5'>Tổng phòng</label>
                                    <input
                                        type='number'
                                        value={formData.tongPhong}
                                        onChange={(e) => setFormData({ ...formData, tongPhong: e.target.value })}
                                        placeholder='Tổng phòng'
                                        className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E] transition-all'
                                        required
                                        min={1}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1.5'>Trạng thái</label>
                                <select
                                    value={formData.trangThai}
                                    onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
                                    className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E] transition-all bg-white cursor-pointer'
                                >
                                    <option value='HOAT_DONG'>Hoạt động</option>
                                    <option value='NGUNG'>Ngừng hoạt động</option>
                                </select>
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1.5'>Ghi chú</label>
                                <textarea
                                    value={formData.ghiChu}
                                    onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                                    placeholder='Nhập ghi chú (tùy chọn)'
                                    rows={3}
                                    className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#7A1B2E] focus:ring-1 focus:ring-[#7A1B2E] transition-all resize-none'
                                />
                            </div>

                            <div className='flex gap-3 pt-2'>
                                <button
                                    type='button'
                                    onClick={() => setShowModal(false)}
                                    className='flex-1 border border-gray-300 text-gray-700 font-medium text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer'
                                >
                                    Hủy
                                </button>
                                <button
                                    type='submit'
                                    className='flex-1 bg-[#7A1B2E] hover:bg-[#611624] text-white font-medium text-sm py-2.5 rounded-xl transition-colors cursor-pointer'
                                >
                                    {editingMotel ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Motel