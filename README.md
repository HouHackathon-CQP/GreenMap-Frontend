<div align="center">
  <a href="https://github.com/HouHackathon-CQP/GreenMap-Frontend">
    <img src="public/images/logo.png" alt="GreenMap Logo" width="120" height="120">
  </a>

  <h1 style="font-size: 3rem; font-weight: 800; margin-top: 20px;">Green Map Admin Portal 🌿</h1>

  <p style="font-size: 1.2rem; color: #888; max-width: 600px; margin: 0 auto;">
    Hệ thống Quản trị & Giám sát Môi trường Đô thị Thông minh. <br>
    Nơi công nghệ gặp gỡ thiên nhiên vì một Hà Nội xanh hơn.
  </p>

  <br>

  <p align="center">
    <a href="#tinh-nang">✨ Tính năng</a> •
    <a href="#cong-nghe">🛠 Công nghệ</a> •
    <a href="#cai-dat">🚀 Cài đặt</a> •
    <a href="#thanh-vien">👥 Đội ngũ</a> •
    <a href="#dong-gop">🤝 Đóng góp</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License">
    <img src="https://img.shields.io/badge/React-18.x-blue?style=flat-square&logo=react" alt="React">
    <img src="https://img.shields.io/badge/Vite-5.x-purple?style=flat-square&logo=vite" alt="Vite">
    <img src="https://img.shields.io/badge/MapLibre-GL-orange?style=flat-square" alt="MapLibre">
  </p>
</div>

---

## 📖 Giới thiệu

Chào mừng đến với **GreenMap Admin Portal**! 👋

Đây là "bộ não" trung tâm của dự án Bản Đồ Xanh. Dự án được xây dựng với mục tiêu cung cấp cho các nhà quản lý đô thị một cái nhìn toàn cảnh, trực quan và thời gian thực (Real-time) về sức khỏe môi trường của thành phố Hà Nội.

Hệ thống tích hợp dữ liệu từ các cảm biến IoT, báo cáo từ cộng đồng và API thời tiết chuẩn xác để đưa ra các cảnh báo sớm và hỗ trợ ra quyết định quy hoạch đô thị.

<h2 id="layout">🎨 Giao diện dự án</h2>

<p align="center">
    <img src="public/images/image-1.png" alt="dashboard" width="400px">
    <img src="public/images/image-2.png" alt="map" width="400px">
    <img src="public/images/image-3.png" alt="tourist" width="400px">
</p>

## ✨ Tính năng Nổi bật <a id="tinh-nang"></a>

Hệ thống được chia thành các phân hệ chính với những chức năng chuyên sâu:

### 1. Dashboard Tổng quan 📊
Nơi nắm bắt nhịp đập của thành phố trong nháy mắt:
* **KPIs Thời gian thực:** Theo dõi tổng số trạm, số trạm Online/Offline, và chỉ số AQI trung bình toàn thành phố.
* **Bản đồ 3D Tương tác:** Tích hợp bản đồ nghiêng (Pitch view) hiển thị vị trí các trạm quan trắc và định vị người quản trị theo thời gian thực (GPS).
* **Widget Thời tiết Thông minh:** Kết nối API Backend để hiển thị nhiệt độ, độ ẩm hiện tại và **biểu đồ dự báo 24h** (kết hợp nhiệt độ & xác suất mưa).
* **Phân tích Ô nhiễm:** Biểu đồ xếp hạng mức độ ô nhiễm theo từng Quận/Huyện để nhanh chóng phát hiện điểm nóng.

### 2. Bản đồ Giám sát Đa lớp 🗺️
Công cụ đắc lực để phân tích không gian:
* **Chế độ xem đa dạng:** Chuyển đổi linh hoạt giữa các lớp dữ liệu:
    * 💨 **AQI:** Hiển thị chất lượng không khí với mã màu chuẩn (Xanh - Đỏ - vàng).
    * 🌧️ **Thời tiết:** Các trạm đo mưa, nắng, mây.
    * 🚗 **Giao thông:** Lớp phủ mật độ giao thông thời gian thực để đối chiếu với ô nhiễm không khí.
* **Định vị & GPS:** Tự động định vị người dùng với độ chính xác cao (High Accuracy).
* **Sidebar Chi tiết:** Xem thông số kỹ thuật sâu hơn của từng trạm khi click vào marker.

### 3. Quản lý Báo cáo Cộng đồng 📢
Kết nối trực tiếp với người dân:
* **Quy trình Duyệt bài:** Giao diện thẻ phân loại rõ ràng: *Chờ xử lý*, *Đã duyệt*, *Từ chối*.
* **Xử lý nhanh:** Admin có thể Duyệt hoặc Từ chối báo cáo chỉ với 1 cú click.
* **Hỗ trợ hình ảnh:** Hiển thị ảnh hiện trường.

