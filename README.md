# AI & DIGITAL PUBLISHING — Reimagine the way we publish

Website HTML/CSS/JavaScript thuần (không framework, không cần build). Mở `index.html` trực tiếp hoặc chạy `python3 -m http.server`.

## Cấu trúc
- `index.html` — Trang chủ
- `pages/` — 5 chuyên mục, `article-detail.html?id=…`, `resource-detail.html?id=…`, `search.html?q=…`
- `pages/workflow/` — 5 bước AI Content Workflow (research → writing → editing → design → publishing)
- `css/` — `variables.css` (token màu thương hiệu), `global`, `components`, `layout`, `pages`, `responsive`
- `js/` — `data.js` (dữ liệu mẫu), `main.js` (header/footer dùng chung, card, toast, modal), `navigation.js`, `search.js`, `workflow.js`, `interactions.js`
- `assets/` — `images/` (ảnh hero đã chỉnh về tông navy/blue + minh họa SVG theo palette), `fonts/` (Be Vietnam Pro), `icons/`
- `reference/` — ảnh tham chiếu

## Giới hạn của bản demo
- Mọi kết quả ở AI Content Workflow là **mô phỏng bằng JavaScript** (quy tắc + mẫu văn bản), không gọi mô hình AI thật.
- Nội dung bài viết, tài nguyên, trích dẫn chuyên gia là dữ liệu minh họa. "Tải tài liệu" tạo tệp `.txt` demo.
- Trạng thái workflow lưu trong `sessionStorage` của trình duyệt.
- Thêm bài/tài nguyên mới: sửa `js/data.js`, mọi danh sách, tìm kiếm và bộ lọc tự cập nhật.
