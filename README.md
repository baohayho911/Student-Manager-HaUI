# HaUI — Ứng dụng web quản lý sinh viên

Dự án mới độc lập, dùng **Next.js 16, React 19, TypeScript, Tailwind CSS 4, Prisma 6 và PostgreSQL trên Supabase**, chuẩn bị triển khai Vercel. Không cần Java, Spring Boot hay MySQL. Phiên bản cụ thể đã khóa trong `package-lock.json`; dùng `npm ci`.

## 1. Chạy lần đầu trên Windows

1. Cài **Node.js 22 LTS** (từ 22.12), mở thư mục dự án trong VS Code.
2. Tạo một project Supabase **mới, dành riêng cho ứng dụng này**. Lưu mật khẩu database.
3. Trong Supabase, chọn **Connect** và lấy hai chuỗi PostgreSQL:
   - Transaction pooler (cổng 6543) → `DATABASE_URL`, thêm `pgbouncer=true&connection_limit=1&sslmode=require`.
   - Session pooler (cổng 5432) → `DIRECT_URL`, thêm `sslmode=require`.
     Sao chép đúng host từ bảng điều khiển, không tự đoán vùng hoặc số `aws-0/1`. Nếu URL đã có `?`, nối tham số bằng `&`. Mật khẩu có ký tự đặc biệt phải URL-encode.
4. Sao chép `.env.example` thành `.env`, điền hai URL. Không dùng Supabase anon key thay mật khẩu PostgreSQL.
5. Đặt `SEED_ADMIN_PASSWORD` thành mật khẩu tự chọn, ít nhất 12 ký tự và tối đa 72 byte.
6. Nếu muốn dùng dữ liệu mẫu, đặt `SEED_DEMO="true"` và điền `SEED_DEMO_PASSWORD` theo cùng yêu cầu.
7. Mở Terminal tại thư mục chứa `package.json`, chạy lần lượt:

```powershell
npm ci
npm run db:migrate
npm run db:seed
npm run dev
```

8. Mở **http://localhost:3000**. Đăng nhập bằng `admin` và mật khẩu bạn đặt ở `SEED_ADMIN_PASSWORD`. Đổi mật khẩu ban đầu để mở các chức năng.

Các lần chạy sau dùng `npm run dev` hoặc nhấp `scripts/Chay-ung-dung.cmd`. Tắt bằng **Ctrl+C** trong cửa sổ Terminal. File CMD không tự chạy migration hoặc seed.

**Lưu ý:** Seed chỉ tạo admin nếu chưa có, không đặt lại mật khẩu tài khoản cũ. Dữ liệu mẫu chỉ được tạo khi chưa có khoa. Không chạy seed mẫu vào dữ liệu đang sử dụng. Sau khi seed thành công, có thể xóa các giá trị mật khẩu seed khỏi `.env`.

## 2. Tài khoản và dữ liệu mẫu

| Tài khoản      | Vai trò       | Mật khẩu ban đầu                         |
| -------------- | ------------- | ---------------------------------------- |
| `admin`        | Quản trị viên | Giá trị `SEED_ADMIN_PASSWORD` bạn tự đặt |
| `gv01`         | Giảng viên    | Giá trị `SEED_DEMO_PASSWORD` bạn tự đặt  |
| `sv01`, `sv02` | Sinh viên     | Giá trị `SEED_DEMO_PASSWORD` bạn tự đặt  |

Tất cả bắt buộc đổi mật khẩu lần đầu. Dữ liệu mẫu gồm khoa CNTT, ngành, lớp hành chính, 3 môn, chương trình, môn tiên quyết, lớp học phần, một kết quả đã công bố và một đăng ký chưa có điểm.

## 3. Chức năng

- **Quản trị viên:** tạo/sửa hồ sơ và tài khoản theo vai trò; khóa/mở khóa, đặt lại mật khẩu; xóa hồ sơ chưa có lịch sử; CRUD khoa, ngành, môn, chương trình, tiên quyết, lớp hành chính, lớp học phần, học kỳ.
- **Giảng viên:** xem lớp mình phụ trách, danh sách sinh viên; nhập/sửa điểm, chốt và công bố, mở lại bảng điểm.
- **Sinh viên:** đăng ký/hủy học phần; kiểm tra ngành/chương trình, tiên quyết, sĩ số, trạng thái học, trùng môn trong học kỳ; xem điểm công bố, GPA và tín chỉ tích lũy.
- **Dùng chung:** đăng nhập/đăng xuất, đổi mật khẩu, xem hồ sơ, sửa liên hệ, tìm kiếm, phân trang, xuất CSV danh sách, xác nhận thao tác.

