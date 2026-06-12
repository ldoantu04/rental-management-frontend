import React, { useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { assets } from '../assets/assets'

const staffList = [
    { id: 1, code: 'NV001', name: 'Nguyễn Văn Hùng', phone: '0901234567', email: 'hung.nv@rental.com', role: 'Quản lý', motel: 'Nhà trọ Hoàng Long', status: 'WORKING' },
    { id: 2, code: 'NV002', name: 'Trần Thị Mai', phone: '0901234568', email: 'mai.tt@rental.com', role: 'Nhân viên', motel: 'Nhà trọ Hoàng Long', status: 'WORKING' },
    { id: 3, code: 'NV003', name: 'Lê Văn Nam', phone: '0901234569', email: 'nam.lv@rental.com', role: 'Nhân viên', motel: 'Nhà trọ Minh Anh', status: 'WORKING' },
    { id: 4, code: 'NV004', name: 'Phạm Thị Hoa', phone: '0901234570', email: 'hoa.pt@rental.com', role: 'Nhân viên', motel: 'Nhà trọ Hoàng Hà', status: 'WORKING' },
    { id: 5, code: 'NV005', name: 'Hoàng Văn Bình', phone: '0901234571', email: 'binh.hv@rental.com', role: 'Quản lý', motel: 'Nhà trọ Hoàng Long, Minh Anh', status: 'WORKING' },
    { id: 6, code: 'NV006', name: 'Vũ Thị Lan', phone: '0901234572', email: 'lan.vt@rental.com', role: 'Quản lý', motel: 'Nhà trọ Minh Khánh', status: 'LEFT' },
    { id: 7, code: 'NV007', name: 'Đỗ Văn Sơn', phone: '0901234573', email: 'son.dv@rental.com', role: 'Quản lý', motel: 'Nhà trọ Hoàng Long', status: 'WORKING' },
    { id: 8, code: 'NV008', name: 'Bùi Thị Ngọc', phone: '0901234574', email: 'ngoc.bt@rental.com', role: 'Nhân viên', motel: 'Nhà trọ Hoàng Hà', status: 'WORKING' }
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

const Staff = () => {
    const [keyword, setKeyword] = useState('')
    const [role, setRole] = useState('ALL')
    const [status, setStatus] = useState('ALL')
    const [motel, setMotel] = useState('ALL')

    const motelOptions = useMemo(() => [...new Set(staffList.map((staff) => staff.motel))], [])

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
    }, [keyword, role, status, motel])

    const workingCount = staffList.filter((staff) => staff.status === 'WORKING').length
    const leftCount = staffList.filter((staff) => staff.status === 'LEFT').length

    return (
        <div className="min-h-screen bg-[#F6F7FB]">
            <Sidebar />
            <Header title="Quản lý nhân viên" />

            <div className="ml-[220px] pt-[80px] px-5 pb-5">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Quản lý nhân viên
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Quản lý thông tin nhân viên và theo dõi tình trạng làm việc
                        </p>
                    </div>

                    <button
                        className="flex items-center gap-2 bg-[#80001C] hover:bg-[#6B0018] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    >
                        <span className="text-lg">+</span>
                        Thêm nhân viên
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

                    <div className="border rounded-2xl p-5 shadow-sm bg-rose-50 border-rose-200 text-[#80001C]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">
                                    Tổng nhân viên
                                </p>

                                <p className="text-3xl font-bold mt-2">
                                    {staffList.length}
                                </p>
                            </div>

                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#80001C]">
                                <img
                                    src={assets.icon_staff}
                                    alt=""
                                    className="w-6 h-6 brightness-0 invert"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-2xl p-5 shadow-sm bg-green-50 border-green-200 text-green-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">
                                    Đang làm việc
                                </p>

                                <p className="text-3xl font-bold mt-2">
                                    {workingCount}
                                </p>
                            </div>

                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500">
                                <img
                                    src={assets.icon_staff}
                                    alt=""
                                    className="w-6 h-6 brightness-0 invert"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-2xl p-5 shadow-sm bg-gray-50 border-gray-200 text-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">
                                    Đã nghỉ việc
                                </p>

                                <p className="text-3xl font-bold mt-2">
                                    {leftCount}
                                </p>
                            </div>

                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-600">
                                <img
                                    src={assets.icon_staff}
                                    alt=""
                                    className="w-6 h-6 brightness-0 invert"
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Filter */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

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
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Tìm kiếm nhân viên..."
                                className="flex-1 outline-none text-sm bg-transparent"
                            />
                        </div>

                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="bg-gray-100 rounded-xl px-3 py-2.5 text-sm"
                        >
                            <option value="ALL">Tất cả vai trò</option>
                            <option value="Quản lý">Quản lý</option>
                            <option value="Nhân viên">Nhân viên</option>
                        </select>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="bg-gray-100 rounded-xl px-3 py-2.5 text-sm"
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="WORKING">Đang làm việc</option>
                            <option value="LEFT">Đã nghỉ việc</option>
                        </select>

                        <select
                            value={motel}
                            onChange={(e) => setMotel(e.target.value)}
                            className="bg-gray-100 rounded-xl px-3 py-2.5 text-sm"
                        >
                            <option value="ALL">Tất cả nhà trọ</option>

                            {motelOptions.map((item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            ))}
                        </select>

                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
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
                                    <tr
                                        key={staff.id}
                                        className="hover:bg-gray-50/70 transition-colors"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-[#FDF2F4] rounded-xl flex items-center justify-center">
                                                    <img
                                                        src={assets.icon_staff}
                                                        alt=""
                                                        className="w-4 h-4"
                                                    />
                                                </div>

                                                <span className="text-sm font-semibold text-gray-900">
                                                    {staff.code}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-700">{staff.name}</td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{staff.phone}</td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{staff.email}</td>
                                        <td className="px-5 py-4 text-sm text-center text-gray-700">{staff.role}</td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{staff.motel}</td>

                                        <td className="px-5 py-4 text-center">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[staff.status].pillClass}`}
                                            >
                                                <span
                                                    className={`w-2 h-2 rounded-full ${statusConfig[staff.status].dotClass}`}
                                                />

                                                {statusConfig[staff.status].label}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-3">

                                                <button
                                                    type="button"
                                                    className="text-blue-600 hover:opacity-70 transition-opacity"
                                                >
                                                    <img className='w-4 h-4' src={assets.icon_xemprofile} alt='' />
                                        
                                                </button>

                                                <button
                                                    type="button"
                                                    className="text-[#80001C] hover:opacity-70 transition-opacity"
                                                >
                                                    <img className='w-4 h-4' src={assets.icon_sua} alt='' />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="text-red-600 hover:opacity-70 transition-opacity"
                                                >
                                                    <img className='w-4 h-4' src={assets.icon_xoa} alt='' />
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
        </div>
    )
}

export default Staff
