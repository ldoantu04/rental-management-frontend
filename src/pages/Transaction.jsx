import React, { useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'

const initialTransactions = [
    { id: 1, code: 'TX001', tenant: 'Nguyễn Văn A', invoice: 'INV002', amount: 3500000, method: 'TRANSFER', date: '2026-06-01', description: 'Thu tiền phòng tháng 05/2026' },
    { id: 2, code: 'TX002', tenant: 'Nguyễn Văn A', invoice: 'INV002', amount: 3500000, method: 'CASH', date: '2026-06-01', description: 'Thu tiền phòng tháng 05/2026' },
    { id: 3, code: 'TX003', tenant: 'Trần Thị B', invoice: 'INV003', amount: 3500000, method: 'TRANSFER', date: '2026-06-01', description: 'Thu tiền phòng tháng 05/2026' },
    { id: 4, code: 'TX004', tenant: 'Lê Văn C', invoice: 'INV004', amount: 3500000, method: 'CASH', date: '2026-06-01', description: 'Thu tiền phòng tháng 05/2026' },
    { id: 5, code: 'TX005', tenant: 'Phạm Văn D', invoice: 'INV005', amount: 3500000, method: 'TRANSFER', date: '2026-06-01', description: 'Thu tiền phòng tháng 05/2026' }
]

const methodMeta = {
    CASH: 'Tiền mặt',
    TRANSFER: 'Chuyển khoản'
}

const formatDate = (value) => {
    if (!value) return '-'
    const [year, month, day] = value.split('-')
    return `${day}/${month}/${year}`
}

const formatMoney = (value) => new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + ' VNĐ'

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

const Transaction = () => {
    const [transactions, setTransactions] = useState(initialTransactions)
    const [keyword, setKeyword] = useState('')
    const [method, setMethod] = useState('ALL')
    const [timeRange, setTimeRange] = useState('ALL')
    const [detailTransaction, setDetailTransaction] = useState(null)
    const [deletingTransaction, setDeletingTransaction] = useState(null)

    const filteredTransactions = useMemo(() => {
        const search = keyword.trim().toLowerCase()

        return transactions.filter((transaction) => {
            const matchesSearch =
                !search ||
                [transaction.code, transaction.tenant, transaction.invoice, transaction.description].some((value) =>
                    value.toLowerCase().includes(search)
                )
            const matchesMethod = method === 'ALL' || transaction.method === method

            return matchesSearch && matchesMethod
        })
    }, [keyword, method, transactions])

    const countByMethod = (value) => transactions.filter((transaction) => transaction.method === value).length

    const confirmDelete = () => {
        setTransactions((prev) => prev.filter((transaction) => transaction.id !== deletingTransaction.id))
        setDeletingTransaction(null)
        toast.success('Xóa giao dịch thành công')
    }

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

                    <button type="button" onClick={() => toast.info('Tính năng xuất báo cáo sẽ được nối backend sau')} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50">
                        <img className="h-4 w-4" src={assets.icon_download} alt="" />
                        Xuất báo cáo
                    </button>
                </div>

                <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-green-700 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">Tiền mặt</p>
                                <p className="mt-2 text-3xl font-bold">{countByMethod('CASH')}</p>
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
                                <p className="mt-2 text-3xl font-bold">{countByMethod('TRANSFER')}</p>
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
                        <table className="w-full min-w-[1120px]">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Mã GD</th>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Bên giao dịch</th>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Hóa đơn</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Số tiền</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Phương thức</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Thời gian</th>
                                    <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">Mô tả</th>
                                    <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="transition-colors hover:bg-gray-50/70">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FDF2F4]">
                                                    <img className="h-4 w-4" src={assets.icon_transaction} alt="" />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">{transaction.code}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{transaction.tenant}</td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{transaction.invoice}</td>
                                        <td className="px-5 py-4 text-center text-base text-gray-900">{formatMoney(transaction.amount)}</td>
                                        <td className="px-5 py-4 text-center text-sm text-gray-700">{methodMeta[transaction.method]}</td>
                                        <td className="px-5 py-4 text-center text-sm text-gray-700">{formatDate(transaction.date)}</td>
                                        <td className="px-5 py-4 text-sm text-gray-700">{transaction.description}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-center gap-3">
                                                <button type="button" onClick={() => setDetailTransaction(transaction)} className="hover:opacity-70" aria-label="Xem giao dịch">
                                                    <img className="h-4 w-4" src={assets.icon_xemchitiet} alt="" />
                                                </button>
                                                <button type="button" onClick={() => setDeletingTransaction(transaction)} className="hover:opacity-70" aria-label="Xóa giao dịch">
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

            {detailTransaction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-5">
                            <h3 className="text-lg font-bold text-gray-900">Chi tiết giao dịch</h3>
                            <button type="button" onClick={() => setDetailTransaction(null)} className="rounded-lg p-1.5 hover:bg-gray-100">
                                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                            <p className="text-sm font-medium text-[#80001C]">{detailTransaction.code}</p>
                            <p className="mt-2 text-2xl font-bold text-gray-900">{formatMoney(detailTransaction.amount)}</p>
                            <p className="mt-1 text-sm text-gray-500">{detailTransaction.description}</p>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                            {[
                                ['Bên giao dịch', detailTransaction.tenant],
                                ['Hóa đơn', detailTransaction.invoice],
                                ['Phương thức', methodMeta[detailTransaction.method]],
                                ['Thời gian', formatDate(detailTransaction.date)]
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-xl bg-gray-50 p-4">
                                    <p className="text-xs font-medium text-gray-400">{label}</p>
                                    <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
                                </div>
                            ))}
                        </div>

                        <button type="button" onClick={() => setDetailTransaction(null)} className="mt-6 w-full rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Đóng
                        </button>
                    </div>
                </div>
            )}

            {deletingTransaction && (
                <ConfirmDialog
                    title="Xác nhận xóa giao dịch"
                    message={`Bạn có chắc chắn muốn xóa giao dịch ${deletingTransaction.code}? Hành động này không thể hoàn tác.`}
                    onCancel={() => setDeletingTransaction(null)}
                    onConfirm={confirmDelete}
                />
            )}
        </div>
    )
}

export default Transaction
