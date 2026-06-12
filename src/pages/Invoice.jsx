import React, { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { assets } from "../assets/assets";

const invoices = [
  {
    id: 1,
    code: "INV001",
    tenant: "Nguyễn Văn Tú",
    room: "P101 - Nhà trọ Hoàng Long",
    rent: 3500000,
    electricity: 250000,
    water: 80000,
    service: 100000,
    total: 3930000,
    dueDate: "05/06/2026",
    status: "PAID",
  },
  {
    id: 2,
    code: "INV002",
    tenant: "Nguyễn Văn Tú",
    room: "P101 - Nhà trọ Hoàng Long",
    rent: 3500000,
    electricity: 250000,
    water: 80000,
    service: 100000,
    total: 3930000,
    dueDate: "05/06/2026",
    status: "PAID",
  },
  {
    id: 3,
    code: "INV003",
    tenant: "Trần Thị Bích",
    room: "P102 - Nhà trọ Hoàng Long",
    rent: 3500000,
    electricity: 250000,
    water: 80000,
    service: 100000,
    total: 3930000,
    dueDate: "05/06/2026",
    status: "UNPAID",
  },
  {
    id: 4,
    code: "INV004",
    tenant: "Lê Văn Cường",
    room: "P201 - Nhà trọ Minh Anh",
    rent: 3500000,
    electricity: 250000,
    water: 80000,
    service: 100000,
    total: 3930000,
    dueDate: "05/06/2026",
    status: "UNPAID",
  },
  {
    id: 5,
    code: "INV005",
    tenant: "Phạm Văn D",
    room: "P101 - Nhà trọ Hoàng Hà",
    rent: 3500000,
    electricity: 250000,
    water: 80000,
    service: 100000,
    total: 3930000,
    dueDate: "05/06/2026",
    status: "OVERDUE",
  },
  {
    id: 6,
    code: "INV006",
    tenant: "Hoàng Thị E",
    room: "P102 - Nhà trọ Hoàng Hà",
    rent: 3500000,
    electricity: 250000,
    water: 80000,
    service: 100000,
    total: 3930000,
    dueDate: "05/06/2026",
    status: "OVERDUE",
  },
];

const statusConfig = {
  PAID: {
    label: "Đã thanh toán",
    pillClass: "bg-green-50 text-green-600",
    dotClass: "bg-green-500",
    statClass: "bg-green-50 border-green-200 text-green-700",
    iconClass: "bg-green-500",
  },
  UNPAID: {
    label: "Chưa thanh toán",
    pillClass: "bg-orange-50 text-orange-600",
    dotClass: "bg-orange-500",
    statClass: "bg-orange-50 border-orange-200 text-orange-700",
    iconClass: "bg-orange-500",
  },
  OVERDUE: {
    label: "Quá hạn",
    pillClass: "bg-red-50 text-red-600",
    dotClass: "bg-red-500",
    statClass: "bg-red-50 border-red-200 text-red-700",
    iconClass: "bg-red-500",
  },
};

const statusMeta = {
  PAID: { label: "Đã thanh toán", tone: "green" },
  UNPAID: { label: "Chưa thanh toán", tone: "orange" },
  OVERDUE: { label: "Quá hạn", tone: "red" },
};

const Invoice = () => {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("ALL");

  const filteredInvoices = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesSearch =
        !search ||
        [invoice.code, invoice.tenant, invoice.room].some((value) =>
          value.toLowerCase().includes(search),
        );
      const matchesStatus = status === "ALL" || invoice.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [keyword, status]);

  const countByStatus = (value) =>
    invoices.filter((invoice) => invoice.status === value).length;
  const formatNumber = (value) => new Intl.NumberFormat("vi-VN").format(value);
  const formatMoney = (value) => formatNumber(value) + " VNĐ";
  const revenue = invoices
    .filter((invoice) => invoice.status === "PAID")
    .reduce((total, invoice) => total + invoice.total, 0);

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <Sidebar />
      <Header title="Quản lý hóa đơn" />

      <div className="ml-[220px] pt-[80px] px-5 pb-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý hóa đơn
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Quản lý hóa đơn thu tiền phòng và dịch vụ hàng tháng
            </p>
          </div>

          <button className="flex items-center gap-2 bg-[#80001C] hover:bg-[#6B0018] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <span className="text-lg">+</span>
            Tạo hóa đơn
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
          <div className="border rounded-2xl p-5 shadow-sm bg-green-50 border-green-200 text-green-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Đã thanh toán</p>
                <p className="text-3xl font-bold mt-2">
                  {countByStatus("PAID")}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500">
                <img
                  src={assets.icon_invoice}
                  alt=""
                  className="w-6 h-6 brightness-0 invert"
                />
              </div>
            </div>
          </div>

          <div className="border rounded-2xl p-5 shadow-sm bg-orange-50 border-orange-200 text-orange-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Chưa thanh toán</p>
                <p className="text-3xl font-bold mt-2">
                  {countByStatus("UNPAID")}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-500">
                <img
                  src={assets.icon_invoice}
                  alt=""
                  className="w-6 h-6 brightness-0 invert"
                />
              </div>
            </div>
          </div>

          <div className="border rounded-2xl p-5 shadow-sm bg-red-50 border-red-200 text-red-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Quá hạn</p>
                <p className="text-3xl font-bold mt-2">
                  {countByStatus("OVERDUE")}
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500">
                <img
                  src={assets.icon_invoice}
                  alt=""
                  className="w-6 h-6 brightness-0 invert"
                />
              </div>
            </div>
          </div>

          <div className="border rounded-2xl p-5 shadow-sm bg-blue-50 border-blue-200 text-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Doanh thu</p>
                <p className="text-2xl font-bold mt-2">
                  {formatNumber(revenue)}đ
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500">
                <img
                  src={assets.icon_hoadonthanhtoan}
                  alt=""
                  className="w-6 h-6 brightness-0 invert"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                placeholder="Tìm kiếm hóa đơn, khách thuê..."
                className="flex-1 outline-none text-sm bg-transparent text-gray-700 placeholder-gray-400"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>

              {Object.entries(statusMeta).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1240px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                    Mã hóa đơn
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                    Phòng
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                    Tiền phòng
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                    Tiền điện
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                    Tiền nước
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                    Dịch vụ
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                    Tổng tiền
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                    Hạn thanh toán
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
                {filteredInvoices.map((invoice) => {
                  const meta = statusMeta[invoice.status];

                  return (
                    <tr
                      key={invoice.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#FDF2F4] rounded-xl flex items-center justify-center">
                            <img
                              className="w-4 h-4"
                              src={assets.icon_invoice}
                              alt=""
                            />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {invoice.code}
                            </p>
                            <p className="text-xs text-gray-600">
                              {invoice.tenant}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {invoice.room}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 text-center">
                        {formatNumber(invoice.rent)}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 text-center">
                        {formatNumber(invoice.electricity)}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 text-center">
                        {formatNumber(invoice.water)}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 text-center">
                        {formatNumber(invoice.service)}
                      </td>
                      <td className="px-5 py-4 text-base text-gray-900 text-center">
                        {formatMoney(invoice.total)}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 text-center">
                        {invoice.dueDate}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[invoice.status].pillClass}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${statusConfig[invoice.status].dotClass}`}
                          />

                          {statusConfig[invoice.status].label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              type="button"
                              className="text-gray-900 hover:opacity-70 transition-opacity"
                            >
                              <img className='w-4 h-4' src={assets.icon_xemchitiet} alt='' />
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
