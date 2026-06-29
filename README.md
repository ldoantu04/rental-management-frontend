# 🏠 Rental Management System — Frontend

> **Đồ án tốt nghiệp** — Hệ thống quản lý nhà trọ (Frontend)  
> Giao diện quản lý nhà trọ hiện đại được xây dựng trên React 19 + Vite, tích hợp đầy đủ các tính năng quản lý phòng trọ, hợp đồng, hóa đơn, thanh toán và trợ lý AI.

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Demo giao diện](#-demo-giao-diện)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc dự án](#-kiến-trúc-dự-án)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt và chạy dự án](#-cài-đặt-và-chạy-dự-án)
- [Cấu hình](#-cấu-hình)
- [Các trang chính](#-các-trang-chính)
- [Tác giả](#-tác-giả)
[text](../../rental)
---

## 🌟 Tổng quan

Frontend của hệ thống quản lý nhà trọ cung cấp giao diện người dùng trực quan và hiện đại, cho phép chủ trọ và nhân viên thao tác quản lý toàn bộ hoạt động cho thuê phòng trọ.

### ✨ Tính năng chính

- 📊 **Dashboard tổng quan** — Thống kê doanh thu, biểu đồ tình trạng phòng, hợp đồng sắp hết hạn
- 🏘 **Quản lý nhà trọ** — Thêm, sửa, xóa nhà trọ với thông tin chi tiết
- 🚪 **Quản lý phòng trọ** — Quản lý phòng theo nhà trọ, trạng thái phòng trực quan
- 👤 **Quản lý khách thuê** — Thông tin cá nhân, CCCD, người ở ghép
- 📝 **Quản lý hợp đồng** — Tạo, gia hạn, thanh lý hợp đồng với dịch vụ đi kèm
- 💰 **Quản lý hóa đơn** — Tính tiền tự động, xuất PDF, gửi email cho khách
- 💳 **Thanh toán VNPAY** — Tích hợp thanh toán trực tuyến qua cổng VNPAY
- 📜 **Lịch sử giao dịch** — Xem và lọc toàn bộ giao dịch thanh toán
- 👨‍💼 **Quản lý nhân viên** — Phân quyền, gán nhà trọ cho nhân viên
- 🤖 **Trợ lý AI** — Chatbot AI hỗ trợ tra cứu dữ liệu hệ thống
- ⚙️ **Cài đặt hệ thống** — Mẫu email, cài đặt hóa đơn, thông tin hệ thống
- 🔐 **Xác thực OTP** — Đăng nhập bảo mật qua email OTP

---

## 🛠 Công nghệ sử dụng

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| **React** | 19.2.6 | UI Library |
| **Vite** | 8.x | Build tool & Dev server |
| **React Router DOM** | 7.17.0 | Routing SPA |
| **Tailwind CSS** | 4.3.0 | Utility-first CSS framework |
| **Axios** | 1.17.0 | HTTP client (gọi API) |
| **Recharts** | 3.8.1 | Biểu đồ thống kê |
| **Framer Motion** | 12.40.0 | Animation & Transitions |
| **React Toastify** | 11.1.0 | Thông báo toast |
| **ESLint** | 10.x | Linting & code quality |

---

## 🏗 Kiến trúc dự án

```
rental-frontend/
├── public/                     # Static assets
├── src/
│   ├── main.jsx                # Entry point — render App
│   ├── App.jsx                 # Root component — Router & Auth
│   ├── index.css               # Global styles (Tailwind imports)
│   ├── assets/                 # Icons, images, static assets
│   │   └── assets.js           # Asset exports & mappings
│   ├── components/             # Reusable UI Components
│   │   ├── Sidebar.jsx         #   Thanh menu bên trái
│   │   ├── Header.jsx          #   Header với thông báo & avatar
│   │   └── LoginBranding.jsx   #   Branding trang đăng nhập
│   ├── context/                # React Context (Global State)
│   │   └── RentalContext.jsx   #   Auth state, API base URL
│   └── pages/                  # Page Components (Routes)
│       ├── Login.jsx           #   🔐 Đăng nhập OTP
│       ├── Overview.jsx        #   📊 Tổng quan Dashboard
│       ├── Motel.jsx           #   🏘 Quản lý nhà trọ
│       ├── Room.jsx            #   🚪 Quản lý phòng trọ
│       ├── Tenant.jsx          #   👤 Quản lý khách thuê
│       ├── Contract.jsx        #   📝 Quản lý hợp đồng
│       ├── Invoice.jsx         #   💰 Quản lý hóa đơn
│       ├── Transaction.jsx     #   📜 Lịch sử giao dịch
│       ├── Staff.jsx           #   👨‍💼 Quản lý nhân viên
│       ├── Chatbot.jsx         #   🤖 Trợ lý AI
│       └── Setting.jsx         #   ⚙️ Cài đặt hệ thống
├── .env                        # Biến môi trường
├── index.html                  # HTML entry
├── vite.config.js              # Cấu hình Vite
├── eslint.config.js            # Cấu hình ESLint
├── package.json                # Dependencies & Scripts
└── README.md
```

---

## 💻 Yêu cầu hệ thống

| Yêu cầu | Phiên bản tối thiểu |
|---|---|
| **Node.js** | 18.x trở lên (khuyến nghị 20.x+) |
| **npm** | 9.x trở lên |
| **Git** | 2.x |
| **Trình duyệt** | Chrome, Firefox, Edge (phiên bản mới nhất) |

> ⚠️ **Lưu ý:** Frontend cần Backend API đang chạy để hoạt động đầy đủ. Xem hướng dẫn cài đặt Backend tại repository [rental](../rental/README.md).

---

## 🚀 Cài đặt và chạy dự án

### 1. Clone repository

```bash
git clone <repository-url>
cd rental-frontend
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình biến môi trường

Tạo file `.env` tại thư mục gốc (hoặc chỉnh sửa file `.env` đã có):

```env
VITE_BACKEND_URL=http://localhost:8080
```

> Thay đổi URL nếu Backend chạy trên port hoặc host khác.

### 4. Chạy Development Server

```bash
npm run dev
```

Ứng dụng sẽ khởi chạy tại:

```
http://localhost:5173
```

### 5. Build Production

Để tạo bản build production:

```bash
npm run build
```

Kết quả build nằm trong thư mục `dist/`, có thể deploy lên bất kỳ static hosting nào (Nginx, Apache, Vercel, Netlify, ...).

### 6. Preview Production Build

```bash
npm run preview
```

---

## ⚙ Cấu hình

### Biến môi trường

| Biến | Mặc định | Mô tả |
|---|---|---|
| `VITE_BACKEND_URL` | `http://localhost:8080` | URL của Backend API server |

### Thay đổi port Dev Server

Trong file `vite.config.js`, thêm cấu hình server:

```js
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,       // Đổi port (mặc định 5173)
    open: true,        // Tự động mở trình duyệt
  },
})
```

---

## 📱 Các trang chính

### 🔐 Đăng nhập (`/login`)
- Xác thực bằng email OTP
- Không sử dụng mật khẩu truyền thống
- Tự động chuyển hướng sau khi xác thực thành công

### 📊 Tổng quan (`/`)
- **4 thẻ thống kê**: Tổng doanh thu tháng, Phòng đang thuê, Hóa đơn chưa thanh toán, Hợp đồng sắp hết hạn
- **Biểu đồ doanh thu**: Area chart theo tháng với bộ lọc năm và nhà trọ
- **Biểu đồ tình trạng phòng**: Donut chart (Đang thuê / Trống / Bảo trì)
- **Danh sách cảnh báo**: Hợp đồng sắp hết hạn, Khách trễ hạn thanh toán

### 🏘 Nhà trọ (`/motel`)
- Danh sách nhà trọ dạng card
- Thêm / sửa / xóa nhà trọ
- Hiển thị số phòng, địa chỉ

### 🚪 Phòng trọ (`/room`)
- Lọc phòng theo nhà trọ
- Trạng thái phòng với badge màu
- Thêm / sửa / xóa phòng

### 👤 Khách thuê (`/tenant`)
- Quản lý thông tin khách thuê chi tiết
- Upload ảnh CCCD
- Quản lý người ở ghép

### 📝 Hợp đồng (`/contract`)
- Tạo hợp đồng với dịch vụ đi kèm
- Gia hạn / Thanh lý hợp đồng
- Lọc theo trạng thái, nhà trọ

### 💰 Hóa đơn (`/invoice`)
- Tạo hóa đơn với chỉ số điện/nước
- Tính tiền tự động (tiền phòng + điện + nước + dịch vụ + phí phạt)
- Xuất PDF hóa đơn
- Gửi hóa đơn qua email
- Thanh toán trực tuyến VNPAY

### 📜 Giao dịch (`/transaction`)
- Lịch sử tất cả giao dịch thanh toán
- Lọc theo trạng thái, phương thức thanh toán

### 👨‍💼 Nhân viên (`/staff`)
- Quản lý tài khoản nhân viên (chỉ Admin)
- Gán nhân viên quản lý nhà trọ cụ thể
- Phân quyền Admin / Staff

### 🤖 Trợ lý AI (`/chatbot`)
- Chat với AI trợ lý (Gemini 2.5 Flash)
- Tra cứu dữ liệu hệ thống bằng ngôn ngữ tự nhiên
- Lưu lịch sử hội thoại

### ⚙️ Cài đặt (`/setting`)
- Quản lý mẫu email thông báo
- Cài đặt hóa đơn (giá điện/nước mặc định, hạn thanh toán)
- Thông tin hệ thống

---

## 🔄 Luồng hoạt động

```
┌─────────────┐       ┌──────────────┐       ┌───────────────┐
│   Người dùng │       │   React App   │       │  Backend API  │
│  (Trình duyệt)│──────▶│  (Vite Dev)   │──────▶│ (Spring Boot) │
└─────────────┘       └──────────────┘       └───────┬───────┘
                                                      │
                              ┌────────────────────────┤
                              ▼                        ▼
                      ┌──────────────┐       ┌───────────────┐
                      │    MySQL      │       │  Cloudinary   │
                      │   Database    │       │  (Ảnh/File)   │
                      └──────────────┘       └───────────────┘
```

1. **Đăng nhập** → Nhập email → Nhận OTP → Xác thực → Nhận JWT token
2. **Thao tác** → Gọi API với JWT → Backend xử lý → Trả dữ liệu JSON
3. **Thanh toán** → Tạo URL VNPAY → Redirect → Thanh toán → Callback → Cập nhật trạng thái

---

## 🧪 Scripts

| Script | Lệnh | Mô tả |
|---|---|---|
| **Dev** | `npm run dev` | Chạy development server (HMR) |
| **Build** | `npm run build` | Build production bundle |
| **Preview** | `npm run preview` | Preview production build |
| **Lint** | `npm run lint` | Kiểm tra code với ESLint |

---

## 📦 Hướng dẫn chạy Full-Stack (Backend + Frontend)

Để chạy đầy đủ hệ thống, bạn cần khởi động **cả Backend và Frontend**:

### Bước 1: Khởi động MySQL
Đảm bảo MySQL Server đang chạy và database `RentalManagement` đã được tạo.

### Bước 2: Khởi động Backend
```bash
cd rental
# Windows
mvnw.cmd spring-boot:run
# macOS/Linux
./mvnw spring-boot:run
```
Đợi cho đến khi thấy log: `Started RentalApplication`

### Bước 3: Khởi động Frontend
Mở terminal mới:
```bash
cd rental-frontend
npm install        # Chỉ cần chạy lần đầu
npm run dev
```

### Bước 4: Truy cập ứng dụng
Mở trình duyệt và truy cập: **http://localhost:5173**

---

## 👤 Tác giả

- **Sinh viên:** Lê Đoan Tú
- **Email:** ledoantu04@gmail.com
- **Đồ án tốt nghiệp** — Hệ thống quản lý nhà trọ

---

<p align="center">
  <i>Rental Management System — Frontend © 2026</i>
</p>
