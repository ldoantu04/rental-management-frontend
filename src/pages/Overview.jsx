import React, { useContext, useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { assets } from "../assets/assets";
import { RentalContext } from "../context/RentalContext";
import axios from "axios";
import { toast } from "react-toastify";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

const CHART_COLOR = "#80001C";
const GRID_COLOR = "#F3F4F6";
const AXIS_COLOR = "#9CA3AF";

const MONTHS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

const ROOM_STATUS_COLORS = {
  rented: "#80001C",
  vacant: "#E5E7EB",
  maintenance: "#F97316",
};

const ROOM_STATUS_LABELS = {
  rented: "Đang thuê",
  vacant: "Phòng trống",
  maintenance: "Bảo trì",
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

const chartVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.12, duration: 0.5, ease: "easeOut" },
  }),
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-lg px-4 py-3">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-semibold text-[#80001C]">
          {payload[0].value.toLocaleString("vi-VN")} triệu đồng
        </p>
      </div>
    );
  }
  return null;
};

const RoomStatusTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value, percent } = payload[0];
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-lg px-4 py-3">
        <p className="text-sm font-medium text-gray-800">{ROOM_STATUS_LABELS[name]}</p>
        <p className="text-xs text-gray-500">
          {value} phòng ({(percent * 100).toFixed(0)}%)
        </p>
      </div>
    );
  }
  return null;
};

const SkeletonLine = () => (
  <div className="w-full h-full flex flex-col justify-end gap-1 px-4 pb-6">
    {[0.6, 0.8, 0.5, 0.9, 0.7, 0.65, 0.85, 0.55, 0.75, 0.95, 0.7, 0.6].map((h, i) => (
      <div
        key={i}
        className="rounded-sm animate-pulse"
        style={{
          height: `${h * 100}%`,
          backgroundColor: "#E5E7EB",
        }}
      />
    ))}
  </div>
);

const SkeletonDonut = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-40 h-40 rounded-full border-[28px] border-gray-100 animate-pulse" />
  </div>
);

