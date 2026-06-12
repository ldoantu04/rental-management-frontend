import React, { useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { assets } from '../assets/assets'

const tenants = [
    {
        id: 1,
        name: 'Nguyễn Văn An',
        cccd: '001234567890',
        phone: '0912345678',
        room: 'P101 - Nhà trọ Hoàng Long',
        startDate: '01/01/2026',
        roommates: 1,
        status: 'RENTING'
    },
    {
        id: 2,
        name: 'Trần Thị Bích',
        cccd: '001234567891',
        phone: '0912345679',
        room: 'P102 - Nhà trọ Hoàng Long',
        startDate: '01/01/2026',
        roommates: 1,
        status: 'RENTING'
    },
    {
        id: 3,
        name: 'Lê Văn Cường',
        cccd: '001234567892',
        phone: '0912345680',
        room: 'P201 - Nhà trọ Minh Anh',
        startDate: '01/02/2026',
        roommates: 2,
        status: 'RENTING'
    },
    {
        id: 4,
        name: 'Phạm Thị Dung',
        cccd: '001234567893',
        phone: '0912345681',
        room: 'P101 - Nhà trọ Hoàng Hà',
        startDate: '15/02/2026',
        roommates: 1,
        status: 'RENTING'
    },
    {
        id: 5,
        name: 'Hoàng Thị Em',
        cccd: '001234567894',
        phone: '0912345682',
        room: 'P102 - Nhà trọ Hoàng Hà',
        startDate: '01/03/2026',
        roommates: 1,
        status: 'RENTING'
    },
    {
        id: 6,
        name: 'Võ Văn F',
        cccd: '001234567895',
        phone: '0912345683',
        room: 'P201 - Nhà trọ Minh Khánh',
        startDate: '01/03/2026',
        roommates: 1,
        status: 'UNPAID'
    }
]

const Tenant = () => {
    const [keyword, setKeyword] = useState('')

    const filteredTenants = useMemo(() => {
        const search = keyword.trim().toLowerCase()

        if (!search) return tenants

        return tenants.filter((tenant) =>
            [tenant.name, tenant.cccd, tenant.phone, tenant.room]
                .some((value) => value.toLowerCase().includes(search))
        )
    }, [keyword])

    const rentingCount = tenants.filter(
        (tenant) => tenant.status === 'RENTING'
    ).length

    const unpaidCount = tenants.filter(
        (tenant) => tenant.status === 'UNPAID'
    ).length

    return (
        <div className="min-h-screen bg-[#F6F7FB]">
            <Sidebar />
            <Header title="Quản lý khách thuê" />

            <div className="ml-[220px] pt-[80px] px-5 pb-5">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Quản lý khách thuê
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Quản lý thông tin khách thuê và lịch sử thuê phòng
                        </p>
                    </div>

                    <button
                        className="flex items-center gap-2 bg-[#80001C] hover:bg-[#6B0018] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    >
                        <span className="text-lg">+</span>
                        Thêm khách thuê
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

                    <div className="border rounded-2xl p-5 shadow-sm bg-rose-50 border-rose-200 text-[#80001C]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">
                                    Tổng khách thuê
                                </p>

                                <p className="text-3xl font-bold mt-2">
                                    {tenants.length}
                                </p>
                            </div>

                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#80001C]">
                                <img
                                    src={assets.icon_tenant}
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
                                    Đang thuê
                                </p>

                                <p className="text-3xl font-bold mt-2">
                                    {rentingCount}
                                </p>
                            </div>

                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500">
                                <img
                                    src={assets.icon_tenant}
                                    alt=""
                                    className="w-6 h-6 brightness-0 invert"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-2xl p-5 shadow-sm bg-red-50 border-red-200 text-red-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">
                                    Chưa thanh toán
                                </p>

                                <p className="text-3xl font-bold mt-2">
                                    {unpaidCount}
                                </p>
                            </div>

                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500">
                                <img
                                    src={assets.icon_tenant}
                                    alt=""
                                    className="w-6 h-6 brightness-0 invert"
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Search */}
                <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5">
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
                            placeholder="Tìm theo tên, CCCD hoặc số điện thoại..."
                            className="flex-1 outline-none text-sm bg-transparent text-gray-700 placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1120px]">

                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                                        Họ và tên
                                    </th>

                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                                        CCCD
                                    </th>

                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                                        Số điện thoại
                                    </th>

                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                                        Phòng thuê
                                    </th>

                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                                        Ngày thuê
                                    </th>

                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                                        Người ở cùng
                                    </th>

                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                                        Trạng thái
                                    </th>

                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredTenants.map((tenant) => (
                                    <tr
                                        key={tenant.id}
                                        className="hover:bg-gray-50/70 transition-colors"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-[#FDF2F4] rounded-xl flex items-center justify-center">
                                                    <img
                                                        className="w-4 h-4"
                                                        src={assets.icon_tenant}
                                                        alt=""
                                                    />
                                                </div>

                                                <span className="text-sm font-semibold text-gray-900">
                                                    {tenant.name}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-700">
                                            {tenant.cccd}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-700">
                                            {tenant.phone}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-700">
                                            {tenant.room}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-700">
                                            {tenant.startDate}
                                        </td>

                                        <td className="px-5 py-4 text-center text-sm text-gray-700">
                                            {tenant.roommates}
                                        </td>

                                        <td className="px-5 py-4 text-center">
                                            {tenant.status === 'RENTING' ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                                                    Đang thuê
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
                                                    Chưa thanh toán
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-3">

                                                <button
                                                    type="button"
                                                    className="text-gray-900 hover:opacity-70 transition-opacity"
                                                >
                                                    <img className='w-4 h-4' src={assets.icon_xemchitiet} alt='Motel' />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="text-[#80001C] hover:opacity-70 transition-opacity"
                                                >
                                                    <img className='w-4 h-4' src={assets.icon_sua} alt='Motel' />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="text-red-600 hover:opacity-70 transition-opacity"
                                                >
                                                    <img className='w-4 h-4' src={assets.icon_xoa} alt='Motel' />
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

export default Tenant