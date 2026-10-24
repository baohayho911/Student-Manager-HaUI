# Kiểm tra bàn giao

## Đã thực hiện

- `npm run typecheck`: thành công.
- `npm run build`: thành công, gồm trang đăng nhập, trang theo vai trò, API và trang lỗi.
- `npm run lint`: không có lỗi; 4 cảnh báo điều hướng toàn trang ở đăng nhập/đăng xuất/đổi mật khẩu/hết phiên. Các điều hướng này đang chủ động tải lại toàn bộ trạng thái phiên.
- `npm test`: 26/26 kiểm thử đạt (Vitest + React Testing Library).
- `npm run test:db`: migration tạo đủ 15 bảng trong PGlite (PostgreSQL WebAssembly), kiểm tra RLS, khóa ngoại, điểm null; 8 trường hợp từ chối dữ liệu không hợp lệ đạt. Bộ kiểm tra này dùng database riêng trong RAM, không kết nối hoặc ghi dữ liệu Supabase.

## Nội dung kiểm thử tự động

Tính điểm và ranh giới điểm chữ; null so với 0; chu trình tiên quyết; byte limit mật khẩu; ngày sinh không tồn tại; đăng ký trùng môn, lớp đầy, thiếu tiên quyết, ngoài chương trình; đăng ký lại; không hủy khi có điểm; quyền theo vai trò và giảng viên phụ trách; không sửa bảng điểm đã khóa; giới hạn điểm; công bố khi lớp đóng và đủ điểm; không lộ điểm nháp; tìm kiếm/phân trang.

Service tests dùng mock database để kiểm tra nhánh nghiệp vụ. SQL tests chạy PostgreSQL WebAssembly để kiểm tra cấu trúc và ràng buộc. Hai nhóm này không thay thế kiểm thử tích hợp Prisma với Supabase hoặc kiểm thử tranh chấp đồng thời trên server thật.

## Chưa xác nhận trong môi trường bàn giao

- Chưa kết nối project Supabase của người dùng, chưa chạy seed/migration trên đó.
- Chưa triển khai Vercel hoặc kiểm tra kết nối pooler trong production.
- Chưa kiểm tra tương tác toàn bộ giao diện bằng browser: preview supervisor truyền tham số dành cho Vite (`--host`, `--strictPort`) không tương thích `next dev`. Không đổi công nghệ dự án để xử lý hạn chế của công cụ xem trước.

## Kiểm tra khi cấu hình Supabase

Theo quy trình mục 4 README. Bổ sung: mở cùng lớp còn một chỗ bằng hai tài khoản và đăng ký đồng thời (chỉ một người thành công); gửi yêu cầu sửa điểm bằng tài khoản sinh viên (403); dùng giảng viên khác gửi yêu cầu đến lớp không phụ trách (403); kiểm tra cookie Secure/HttpOnly qua HTTPS; kiểm tra điện thoại và bàn phím trong hộp thoại; khóa tài khoản đang đăng nhập ở phiên khác và xác nhận phiên đó bị từ chối.