const Overview = () => {
  const { backendUrl, token, showLogoutConfirm } = useContext(RentalContext);
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({ years: [], motels: [] });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMotel, setSelectedMotel] = useState("");

  const [revenueData, setRevenueData] = useState([]);
  const [roomStatus, setRoomStatus] = useState({ rented: 0, vacant: 0, maintenance: 0, total: 0 });

  const [revenueLoading, setRevenueLoading] = useState(true);
  const [roomLoading, setRoomLoading] = useState(true);

  const fetchFilters = async () => {
    try {
      const res = await axios.get(backendUrl + "/api/dashboard/filters", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFilters({
        years: res.data.years || [],
        motels: res.data.motels || [],
      });
      if (res.data.years && res.data.years.length > 0) {
        const latestYear = Math.max(...res.data.years);
        setSelectedYear(latestYear);
      }
    } catch {
      const currentYear = new Date().getFullYear();
      setFilters({ years: [currentYear], motels: [] });
      setSelectedYear(currentYear);
    }
  };

  const fetchOverview = async () => {
    try {
      const res = await axios.get(backendUrl + "/api/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOverviewData(res.data);
    } catch {
      toast.error("Không thể tải dữ liệu tổng quan");
    }
    setLoading(false);
  };

  const fetchRevenue = useCallback(async (year, motelId) => {
    setRevenueLoading(true);
    try {
      const params = { year };
      if (motelId) params.motelId = motelId;
      const res = await axios.get(backendUrl + "/api/dashboard/revenue", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setRevenueData(res.data);
    } catch {
      toast.error("Không thể tải dữ liệu doanh thu");
    }
    setRevenueLoading(false);
  }, [backendUrl, token]);

  const fetchRoomStatus = useCallback(async (motelId) => {
    setRoomLoading(true);
    try {
      const params = {};
      if (motelId) params.motelId = motelId;
      const res = await axios.get(backendUrl + "/api/dashboard/room-status", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setRoomStatus(res.data);
    } catch {
      toast.error("Không thể tải tình trạng phòng");
    }
    setRoomLoading(false);
  }, [backendUrl, token]);

  useEffect(() => {
    if (token) {
      fetchOverview();
      fetchFilters();
    }
  }, [token]);

  useEffect(() => {
    if (token && selectedYear) {
      fetchRevenue(selectedYear, selectedMotel || null);
    }
  }, [token, selectedYear, selectedMotel, fetchRevenue]);

  useEffect(() => {
    if (token) {
      fetchRoomStatus(selectedMotel || null);
    }
  }, [token, selectedMotel, fetchRoomStatus]);

  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
  };

  const handleMotelChange = (e) => {
    setSelectedMotel(e.target.value);
  };

  const chartData = revenueData.map((d) => ({
    name: MONTHS[d.month - 1],
    revenue: d.revenue ? parseFloat(d.revenue) : 0,
  }));

  const pieData = [
    { name: "rented", value: roomStatus.rented },
    { name: "vacant", value: roomStatus.vacant },
    { name: "maintenance", value: roomStatus.maintenance },
  ].filter((d) => d.value > 0);

  const donutTotal = roomStatus.total || 1;

  const renderLegend = () => (
    <div className="flex flex-col gap-2 mt-4">
      {[
        { key: "rented", color: ROOM_STATUS_COLORS.rented },
        { key: "vacant", color: ROOM_STATUS_COLORS.vacant },
        { key: "maintenance", color: ROOM_STATUS_COLORS.maintenance },
      ].map(({ key, color }) => {
        const count = roomStatus[key];
        const percent = ((count / donutTotal) * 100).toFixed(0);
        return (
          <div key={key} className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-600">{ROOM_STATUS_LABELS[key]}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-800">{count} phòng</span>
              <span className="text-xs text-gray-400">{percent}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );

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

  const cardBase =
    "bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] border border-gray-50";
  const selectBase =
    "px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg cursor-pointer outline-none focus:border-[#80001C] focus:ring-1 focus:ring-[#80001C]/20 transition-all duration-200 hover:border-gray-300 appearance-none";
  const selectWrapper = "relative inline-flex items-center";

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <Sidebar />
      <Header title="Tổng Quan" />
      <div className="ml-[220px] pt-[80px] px-8 pb-6" style={{ pointerEvents: showLogoutConfirm ? 'none' : 'auto' }}>
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {statCards.map((card, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className={`${cardBase} hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow duration-200`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {card.label}
                  </p>
                  <p className="text-lg lg:text-xl font-bold text-gray-900 mt-2">
                    {loading ? (
                      <span className="inline-block w-24 h-6 bg-gray-100 rounded animate-pulse" />
                    ) : (
                      card.value
                    )}
                  </p>
                </div>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: card.bgIcon }}
                >
                  <img className="w-4 h-4" src={card.icon} alt={card.label} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 mb-6">
          {/* Revenue Chart - 6 cols */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={chartVariants}
            className={`${cardBase} lg:col-span-6`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Doanh thu theo tháng</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Đơn vị: triệu đồng</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className={selectWrapper}>
                  <select
                    value={selectedYear}
                    onChange={handleYearChange}
                    className={selectBase}
                  >
                    {filters.years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className={selectWrapper}>
                  <select
                    value={selectedMotel}
                    onChange={handleMotelChange}
                    className={selectBase}
                  >
                    <option value="">Tất cả nhà trọ</option>
                    {filters.motels.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="h-[260px]">
              {revenueLoading ? (
                <SkeletonLine />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_COLOR} stopOpacity={0.12} />
                        <stop offset="100%" stopColor={CHART_COLOR} stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="0"
                      vertical={false}
                      stroke={GRID_COLOR}
                      strokeWidth={1}
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: AXIS_COLOR }}
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={48}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: AXIS_COLOR }}
                      tickFormatter={(v) => `${v}M`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: CHART_COLOR, strokeWidth: 1, strokeDasharray: "4 4" }} />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke={CHART_COLOR}
                        strokeWidth={2}
                        fill="url(#revenueGradient)"
                        dot={false}
                        activeDot={{
                          r: 5,
                          fill: CHART_COLOR,
                          stroke: "#fff",
                          strokeWidth: 2,
                        }}
                        isAnimationActive={true}
                        animationDuration={1200}
                        animationEasing="ease-in-out"
                      />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Room Status Chart - 4 cols */}
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={chartVariants}
            className={`${cardBase} lg:col-span-4`}
          >
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-800">Tình trạng phòng trọ</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Tổng số phòng: {roomLoading ? "—" : roomStatus.total}
              </p>
            </div>

            <div className="h-[260px] flex flex-col items-center">
              {roomLoading ? (
                <SkeletonDonut />
              ) : (
                <>
                  <div className="w-full flex-1 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius="58%"
                          outerRadius="78%"
                          paddingAngle={3}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                          isAnimationActive={true}
                          animationBegin={200}
                          animationDuration={800}
                          animationEasing="ease-out"
                        >
                          {pieData.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={ROOM_STATUS_COLORS[entry.name]}
                              stroke="none"
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<RoomStatusTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {renderLegend()}
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={chartVariants}
            className={cardBase}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#80001C]/10 rounded-xl flex items-center justify-center">
                  <img
                    className="w-4 h-4"
                    src={assets.icon_hopdonghethan}
                    alt="Hợp đồng hết hạn"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Hợp đồng sắp hết hạn
                </h3>
              </div>
              <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                {data.hopDongSapHet?.length || 0}
              </span>
            </div>
            <div className="space-y-2.5">
              {data.hopDongSapHet?.length > 0 ? (
                data.hopDongSapHet.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-xl p-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.tenKhach}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.tenTro} — {item.maPhong}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">{item.ngayHetHan}</span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <svg className="w-10 h-10 text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm text-gray-400">Không có hợp đồng nào sắp hết hạn</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={chartVariants}
            className={cardBase}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                  <img className="w-4 h-4" src={assets.icon_thanhtoancham} alt="Thanh toán chậm" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Khách trễ hạn thanh toán
                </h3>
              </div>
              <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                {data.khachTreHanThanhToan?.length || 0}
              </span>
            </div>
            <div className="space-y-2.5">
              {data.khachTreHanThanhToan?.length > 0 ? (
                data.khachTreHanThanhToan.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-xl p-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.tenKhach}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.tenTro} — {item.maPhong}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">
                        {new Intl.NumberFormat("vi-VN").format(item.soTien)} đ
                      </p>
                      <p className="text-xs text-red-500 mt-0.5">
                        Trễ {item.soNgayTre} ngày
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <svg className="w-10 h-10 text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-400">Không có khách trễ hạn thanh toán</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
