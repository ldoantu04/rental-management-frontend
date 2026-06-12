import React, { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { assets } from "../assets/assets";

const transactions = [
  {
    id: 1,
    code: "TX001",
    tenant: "Nguyễn Văn A",
    invoice: "INV002",
    amount: 3500000,
    method: "TRANSFER",
    date: "01/06/2026",
    description: "Thu tiền phòng tháng 05/2026",
  },
  {
    id: 2,
    code: "TX002",
    tenant: "Nguyễn Văn A",
    invoice: "INV002",
    amount: 3500000,
    method: "CASH",
    date: "01/06/2026",
    description: "Thu tiền phòng tháng 05/2026",
  },
  {
    id: 3,
    code: "TX003",
    tenant: "Trần Thị B",
    invoice: "INV003",
    amount: 3500000,
    method: "TRANSFER",
    date: "01/06/2026",
    description: "Thu tiền phòng tháng 05/2026",
  },
  {
    id: 4,
    code: "TX004",
    tenant: "Lê Văn C",
    invoice: "INV004",
    amount: 3500000,
    method: "CASH",
    date: "01/06/2026",
    description: "Thu tiền phòng tháng 05/2026",
  },
  {
    id: 5,
    code: "TX005",
    tenant: "Phạm Văn D",
    invoice: "INV005",
    amount: 3500000,
    method: "TRANSFER",
    date: "01/06/2026",
    description: "Thu tiền phòng tháng 05/2026",
  },
];

const methodMeta = {
  CASH: "Tiền mặt",
  TRANSFER: "Chuyển khoản",
};

const Transaction = () => {
  const [keyword, setKeyword] = useState("");
  const [method, setMethod] = useState("ALL");
  const [timeRange, setTimeRange] = useState("ALL");

  const filteredTransactions = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !search ||
        [
          transaction.code,
          transaction.tenant,
          transaction.invoice,
          transaction.description,
        ].some((value) => value.toLowerCase().includes(search));
      const matchesMethod = method === "ALL" || transaction.method === method;

      return matchesSearch && matchesMethod;
    });
  }, [keyword, method]);

  const countByMethod = (value) =>
    transactions.filter((transaction) => transaction.method === value).length;
  const formatMoney = (value) =>
    new Intl.NumberFormat("vi-VN").format(value) + " VNĐ";

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <Sidebar />
      <Header title="Quản lý giao dịch" />

      <div className="ml-[220px] pt-[80px] px-5 pb-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý giao dịch
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Quản lý các giao dịch thu chi và theo dõi dòng tiền
            </p>
          </div>

          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors">
            <img className='w-4 h-4' src={assets.icon_download} alt='' />
            Xuất báo cáo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="border rounded-2xl p-5 shadow-sm bg-green-50 border-green-200 text-green-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Tiền mặt</p>

                <p className="text-3xl font-bold mt-2">
                  {countByMethod("CASH")}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500">
                <img
                  src={assets.icon_transaction}
                  alt=""
                  className="w-6 h-6 brightness-0 invert"
                />
              </div>
            </div>
          </div>

          <div className="border rounded-2xl p-5 shadow-sm bg-blue-50 border-blue-200 text-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Chuyển khoản</p>

                <p className="text-3xl font-bold mt-2">
                  {countByMethod("TRANSFER")}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500">
                <img
                  src={assets.icon_transaction}
                  alt=""
                  className="w-6 h-6 brightness-0 invert"
                />
              </div>
            </div>
          </div>
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
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm giao dịch..."
                className="flex-1 outline-none text-sm bg-transparent text-gray-700 placeholder-gray-400"
              />
            </div>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả phương thức</option>

              {Object.entries(methodMeta).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả thời gian</option>

              <option value="THIS_MONTH">Tháng này</option>

              <option value="LAST_MONTH">Tháng trước</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1060px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                    Mã GD
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                    Bên giao dịch
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                    Hóa đơn
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                    Số tiền
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                    Phương thức
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                    Thời gian
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                    Mô tả
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#FDF2F4] rounded-xl flex items-center justify-center">
                          <img
                            className="w-4 h-4"
                            src={assets.icon_transaction}
                            alt=""
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {transaction.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {transaction.tenant}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {transaction.invoice}
                    </td>
                    <td className="px-5 py-4 text-base text-gray-900 text-center">
                      {formatMoney(transaction.amount)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 text-center">
                      {methodMeta[transaction.method]}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 text-center">
                      {transaction.date}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {transaction.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transaction;
