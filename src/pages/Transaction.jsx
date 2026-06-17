import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { assets } from '../assets/assets'
import { RentalContext } from '../context/RentalContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const methodMeta = {
    TIEN_MAT: 'Tiền mặt',
    TRUC_TUYEN: 'Chuyển khoản'
}

const formatMoney = (value) => new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + ' VNĐ'

const formatDateTime = (value) => {
    if (!value) return '-'
    try {
        const date = new Date(value)
        if (isNaN(date.getTime())) return '-'
        return date.toLocaleString('vi-VN', { hour12: false })
    } catch (e) {
        return '-'
    }
}

const buildQuery = (params) => {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') return
        search.append(key, value)
    })
    return search.toString()
}

const Transaction = () => {

    const { backendUrl, token } = useContext(RentalContext)

    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [exporting, setExporting] = useState(false)

    const [keyword, setKeyword] = useState('')
    const [method, setMethod] = useState('ALL')
    const [timeRange, setTimeRange] = useState('ALL')

    const rangeBounds = useMemo(() => {
        if (timeRange === 'ALL') return { tuNgay: null, denNgay: null }
        const now = new Date()
        if (timeRange === 'THIS_MONTH') {
            const tuNgay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
            const denNgay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
            return { tuNgay: tuNgay.toISOString().slice(0, 19), denNgay: denNgay.toISOString().slice(0, 19) }
        }
        if (timeRange === 'LAST_MONTH') {
            const tuNgay = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0)
            const denNgay = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
            return { tuNgay: tuNgay.toISOString().slice(0, 19), denNgay: denNgay.toISOString().slice(0, 19) }
        }
        return { tuNgay: null, denNgay: null }
    }, [timeRange])

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true)
            const query = buildQuery({
                keyword,
                hinhThucTT: method === 'ALL' ? null : method,
                tuNgay: rangeBounds.tuNgay,
                denNgay: rangeBounds.denNgay
            })
            const url = backendUrl + '/api/transactions/search' + (query ? '?' + query : '')
            const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
            setTransactions(response.data || [])
        } catch (error) {
            console.log(error)
            toast.error('Khong the tai danh sach giao dich')
            setTransactions([])
        } finally {
            setLoading(false)
        }
    }, [backendUrl, token, keyword, method, rangeBounds])

    useEffect(() => {
        if (token) {
            fetchTransactions()
        }
    }, [token, fetchTransactions])

    const handleExport = async () => {
        try {
            setExporting(true)
            const query = buildQuery({
                keyword,
                hinhThucTT: method === 'ALL' ? null : method,
                tuNgay: rangeBounds.tuNgay,
                denNgay: rangeBounds.denNgay
            })
            const url = backendUrl + '/api/transactions/export' + (query ? '?' + query : '')
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            })
            const blob = new Blob([response.data], { type: response.data.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
            const downloadUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = downloadUrl
            link.setAttribute('download', 'danh-sach-giao-dich.xlsx')
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(downloadUrl)
            toast.success('Xuat bao cao thanh cong')
        } catch (error) {
            console.log(error)
            toast.error('Khong the xuat bao cao')
        } finally {
            setExporting(false)
        }
    }

    const countByMethod = (value) => transactions.filter((transaction) => transaction.hinhThucTT === value).length

    const getInvoiceCode = (tx) => tx?.hoaDon?.maHoaDon || '-'
    const getTenantName = (tx) => tx?.hoaDon?.hopDong?.khachThue?.hoTen || '-'

    return (
        <div className="min-h-screen bg-[#F6F7FB]">
            <Sidebar />
            <Header title="Quản lý giao dịch" />

            <div className="ml-[220px] px-5 pb-5 pt-[80px]">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Quản lý giao dịch</h1>
                        <p className="mt-1 text-sm text-gray-500">Quản lý các giao dịch thu chi và theo dõi dòng tiền</p>
                    </div>

                    <button type="button" onClick={handleExport} disabled={exporting} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 disabled:opacity-60">
                        <img className="h-4 w-4" src={assets.icon_download} alt="" />
                        {exporting ? 'Đang xuất...' : 'Xuất báo cáo'}
                    </button>
                </div>

                <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-green-700 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Tiền mặt</p>
                                <p className="mt-2 text-3xl font-bold">{countByMethod('TIEN_MAT')}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
                                <img src={assets.icon_transaction} alt="" className="h-6 w-6 brightness-0 invert" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-700 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Chuyển khoản</p>
                                <p className="mt-2 text-3xl font-bold">{countByMethod('TRUC_TUYEN')}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500">
                                <img src={assets.icon_transaction} alt="" className="h-6 w-6 brightness-0 invert" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <div className="flex items-center gap-3 rounded-xl bg-gray-100 px-3 py-2.5">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm kiếm giao dịch..." className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-400" />
                        </div>
                        <select value={method} onChange={(event) => setMethod(event.target.value)} className="rounded-xl bg-gray-100 px-3 py-2.5 text-sm text-gray-700 outline-none">
                            <option value="ALL">Tất cả phương thức</option>
                            {Object.entries(methodMeta).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </select>
                        <select value={timeRange} onChange={(event) => setTimeRange(event.target.value)} className="rounded-xl bg-gray-100 px-3 py-2.5 text-sm text-gray-700 outline-none">
                            <option value="ALL">Tất cả thời gian</option>
                            <option value="THIS_MONTH">Tháng này</option>
                            <option value="LAST_MONTH">Tháng trước</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Mã GD</th>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Bên giao dịch</th>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Hóa đơn</th>
                                    <th className="px-5 py-4 text-right text-sm font-semibold text-gray-600">Số tiền</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Phương thức</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Thời gian</th>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Mô tả</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-500">Đang tải dữ liệu...</td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-500">Không có giao dịch nào phù hợp</td>
                                    </tr>
                                ) : transactions.map((transaction) => (
                                    <tr key={transaction.id} className="transition-colors hover:bg-gray-50/70">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF2F4]">
                                                    <img className="h-4 w-4" src={assets.icon_transaction} alt="" />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">{transaction.maGiaoDich || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{getTenantName(transaction)}</td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{getInvoiceCode(transaction)}</td>
                                        <td className="px-5 py-4 text-right text-base font-semibold text-gray-900">{formatMoney(transaction.soTien)}</td>
                                        <td className="px-5 py-4 text-center text-sm text-gray-700">{methodMeta[transaction.hinhThucTT] || '-'}</td>
                                        <td className="px-5 py-4 text-center text-sm text-gray-700">{formatDateTime(transaction.ngayThanhToan || transaction.ngayTao)}</td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{transaction.ghiChu || '-'}</td>
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

export default Transaction