### 4. Quản lý Dữ liệu Hạ tầng 🌳
Quản lý cơ sở dữ liệu hạ tầng xanh tập trung:
* **CRUD đầy đủ:** Thêm, Sửa, Xóa các địa điểm như: Công viên, Trạm sạc xe điện, Điểm thuê xe đạp, Điểm du lịch.
* **Đồng bộ:** Dữ liệu được quản lý tập trung và đồng bộ sang hệ thống bản đồ người dùng.

---

## 🛠 Công nghệ Sử dụng <a id="cong-nghe"></a>

Dự án sử dụng những công nghệ Frontend mới nhất để đảm bảo hiệu năng và trải nghiệm phát triển (DX):

| Thành phần | Công nghệ | Lý do lựa chọn |
| :--- | :--- | :--- |
| **Core** | [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) | Tốc độ khởi động và HMR siêu nhanh. |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | Xây dựng giao diện nhanh chóng, chuẩn Design System. |
| **Maps** | [MapLibre GL JS](https://maplibre.org/) | Render bản đồ Vector mượt mà, hỗ trợ 3D. |
| **Charts** | [Recharts](https://recharts.org/) | Vẽ biểu đồ đẹp, responsive và dễ tùy biến. |
| **Icons** | [Lucide React](https://lucide.dev/) | Bộ icon hiện đại, nhẹ và đồng bộ. |
| **API Client** | Fetch API + Custom Service | Xử lý Token tự động, Caching dữ liệu thông minh để giảm tải Server. |

---

## 🚀 Hướng dẫn Cài đặt & Chạy <a id="cai-dat"></a>

Hãy đảm bảo máy bạn đã cài đặt [Node.js](https://nodejs.org/) (v18 trở lên) và [Git](https://git-scm.com/).

### 1. Tải mã nguồn
Mở terminal và chạy lệnh sau để kéo dự án về máy:

```bash
git clone https://github.com/HouHackathon-CQP/GreenMap-Frontend.git
```

<h3>2. Cài đặt thư viện</h3>

Di chuyển vào thư mục dự án và cài đặt các gói phụ thuộc

```bash
cd GreenMap-Frontend
npm install
```

<h3>3. Cấu hình môi trường (.env)</h3>

Tạo một file `.env` tại thư mục gốc của dự án (ngang hàng với package.json) và thêm địa chỉ API Backend của bạn:

```bash
VITE_API_BASE_URL=(link API từ backend)
```

<h3>4. Khởi chạy</h3>
Chạy lệnh sau để bắt đầu dự án:

```bash
npm run dev
```

truy cập đường dẫn ở terminal để xem kết quả! 🎉

<h2 id="thanh-vien">🤝 Thành viên dự án</h2>

<table>
  <tr>
    <td align="center">
      <a href="#">
        <img src="https://avatars.githubusercontent.com/u/125746822?v=4" width="100px;"/><br>
        <sub>
          <b>Trần Anh Quân</b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="#">
        <img src="https://avatars.githubusercontent.com/u/168514215?v=4" width="100px;"/><br>
        <sub>
          <b>Trần Trọng Chiến</b>
        </sub>
      </a>
    </td>
    <td align="center">
      <a href="#">
        <img src="https://avatars.githubusercontent.com/u/100331812?v=4" width="100px;"/><br>
        <sub>
          <b>Nguyễn Hà Phương</b>
        </sub>
      </a>
    </td>
  </tr>
</table>

<h2 id="dong-gop">📫 Cách đóng góp</h2>

Chúng tôi rất hoan nghênh mọi sự đóng góp từ cộng đồng để dự án hoàn thiện hơn. Quy trình đóng góp như sau:

1. <a href="https://github.com/HouHackathon-CQP/GreenMap-Frontend/fork">**Fork**</a> dự án này về tài khoản của bạn.
2. Tạo một nhánh mới (**Branch**) cho tính năng bạn muốn làm: ``git checkout -b feature/Ten-Tinh-Nang``
3. **Commit** các thay đổi của bạn: ``git commit -m 'Thêm tính năng ABC XYZ'``
4. **Push** nhánh đó lên GitHub của bạn: ``git push origin feature/Ten-Tinh-Nang``
5. Tạo một **Pull Request** về repo gốc. Mô tả rõ những thay đổi bạn đã thực hiện.

<h3>Tài liệu tham khảo thêm</h3>

[📝 Cách tạo Pull Request chuẩn](https://www.atlassian.com/br/git/tutorials/making-a-pull-request)

[💾 Quy tắc đặt tên Commit](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716)