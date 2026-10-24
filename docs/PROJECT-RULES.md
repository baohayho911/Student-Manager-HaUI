# Quy ước

- TypeScript strict. UI tiếng Việt; mã nghiệp vụ và tên bảng camelCase/PascalCase như schema.
- Không lưu bí mật trong Git. Mọi input API đều kiểm tra server.
- Không cho người dùng tự đổi vai trò, mã hồ sơ, khoa/lớp hoặc điểm qua profile.
- Không sửa migration đã chạy; tạo migration mới cho thay đổi schema.
- Không chuyển điểm null thành 0; không xuất điểm nháp cho sinh viên.
- Khi thêm danh mục: cập nhật schema, migration, cấu hình, quyền và tài liệu.
- Chạy typecheck, test, lint và build trước khi bàn giao.
