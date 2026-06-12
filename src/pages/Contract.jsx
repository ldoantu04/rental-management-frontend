import React, { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { assets } from "../assets/assets";

const contracts = [
  {
    id: 1,
    code: "HD001",
    tenant: "Nguyễn Văn A",
    room: "P101 - Nhà trọ Hoàng Long",
    startDate: "01/01/2026",
    endDate: "31/12/2026",
    deposit: 7000000,
    status: "ACTIVE",
  },
  {
    id: 2,
    code: "HD002",
    tenant: "Trần Thị B",
    room: "P102 - Nhà trọ Hoàng Long",
    startDate: "01/01/2026",
    endDate: "31/12/2026",
    deposit: 7000000,
    status: "ACTIVE",
  },
  {
    id: 3,
    code: "HD003",
    tenant: "Lê Văn C",
    room: "P201 - Nhà trọ Minh Anh",
    startDate: "01/01/2026",
    endDate: "30/06/2026",
    deposit: 7000000,
    status: "EXPIRING",
  },
  {
    id: 4,
    code: "HD004",
    tenant: "Phạm Văn D",
    room: "P101 - Nhà trọ Hoàng Hà",
    startDate: "01/01/2026",
    endDate: "31/12/2026",
    deposit: 7000000,
    status: "ACTIVE",
  },
  {
    id: 5,
    code: "HD005",
    tenant: "Hoàng Thị E",
    room: "P102 - Nhà trọ Hoàng Hà",
    startDate: "01/01/2026",
    endDate: "31/05/2026",
    deposit: 7000000,
    status: "EXPIRED",
  },
  {
    id: 6,
    code: "HD006",
    tenant: "Võ Văn F",
    room: "P201 - Nhà trọ Minh Khánh",
    startDate: "01/01/2026",
    endDate: "30/06/2026",
    deposit: 7000000,
    status: "EXPIRING",
  },
  {
    id: 7,
    code: "HD007",
    tenant: "Nguyễn Văn G",
    room: "P301 - Nhà trọ Minh Khánh",
    startDate: "01/01/2026",
    endDate: "31/12/2026",
    deposit: 7000000,
    status: "CANCELLED",
  },
  {
    id: 8,
    code: "HD008",
    tenant: "Trần Văn H",
    room: "P302 - Nhà trọ Minh Khánh",
    startDate: "01/01/2026",
    endDate: "31/12/2026",
    deposit: 7000000,
    status: "CANCELLED",
  },
  {
    id: 9,
    code: "HD009",
    tenant: "Phạm Văn I",
    room: "P303 - Nhà trọ Minh Khánh",
    startDate: "01/01/2026",
    endDate: "31/12/2026",
    deposit: 7000000,
    status: "CANCELLED",
  },
  {
    id: 10,
    code: "HD010",
    tenant: "Lê Văn K",
    room: "P304 - Nhà trọ Minh Khánh",
    startDate: "01/01/2026",
    endDate: "31/12/2026",
    deposit: 7000000,
    status: "CANCELLED",
  },
  {
    id: 11,
    code: "HD011",
    tenant: "Đỗ Văn L",
    room: "P305 - Nhà trọ Minh Khánh",
    startDate: "01/01/2026",
    endDate: "31/12/2026",
    deposit: 7000000,
    status: "CANCELLED",
  },
  {
    id: 12,
    code: "HD012",
    tenant: "Bùi Văn M",
    room: "P306 - Nhà trọ Minh Khánh",
    startDate: "01/01/2026",
    endDate: "31/12/2026",
    deposit: 7000000,
    status: "CANCELLED",
  },
];

const statusConfig = {
  ACTIVE: {
    label: "Đang hiệu lực",
    pillClass: "bg-green-50 text-green-600",
    dotClass: "bg-green-500",
    statClass: "bg-green-50 border-green-200 text-green-700",
    iconClass: "bg-green-500",
  },
  EXPIRING: {
    label: "Sắp hết hạn",
    pillClass: "bg-orange-50 text-orange-600",
    dotClass: "bg-orange-500",
    statClass: "bg-orange-50 border-orange-200 text-orange-700",
    iconClass: "bg-orange-500",
  },
  EXPIRED: {
    label: "Đã hết hạn",
    pillClass: "bg-red-50 text-red-600",
    dotClass: "bg-red-500",
    statClass: "bg-red-50 border-red-200 text-red-700",
    iconClass: "bg-red-500",
  },
  CANCELLED: {
    label: "Đã hủy",
    pillClass: "bg-gray-100 text-gray-600",
    dotClass: "bg-gray-400",
    statClass: "bg-white border-gray-200 text-gray-700",
    iconClass: "bg-gray-700",
  },
};

const statusMeta = {
    ACTIVE: { label: 'Đang hiệu lực', tone: 'green' },
    EXPIRING: { label: 'Sắp hết hạn', tone: 'orange' },
    EXPIRED: { label: 'Đã hết hạn', tone: 'red' },
    CANCELLED: { label: 'Đã hủy', tone: 'gray' }
}

const Contract = () => {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("ALL");

  const filteredContracts = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return contracts.filter((contract) => {
      const matchesSearch =
        !search ||
        [contract.code, contract.tenant, contract.room].some((value) =>
          value.toLowerCase().includes(search),
        );
      const matchesStatus = status === "ALL" || contract.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [keyword, status]);

  const countByStatus = (value) =>
    contracts.filter((contract) => contract.status === value).length;
  const formatMoney = (value) =>
    new Intl.NumberFormat("vi-VN").format(value) + " VNĐ";

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <Sidebar />
      <Header title="Quản lý hợp đồng" />

      <div className="ml-[220px] pt-[80px] px-5 pb-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý hợp đồng
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Quản lý hợp đồng thuê phòng và theo dõi thời hạn
            </p>
          </div>

          <button className="flex items-center gap-2 bg-[#80001C] hover:bg-[#6B0018] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <span className="text-lg">+</span>
            Tạo hợp đồng
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className={`border rounded-2xl p-5 shadow-sm ${config.statClass}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{config.label}</p>
                  <p className="text-3xl font-bold mt-2">
                    {contracts.filter((c) => c.status === status).length}
                  </p>
                </div>

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.iconClass}`}>
                  <img
                    src={
                      status === "EXPIRING"
                        ? assets.icon_hopdonghethan
                        : assets.icon_contract
                    }
                    alt=""
                    className="w-6 h-6 brightness-0 invert"
                  />
                </div>
              </div>
            </div>
          ))}
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
                placeholder="Tìm kiếm hợp đồng, khách thuê..."
                className="flex-1 outline-none text-sm bg-transparent text-gray-700 placeholder-gray-400"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>

              {Object.entries(statusConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1160px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                    Mã HĐ
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                    Khách thuê
                  </th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-600">
                    Phòng
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                    Ngày bắt đầu
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                    Ngày kết thúc
                  </th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-gray-600">
                    Tiền cọc
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
                {filteredContracts.map((contract) => {
                  const meta = statusMeta[contract.status];

                  return (
                    <tr
                      key={contract.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#FDF2F4] rounded-xl flex items-center justify-center">
                            <img
                              className="w-4 h-4"
                              src={assets.icon_contract}
                              alt=""
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {contract.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {contract.tenant}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {contract.room}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 text-center">
                        {contract.startDate}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 text-center">
                        {contract.endDate}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 text-center">
                        {formatMoney(contract.deposit)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[contract.status].pillClass}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${statusConfig[contract.status].dotClass}`}
                          />

                          {statusConfig[contract.status].label}
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

export default Contract;
