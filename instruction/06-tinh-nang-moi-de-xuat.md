# TK-06 — 10 tính năng mới đề xuất (thuần văn hóa Việt)

> Xếp theo giá trị văn hóa × độ khả thi. R = release đề xuất (TK-00 §5).

## F1 — Nhắc ngày giỗ đa kênh + lịch vạn niên dòng họ (R2)
Con cháu đăng ký nhận nhắc **giỗ cụ nào, trước mấy ngày, qua kênh nào** (email / **Zalo OA** / web push). Kèm: quy đổi giỗ sang dương lịch năm hiện tại, file **iCal** đồng bộ Google/Apple Calendar, và **gợi ý văn khấn** phù hợp (giỗ thường/giỗ đầu/giỗ hết) lấy từ thư viện tư liệu.
*User story*: "Là cháu đời 12 ở Sài Gòn, tôi nhận Zalo trước 3 ngày: 'Ngày 14/6 ÂL (28/7 DL) là giỗ cụ Hoàng Văn Thành (đời 5)'."

## F2 — Máy tính xưng hô & "Tôi là ai trong họ" (R2)
Thành viên liên kết tài khoản với node của mình trong cây (`linked_user_id`). Chọn bất kỳ người nào → hệ thống tính **quan hệ và cách xưng hô chuẩn Việt** ("ông chú họ", "bác dâu", "cháu đích tôn"), vẽ **đường quan hệ** giữa 2 người trên phả đồ. Thuật toán: LCA trên cây + bảng luật xưng hô (nội/ngoại, trên/dưới, dâu/rể).
*Giá trị*: giới trẻ về quê không còn "không biết chào bằng gì" — tính năng lan truyền mạnh nhất.

## F3 — Cổng tự khai & quy trình duyệt của tộc trưởng (R2)
Con cháu đăng nhập tự cập nhật nhánh mình (thêm con mới sinh, sửa ngày tháng, ảnh). Mọi thay đổi thành `change_request` (diff), vào hàng đợi cho **thư ký nhánh/tộc trưởng duyệt**, có audit trail. Chấm dứt cảnh "một thư ký gõ tay cả họ" — dữ liệu sống, phân tán đúng người.

## F4 — Sổ quỹ công đức minh bạch + VietQR (R2)
Nâng "bảng vàng" thành **chiến dịch quyên góp theo công trình** (tôn tạo lăng mộ, quỹ khuyến học): mục tiêu, tiến độ realtime, **mã VietQR động** (chuyển khoản ghi đúng nội dung), ghi nhận tiền/hiện vật/công sức, sao kê công khai, biên nhận PDF tự động, tổng kết lên bảng vàng cuối năm.
*Đúng tập quán*: minh bạch tiền họ là điều kiện sống còn của đoàn kết dòng tộc.

## F5 — Bản đồ mộ phần & QR bia mộ (R3)
Mỗi mộ có **tọa độ GPS + ảnh + chỉ đường**; bản đồ toàn nghĩa trang họ; in **mã QR gắn bia** → quét ra trang hồ sơ người mất. Lịch **tảo mộ** (trước Thanh minh/Chạp) gắn sự kiện F6.
*Đúng tập quán*: con cháu xa quê tìm được mộ tổ; "dấu tích ngàn năm không phai" số hóa.

## F6 — Sự kiện dòng họ: giỗ tổ, họp họ, điểm danh & phân công (R2)
Tạo sự kiện (ngày âm/dương), **đăng ký tham dự theo hộ** (mấy người, mấy xe), phân công ban tế/hậu cần/khánh tiết, checklist lễ, thống kê hiện diện theo nhánh, gallery ảnh sự kiện đổ về album.

## F7 — Kho di sản số hóa Hán-Nôm (R3)
Khu lưu trữ **sắc phong, gia phả cổ, văn bia, câu đối**: ảnh scan độ phân giải cao (IIIF-style viewer zoom sâu), phiên âm – dịch nghĩa song song từng trang, chú giải cộng đồng có duyệt. Gắn nguồn gốc tư liệu vào từng người/sự kiện trong phả hệ.

## F8 — Khuyến học – Bảng vàng thành tích (R2)
Chuyên mục vinh danh con cháu **đỗ đạt, giải thưởng, học hàm học vị** theo năm; quy trình đề cử → xác minh → công bố dịp giỗ tổ; liên kết quỹ khuyến học (F4); tự động sinh "Lễ vinh danh" trong sự kiện (F6).
*Đúng tập quán*: nối truyền thống "danh sỹ Huỳnh Côn" bằng thế hệ mới.

## F9 — Trợ lý AI gia phả (R3)
Chatbot RAG trên dữ liệu phả hệ + tư liệu: "Cụ Huỳnh Côn là ai, quan hệ gì với tôi?", "Tháng này họ mình có giỗ ai?", "Soạn giúp tin báo giỗ gửi Zalo". **Guardrails**: chỉ trả lời từ dữ liệu họ mình, tôn trọng quyền riêng tư người sống (không lộ SĐT/ngày sinh), câu trả lời kèm nguồn (node/bài viết), không bịa quan hệ.

## F10 — Nhà in gia phả: dàn trang sách tự động (R2→R3)
Nâng xuất PDF thành **ấn phẩm sách hoàn chỉnh**: bìa (tộc huy, tên họ), lời tựa, phả ký, phả đồ tự chia trang khổ A4/A3 có chỉ dẫn nối trang, phả hệ từng phái, index tên người, phụ lục ngày giỗ; kèm QR về bản số. Template in ấn = HTML print CSS qua pdf-render service — họ tự in tặng các chi.

---

## Bảng tổng hợp ưu tiên

| # | Tính năng | Giá trị văn hóa | Nỗ lực | Phụ thuộc | Release |
|---|-----------|----------------|--------|-----------|---------|
| F1 | Nhắc giỗ đa kênh | ★★★★★ | M | notification, lunar | R2 |
| F2 | Máy tính xưng hô | ★★★★★ | M | genealogy graph | R2 |
| F3 | Tự khai + duyệt | ★★★★★ | M | moderation, iam | R2 |
| F4 | Quỹ công đức VietQR | ★★★★★ | M | donation | R2 |
| F6 | Sự kiện + điểm danh | ★★★★ | M | event | R2 |
| F8 | Khuyến học | ★★★★ | S | cms, donation | R2 |
| F10 | Sách gia phả | ★★★★ | L | pdf-render | R2–R3 |
| F5 | Bản đồ mộ + QR bia | ★★★★ | L | geo, media | R3 |
| F7 | Di sản Hán-Nôm | ★★★ | L | media viewer | R3 |
| F9 | Trợ lý AI | ★★★ | L | search, guardrails | R3 |
