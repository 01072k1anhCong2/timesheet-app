timesheet-app/
├── index.html                <-- Trang chính quản lý công & lương
├── login.html                <-- Trang đăng nhập
├── register.html             <-- Trang đăng ký
├── images/                   <-- Avatar & hình ảnh khác
│   └── LAMTHANHCONGG.jpeg
├── css/                      <-- File CSS tách riêng
│   ├── common.css            <-- Body, box chung, media queries
│   ├── login.css             <-- Style riêng cho login.html
│   ├── register.css          <-- Style riêng cho register.html
│   └── index.css             <-- Style riêng cho index.html (profile, table, controls)
├── js/                       <-- File JS tách riêng
│   ├── firebase-config.js    <-- Cấu hình firebase chung
│   ├── login.js              <-- Hàm login()
│   ├── register.js           <-- Hàm register()
│   └── index.js              <-- Hàm generateTable(), calc(), logout()...
└── README.md                 <-- Ghi chú project (tùy chọn)

Ngày	|Giờ vào	|Giờ ra	|Số giờ	|Lương|	Hành động
…dòng chính…	…	…	…	…	…	              |nút Thêm
Giờ giải lao| 	Tiền đi	|  tien ve |nút Xóa
  gia tri         gia tri   gia tri