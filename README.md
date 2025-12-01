<div align="center">
<a href="https://github.com/HouHackathon-CQP/GreenMap-Frontend">
    <img src="public/images/logo.png" alt="Logo" width="80" height="80">
</a>
<h1 style="font-weight: bold;">Green Map Frontend 🌿</h1>
</div>

<p align="center">
<a href="#tech">Công nghệ
        </a> • <a href="#started">Cài đặt & Chạy
        </a> • <a href="#colab">Thành viên
        </a> • <a href="#contribute">Đóng góp
    </a>
</p>

<p align="center"> <b>Dashboard theo dõi chất lượng không khí, lượng mưa và quản lý dữ liệu đô thị thông minh.</b> </p>

<p align="center">
    <a href="https://github.com/HouHackathon-CQP/GreenMap-Frontend">📱 Truy cập Repository</a>
</p>

<h2 id="layout">🎨 Giao diện dự án</h2>

<p align="center">
    <img src="public/images/image-1.png" alt="dashboard" width="400px">
    <img src="public/images/image-2.png" alt="map" width="400px">
    <img src="public/images/image-3.png" alt="tourist" width="400px">
</p>

<h2 id="technologies">💻 Công nghệ sử dụng</h2>

- Core: <a href="https://react.dev/">ReactJS</a> sử dụng <a href="https://vite.dev/">Vite</a>
- Styling: <a href="https://tailwindcss.com/">TailwindCSS</a>
- Maps: <a href="https://maplibre.org/">MapLibre GL JS</a>
- Charts: <a href="https://recharts.github.io/">Recharts</a>
- Icons: <a href="https://lucide.dev/">Lucide React</a>
- Data Fetching: <a href="https://axios-http.com/docs/intro">Axios</a>  / <a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API">Fetch API</a> với cấu hình Proxy.

<h2 id="started">🚀 Hướng dẫn cài đặt</h2>

Dưới đây là hướng dẫn để bạn có thể chạy dự án này trên máy cá nhân (Localhost).

<h3>Yêu cầu tiên quyết</h3>

Bạn cần cài đặt các công cụ sau trước khi bắt đầu:

- [Node.js](https://nodejs.org/) (Phiên bản 18.x trở lên)
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)

<h3>1. Clone dự án</h3>

chạy lệnh sau để tải mã nguồn về máy:

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

Tạo một file `.env` ở thư mục gốc của dự án và thêm đường dẫn API Backend:

```bash
VITE_API_BASE_URL=(link API từ backend)
```

<h3>4. Khởi chạy</h3>
Chạy lệnh sau để bắt đầu dự án:

```bash
npm run dev
```

truy cập đường dẫn ở terminal để xem kết quả! 🎉

<h2 id="colab">🤝 Thành viên dự án</h2>

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

<h2 id="contribute">📫 Cách đóng góp</h2>

Chúng tôi rất hoan nghênh mọi sự đóng góp từ cộng đồng để dự án hoàn thiện hơn. Quy trình đóng góp như sau:

1. <a href="https://github.com/HouHackathon-CQP/GreenMap-Frontend/fork">**Fork**</a> dự án này về tài khoản của bạn.
2. Tạo một nhánh mới (**Branch**) cho tính năng bạn muốn làm: ``git checkout -b feature/Ten-Tinh-Nang``
3. **Commit** các thay đổi của bạn: ``git commit -m 'Thêm tính năng ABC XYZ'``
4. **Push** nhánh đó lên GitHub của bạn: ``git push origin feature/Ten-Tinh-Nang``
5. Tạo một **Pull Request** về repo gốc. Mô tả rõ những thay đổi bạn đã thực hiện.

<h3>Tài liệu tham khảo thêm</h3>

[📝 Cách tạo Pull Request chuẩn](https://www.atlassian.com/br/git/tutorials/making-a-pull-request)

[💾 Quy tắc đặt tên Commit](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716)