Giao diện đăng nhập giữ nền trường và logo HaUI. Giao diện trong hệ thống giữ bố cục menu trái và tông kem–xanh của ảnh mẫu; menu chức năng theo phạm vi đã chốt, không sao chép các chức năng bổ sung của website cũ.

## 4. Quy trình thao tác thử

1. Admin kiểm tra danh mục theo thứ tự khoa → ngành → giảng viên → lớp hành chính → sinh viên → môn → chương trình/tiên quyết → học kỳ → lớp học phần.
2. Đăng nhập `sv01`, đổi mật khẩu, đăng ký lớp `IT002-01`: được phép vì đã đạt IT001.
3. Đăng nhập `sv02`, đăng ký IT002: bị từ chối vì chưa đạt môn tiên quyết.
4. Admin sửa `IT003-01` sang **Đóng đăng ký**.
5. Giảng viên `gv01` vào lớp phụ trách, mở danh sách, nhập hai thành phần điểm rồi **Chốt & công bố**.
6. Sinh viên `sv02` xem kết quả. Khi giảng viên mở lại bảng điểm, kết quả lớp này tạm ẩn.
7. Thử nhập điểm ngoài 0–10, đăng ký trùng, xóa môn đã được dùng và truy cập trang của vai trò khác để kiểm tra thông báo.

## 5. Đưa lên Vercel

1. Tạo repository GitHub mới và đưa **nội dung thư mục dự án** lên đó. Không đưa `.env`, `node_modules`, `.next` lên GitHub.
2. Trong Vercel chọn **Add New → Project → Import** repository.
3. Framework chọn **Next.js**, Root Directory là thư mục chứa `package.json`; Node.js chọn **22.x**.
4. Install Command: `npm ci`. Build Command: `npm run build`. Output Directory để mặc định.
5. Thêm `DATABASE_URL` và `DIRECT_URL` ở Environment Variables cho môi trường cần sử dụng. Không đặt tiền tố `NEXT_PUBLIC_`. Không cần thêm mật khẩu seed lên Vercel.
6. Chạy migration và seed một lần từ máy phát triển theo mục 1 trước khi dùng ứng dụng. Với các lần nâng cấp sau, sao lưu và chạy `npm run db:migrate` qua quy trình triển khai có kiểm soát.
7. Nhấn **Deploy**, mở URL Vercel trả về, đăng nhập và kiểm tra cả ba vai trò. Thay biến môi trường thì cần redeploy.

Chọn vùng chạy Vercel gần vùng Supabase để giảm độ trễ. Dùng database khác cho Preview khi cần thử thay đổi dữ liệu; không cho các bản thử nghiệm truy cập dữ liệu thật.

## 6. Cấu trúc mã nguồn

```text
student-manager-next/
├── docs/                    # Yêu cầu, kiến trúc, hướng dẫn, schema, API
├── prisma/
│   ├── schema.prisma
│   ├── migrations/          # SQL tạo bảng, ràng buộc, RLS
│   └── seed.ts
├── public/images/           # Logo và ảnh trường
├── scripts/                 # Lệnh chạy Windows
├── src/
│   ├── app/                 # Layout, trang, route theo vai trò, API
│   ├── components/          # Layout, bảng, form, modal dùng chung
│   ├── features/            # Auth, users, catalogs, sections, enrollments, results, profile
│   ├── server/              # DB, phiên đăng nhập, phân quyền, lỗi
│   ├── lib/                 # Cấu hình danh mục, quy tắc điểm, API client
│   ├── hooks/
│   ├── types/
│   └── __tests__/
├── .env.example
├── AGENTS.md
├── README.md
├── package.json
└── package-lock.json
```

Các danh mục CRUD tương đồng dùng `features/catalogs` và `lib/catalogs.ts` để tránh lặp mã. Các nghiệp vụ riêng (đăng ký, điểm, tài khoản) có service riêng. API dùng Next.js Route Handlers; không cần tạo thêm Server Actions cho cùng thao tác. Backend không được import vào Client Component.

## 7. Quy tắc dữ liệu

