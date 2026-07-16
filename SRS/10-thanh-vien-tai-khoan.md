# SRS-10 — Thành viên & Tài khoản (module Users)

Khu vực `/users/` — cổng đăng nhập cho con cháu dòng họ và ban biên tập.

## 1. Đăng nhập

- **FR-10.1** Form đăng nhập (username/email + mật khẩu), nút "Đăng nhập" trên header mọi trang.
- **FR-10.2** **Xác thực 2 bước (2FA)**: nhập mã từ **ứng dụng xác thực** (TOTP — Google Authenticator…); phương án dự phòng bằng **mã backup** ("Nhập một trong các mã dự phòng bạn đã nhận được", "Thử cách khác").
- **FR-10.3** Giữ phiên đăng nhập; cảnh báo timeout với countdown 60 giây "Bấm vào đây để duy trì trạng thái đăng nhập".

## 2. Đăng ký (`/users/register/`)

- **FR-10.4** Form đăng ký: username, email, mật khẩu, họ tên, giới tính (Nam/Nữ/N/A)…
- **FR-10.5** **Câu hỏi bảo mật** tự chọn để khôi phục tài khoản (danh sách: môn thể thao yêu thích, món ăn, thần tượng điện ảnh, nhạc sỹ, quê ngoại, cuốn sách gối đầu giường, ngày lễ mong đợi).
- **FR-10.6** Bắt buộc đồng ý "**Quy định đăng ký thành viên**" (trang điều khoản riêng).
- **FR-10.7** Kích hoạt qua **email link**; chức năng "Đã đăng ký nhưng không nhận được link kích hoạt?" (gửi lại).
- **FR-10.8** Khôi phục mật khẩu (`/users/lostpass/` — quên mật khẩu qua email/câu hỏi bảo mật).

## 3. Phân quyền (suy luận từ NukeViet)

- **FR-10.9** Nhóm người dùng (groups): khách, thành viên, biên tập viên từng module, quản trị module, quản trị tối cao; gán quyền theo module/chuyên mục.
- **FR-10.10** Hồ sơ cá nhân thành viên: đổi thông tin, avatar, đổi mật khẩu, bật/tắt 2FA, xem lịch sử đăng nhập (OAuth ngoài — không thấy bật trên site này).
- **FR-10.11** Đăng nhập xong thành viên có thể: bình luận, gửi liên hệ định danh; biên tập viên vào được `/admin/`.

## 4. Ghi chú bảo mật quan sát được

- Form đăng nhập nhúng ở popup header (data-callback `loginFormLoad`), có captcha ở thao tác nhạy cảm (chuẩn NukeViet).
- Mọi trang users đều có link Đăng nhập / Đăng ký / Khôi phục mật khẩu.
