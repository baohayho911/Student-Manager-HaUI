# API

Base `/api`, session cookie cùng origin. Kết quả `{data:...}` hoặc `{error:"thông báo"}`. POST/PUT/DELETE bắt buộc Origin bằng origin website. ID phải là số nguyên dương. Người dùng đang cần đổi mật khẩu chỉ dùng profile, auth/me, đổi mật khẩu và đăng xuất.

| Method      | Path                           | Quyền / dữ liệu                                              |
| ----------- | ------------------------------ | ------------------------------------------------------------ |
| POST        | auth/login                     | username, password                                           |
| POST        | auth/logout                    | Đã đăng nhập                                                 |
| GET         | auth/me                        | Thông tin công khai tài khoản hiện tại                       |
| POST        | auth/password                  | oldPassword, password, confirm                               |
| GET/PUT     | profile                        | Chính mình; PUT chỉ email, soDienThoai, diaChi               |
| GET/POST    | users                          | Admin; POST theo userSchema                                  |
| PUT/DELETE  | users/:id                      | Admin; không đổi vai trò; không xóa hồ sơ có lịch sử         |
| POST        | users/:id/enabled              | Admin; enabled:boolean                                       |
| POST        | users/:id/password             | Admin; password:string                                       |
| GET         | lookups                        | Admin; danh sách lựa chọn liên kết                           |
| GET/POST    | catalog/:kind                  | Admin; fields theo lib/catalogs.ts                           |
| PUT/DELETE  | catalog/:kind/:key             | Admin; khóa số hoặc khóa ghép nối bằng dấu -                 |
| GET         | sections                       | Lớp theo quyền hiện tại                                      |
| GET         | sections/:id/roster            | Giảng viên phụ trách                                         |
| POST/DELETE | sections/:id/enroll            | Sinh viên đăng ký/hủy cho chính mình                         |
| PUT         | sections/:id/scores/:studentId | Giảng viên phụ trách; diemTX, diemCuoiKy: số 0–10 hoặc null  |
| POST        | sections/:id/publish           | Giảng viên phụ trách; locked:boolean                         |
| GET         | results                        | Kết quả sinh viên hiện tại; điểm nháp bị loại bỏ server-side |
| GET         | dashboard                      | Tổng số phù hợp vai trò                                      |

Các kind: departments, majors, classes, subjects, semesters, curricula, prerequisites, sections. Khóa curricula là `monHocId-nganhId`; prerequisites là `monHocId-monTienQuyetId`.

Mã lỗi: 400 dữ liệu/quy tắc, 401 chưa đăng nhập, 403 không có quyền/Origin, 404 endpoint không tồn tại, 409 trùng khóa/tham chiếu/xung đột, 413 payload quá lớn, 429 giới hạn đăng nhập, 500 lỗi hệ thống. Chi tiết schema input nằm cạnh service hoặc lib/catalogs.ts; không tin các trường UI ẩn/disabled.
