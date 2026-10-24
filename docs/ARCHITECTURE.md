# Kiến trúc

Trình duyệt → Next.js App Router/Route Handlers trên Vercel → Prisma → PostgreSQL trên Supabase.

Client Component thực hiện tương tác, gửi JSON cùng origin. Trang server kiểm tra phiên và vai trò. Route Handler kiểm tra quyền, dữ liệu Zod và gọi service. Service thực hiện truy vấn hoặc giao dịch. DB chứa khóa ngoại, unique, check constraints và RLS chặn Data API public.

`src/server` chỉ chạy server, không được import vào client. Không dùng Supabase JS/anon key vì không truy cập dữ liệu trực tiếp từ browser. Phiên đăng nhập được lưu trong PostgreSQL để hoạt động trên nhiều instance Vercel.

Đăng ký/hủy, CRUD liên quan, nhập/chốt điểm chạy giao dịch Serializable, thử lại tối đa ba lần khi Prisma báo xung đột. Truy vấn danh sách hiện lấy toàn bộ dữ liệu được phép rồi lọc/phân trang phía client, phù hợp đồ án quy mô nhỏ; với dữ liệu lớn cần chuyển sang phân trang server.