- Thông tin cá nhân nằm trong `TaiKhoan`; mỗi hồ sơ liên kết một tài khoản duy nhất, vai trò cố định sau khi tạo.
- Có lịch sử đăng ký/giảng dạy thì khóa tài khoản hoặc chuyển phân công; không xóa dây chuyền kết quả.
- `KetQuaHocTap` gộp đăng ký và điểm, khóa ghép sinh viên + lớp học phần. Hủy chỉ thay trạng thái; học lại ở lớp khác tạo kết quả riêng.
- Điểm trống là `NULL`, điểm 0 vẫn là một điểm đã nhập. Điểm nháp chỉ giảng viên phụ trách được xem.
- Trọng số và tín chỉ môn bị khóa chỉnh sửa khi đã có lịch sử đăng ký để tránh đổi điểm lịch sử.
- Điểm tổng kết = TX × trọng số TX + cuối kỳ × trọng số cuối kỳ, làm tròn 2 chữ số. A ≥ 8.5, B ≥ 7, C ≥ 5.5, D ≥ 4, còn lại F. Đây là **quy tắc của bản ứng dụng**, không khẳng định là toàn bộ quy chế hiện hành của trường.
- GPA lấy kết quả công bố tốt nhất của mỗi môn, có tính F; số tín chỉ đạt chỉ tính môn từ D.
- Lịch học hiện là văn bản thứ/tiết, **chưa tự phát hiện trùng lịch**. Không có cơ chế đăng ký nhóm môn tự chọn theo hạn ngạch; chương trình chỉ xác định môn thuộc ngành.

## 8. Kiểm tra và bảo mật

```powershell
npm run typecheck
npm run lint
npm test
npm run test:db
npm run build
```

Xem `docs/TESTING.md` để phân biệt kiểm thử tự động và kiểm tra cần chạy trên Supabase thật. Chưa tự triển khai vào tài khoản Supabase/Vercel của bạn.

Phiên đăng nhập ngẫu nhiên, chỉ lưu hash token trong database; cookie HttpOnly, SameSite=Lax, Secure ở production; hết hạn 8 giờ. Mật khẩu bcrypt cost 12. API thay đổi dữ liệu kiểm tra Origin; quyền kiểm tra phía máy chủ; giao dịch đăng ký dùng mức Serializable và thử lại khi xung đột. Giới hạn đăng nhập theo tên tài khoản: 10 lần/15 phút.

Migration bật RLS không có policy public và thu hồi quyền các role `anon`, `authenticated` trên bảng ứng dụng. Prisma kết nối bằng tài khoản database backend có quyền phù hợp (chuỗi `postgres` từ Connect). Không sử dụng Supabase Auth, không đưa chuỗi kết nối vào trình duyệt. Không tắt RLS để sửa lỗi giao diện.

## 9. Xử lý lỗi phổ biến

| Lỗi                          | Cách xử lý                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| Không kết nối DB / P1001     | Kiểm tra project Supabase đã hoạt động, host đúng, pooler, mật khẩu URL-encode và mạng |
| Chưa có bảng / P2021         | Chạy `npm run db:migrate` trên đúng database                                           |
| Seed thất bại                | Migration trước; kiểm tra mật khẩu 12 ký tự, tối đa 72 byte; kiểm tra `DIRECT_URL`     |
| Đăng nhập xong vẫn vào hồ sơ | Đổi mật khẩu ban đầu theo yêu cầu                                                      |
| Origin không hợp lệ          | Truy cập đúng URL website, không gửi yêu cầu từ domain khác                            |
| Lớp không cho đăng ký        | Kiểm tra học kỳ, trạng thái lớp, chương trình, tiên quyết, sĩ số, trạng thái sinh viên |
| Chốt điểm thất bại           | Admin đóng đăng ký; giảng viên nhập đủ điểm cho các đăng ký còn hiệu lực               |
| Không xóa được dữ liệu       | Dữ liệu đang được tham chiếu; giữ hồ sơ hoặc khóa tài khoản                            |

Tài liệu tham khảo cấu hình: [Supabase kết nối PostgreSQL](https://supabase.com/docs/guides/database/connecting-to-postgres), [Prisma 6 với Supabase](https://www.prisma.io/docs/orm/v6/overview/databases/supabase), [Vercel environment variables](https://vercel.com/docs/environment-variables). Tài liệu Prisma 7 dùng cấu hình khác; dự án này khóa Prisma 6.
