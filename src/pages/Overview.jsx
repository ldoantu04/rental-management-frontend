import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { assets } from "../assets/assets";
import { RentalContext } from "../context/RentalContext";
import axios from "axios";
import { toast } from "react-toastify";

const Overview = () => {
  const { backendUrl, token } = useContext(RentalContext);
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOverviewData(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Không thể tải dữ liệu tổng quan");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      fetchOverview();
    }
  }, [token]);

  const data = overviewData || {
    tongDoanhThu: 0,
    phongDangThue: 0,
    tongPhong: 0,
    hoaDonChuaThanhToan: 0,
    hopDongSapHetHan: 0,
    hopDongSapHet: [],
    khachTreHanThanhToan: [],
  };

  const statCards = [
    {
      label: "TỔNG DOANH THU THÁNG",
      value: new Intl.NumberFormat("vi-VN").format(data.tongDoanhThu) + " đ",
      icon: assets.icon_tongdoanhthu,
      bgIcon: "#80001C",
    },
    {
      label: "PHÒNG ĐANG THUÊ",
      value: `${data.phongDangThue} / ${data.tongPhong}`,
      icon: assets.icon_phongdangthue,
      bgIcon: "#F97316",
    },
    {
      label: "HÓA ĐƠN CHƯA THANH TOÁN",
      value: `${data.hoaDonChuaThanhToan} hóa đơn`,
      icon: assets.icon_hoadonthanhtoan,
      bgIcon: "#DC2626",
    },
    {
      label: "HỢP ĐỒNG SẮP HẾT HẠN",
      value: `${data.hopDongSapHetHan} hợp đồng`,
      icon: assets.icon_hopdonghethan,
      bgIcon: "#2563EB",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <Sidebar />
      <Header title="Tổng Quan" />
      <div className="ml-[220px] pt-[80px] px-5 pb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {statCards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {card.label}
                  </p>
                  <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-2">
                    {card.value}
                  </p>
                </div>
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: card.bgIcon }}
                >
                  <img className="w-5 h-5" src={card.icon} alt={card.label} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* bieu do doanh thu */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F97316] rounded-xl flex items-center justify-center">
                  <img
                    className="w-5 h-5"
                    src={assets.icon_hopdonghethan}
                    alt="Hợp đồng hết hạn"
                  />
                </div>

                <h3 className="font-semibold text-gray-800">
                  Hợp đồng sắp hết hạn
                </h3>
              </div>

              <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                {data.hopDongSapHet?.length || 0}
              </span>
            </div>

            <div className="space-y-3">
              {data.hopDongSapHet?.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{item.tenKhach}</p>
                    <p className="text-xs text-gray-500">
                      {item.tenTro} - {item.maPhong}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {item.ngayHetHan}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#DC2626] rounded-xl flex items-center justify-center">
                  <img className="w-5 h-5" src={assets.icon_thanhtoancham} alt="Thanh toán chậm"/>
                </div>

                <h3 className="font-semibold text-gray-800">
                  Khách trễ hạn thanh toán
                </h3>
              </div>

              <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                {data.khachTreHanThanhToan?.length || 0}
              </span>
            </div>
            <div className="space-y-3">
              {data.khachTreHanThanhToan?.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{item.tenKhach}</p>
                    <p className="text-xs text-gray-500">
                      {item.tenTro} - {item.maPhong}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {new Intl.NumberFormat("vi-VN").format(item.soTien)} VNĐ
                    </p>
                    <p className="text-xs text-red-500">
                      Trễ {item.soNgayTre} ngày
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
