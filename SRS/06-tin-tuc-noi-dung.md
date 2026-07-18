# SRS-06 — Tin tức & Quản lý nội dung (CMS)

> **Thi công admin/portal hiện tại:** xem [12f-admin-cms-bai-viet.md](12f-admin-cms-bai-viet.md) (chuyên mục ↔ `/tin/{slug}`, TipTap + thư viện, xem trước).

Toàn bộ khối nội dung dùng module News của NukeViet, chia thành nhiều chuyên mục (module ảo).

## 1. Các chuyên mục quan sát được

| Chuyên mục | Route | Nội dung |
|-----------|-------|----------|
| Thông tin dòng họ | `/thong-tin-dong-ho/` | Từ đường, lăng mộ, lễ nghi – hương hỏa, nhánh – chi – hội đồng gia tộc |
| Hoạt động dòng họ | `/hoat-dong-dong-ho/` | Sự kiện: khởi công tôn tạo lăng mộ, trùng tu… |
| Thông báo | `/thong-bao/` | Văn bản thông báo chính thức của hội đồng gia tộc |
| Họ Hoàng bốn phương | `/ho-hoang-bon-phuong/` | Tin các chi/vùng họ Hoàng – Huỳnh cả nước |
| Danh nhân - Gương sáng dòng họ | `/danh-nhan-guong-sang-dong-ho/` | Chân dung nhân vật tiêu biểu |
| Thư viện - Tư liệu | `/thu-vien-tu-lieu/` | Bài sớ cúng, tư liệu lịch sử (xem thêm SRS-08) |
| Công đức dòng họ | `/cong-duc-dong-ho/` | Bảng vàng công đức (xem SRS-07) |

## 2. Trang danh sách bài viết

- **FR-06.1** Danh sách bài theo chuyên mục: tiêu đề, mô tả dẫn (sapo), thời gian đăng, **lượt xem ("Đã xem")**, **số phản hồi**.
- **FR-06.2** Phân trang; khối "Bài viết mới" và "**Bài xem nhiều**" (top lượt xem) ở sidebar toàn site.

## 3. Trang chi tiết bài viết

- **FR-06.3** Hiển thị: tiêu đề, tác giả/bút danh ("Ban biên tập", tài khoản `tuanhk`), thời gian đăng chính xác, lượt xem, ảnh đại diện, nội dung rich-text (ảnh chèn giữa bài, caption, định dạng đậm/nghiêng, bảng).
- **FR-06.4** Meta chuẩn chia sẻ: OpenGraph (ảnh, mô tả), thời gian ISO 8601, breadcrumb.
- **FR-06.5** Nội dung song lịch (biên tập viên ghi cả ngày dương + âm trong bài).
- **FR-06.6** Khu **"Ý kiến bạn đọc"** (bình luận) cuối bài: sắp xếp theo mới / cũ / lượt thích (xem SRS-11).
- **FR-06.7** Bài liên quan/mới hơn/cũ hơn (điều hướng nội bộ chuyên mục).

## 4. Quy trình biên tập (suy luận từ khu quản trị NukeViet)

- **FR-06.8** Soạn bài WYSIWYG (CKEditor), upload ảnh vào thư viện `/uploads/news/{năm_tháng}/`.
- **FR-06.9** Hẹn giờ đăng, bài nổi bật trang chủ, gắn chuyên mục & từ khóa, nguồn bài.
- **FR-06.10** Phân quyền biên tập theo chuyên mục (người đăng khác người duyệt).
