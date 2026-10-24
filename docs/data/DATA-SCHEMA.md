# Mô hình dữ liệu triển khai

Nguồn chuẩn: `prisma/schema.prisma`. Đây là mô hình mới từ ảnh logic đã điều chỉnh, không phải bản 11 bảng của ứng dụng Spring Boot trước đó.

Các ID số là khóa nội bộ; các mã nghiệp vụ có UNIQUE để tra cứu. Thông tin cá nhân nằm trong TaiKhoan. Quan hệ tiên quyết là hai FK tới MonHoc. Không lưu số lượng sinh viên/môn hay trạng thái đạt tiên quyết cố định.

## TaiKhoan

```prisma
model TaiKhoan {
 id Int @id @default(autoincrement())
 tenDangNhap String @unique @db.VarChar(50)
 giaTriBamMatKhau String
 vaiTro VaiTro
 hoTen String @db.VarChar(150)
 email String? @db.VarChar(150)
 soDienThoai String? @db.VarChar(20)
 ngaySinh DateTime? @db.Date
 diaChi String? @db.VarChar(300)
 hoatDong Boolean @default(true)
 yeuCauDoiMatKhau Boolean @default(true)
 sinhVien SinhVien?
 giangVien GiangVien?
 quanTriVien QuanTriVien?
 phien PhienDangNhap[]
}
```

## PhienDangNhap

```prisma
model PhienDangNhap {
 tokenHash String @id
 taiKhoanId Int
 hetHan DateTime
 taiKhoan TaiKhoan @relation(fields:[taiKhoanId],references:[id],onDelete:Cascade)
 @@index([taiKhoanId])
 @@index([hetHan])
}
```

## GioiHanDangNhap

```prisma
model GioiHanDangNhap {
 khoa String @id
 soLan Int @default(0)
 hetHan DateTime
}
```

## Khoa

```prisma
model Khoa {
 id Int @id @default(autoincrement())
 maKhoa String @unique @db.VarChar(30)
 tenKhoa String @db.VarChar(150)
 dacThuKhoa String? @db.VarChar(500)
 truongKhoaId Int? @unique
 truongKhoa GiangVien? @relation("TruongKhoa",fields:[truongKhoaId],references:[id],onDelete:SetNull)
 nganh NganhDaoTao[]
 giangVien GiangVien[] @relation("GiangVienKhoa")
 quanTriVien QuanTriVien[]
}
```

## NganhDaoTao

```prisma
model NganhDaoTao {
 id Int @id @default(autoincrement())
 maNganh String @unique @db.VarChar(30)
 tenNganh String @db.VarChar(150)
 yeuCauDauVao String? @db.VarChar(1000)
 yeuCauDauRa String? @db.VarChar(1000)
 thoiGianHoc Int @default(4)
 khoaId Int
 khoa Khoa @relation(fields:[khoaId],references:[id],onDelete:Restrict)
 lop LopHanhChinh[]
 chuongTrinh ChuongTrinhHoc[]
}
```

## GiangVien

```prisma
model GiangVien {
 id Int @id @default(autoincrement())
 maGiangVien String @unique @db.VarChar(30)
 hocHam String? @db.VarChar(100)
 hocVi String? @db.VarChar(100)
 taiKhoanId Int @unique
 khoaId Int
 taiKhoan TaiKhoan @relation(fields:[taiKhoanId],references:[id],onDelete:Restrict)
 khoa Khoa @relation("GiangVienKhoa",fields:[khoaId],references:[id],onDelete:Restrict)
 truongKhoa Khoa? @relation("TruongKhoa")
 lopCoVan LopHanhChinh[]
 lopHocPhan LopHocPhan[]
}
```

## QuanTriVien

```prisma
model QuanTriVien {
 id Int @id @default(autoincrement())
 phongBan String? @db.VarChar(150)
 chucVu String? @db.VarChar(100)
 khoaId Int?
 taiKhoanId Int @unique
 khoa Khoa? @relation(fields:[khoaId],references:[id],onDelete:SetNull)
 taiKhoan TaiKhoan @relation(fields:[taiKhoanId],references:[id],onDelete:Restrict)
}
```

## LopHanhChinh

```prisma
model LopHanhChinh {
 id Int @id @default(autoincrement())
 maLop String @unique @db.VarChar(30)
 tenLop String @db.VarChar(150)
 nganhId Int
 coVanId Int?
 nganh NganhDaoTao @relation(fields:[nganhId],references:[id],onDelete:Restrict)
 coVan GiangVien? @relation(fields:[coVanId],references:[id],onDelete:SetNull)
 sinhVien SinhVien[]
}
```

## SinhVien

```prisma
model SinhVien {
 id Int @id @default(autoincrement())
 maSinhVien String @unique @db.VarChar(30)
 nienKhoa String @db.VarChar(20)
 trangThaiHocTap String @default("DANG_HOC") @db.VarChar(20)
 taiKhoanId Int @unique
 lopId Int
 taiKhoan TaiKhoan @relation(fields:[taiKhoanId],references:[id],onDelete:Restrict)
 lop LopHanhChinh @relation(fields:[lopId],references:[id],onDelete:Restrict)
 ketQua KetQuaHocTap[]
}
```

## MonHoc

```prisma
model MonHoc {
 id Int @id @default(autoincrement())
 maMonHoc String @unique @db.VarChar(30)
 tenMonHoc String @db.VarChar(150)
 soTinChi Int
 trongSoDiemTX Int @default(40)
 trongSoDiemCuoiKy Int @default(60)
 noiDungMonHoc String? @db.VarChar(2000)
 chuongTrinh ChuongTrinhHoc[]
 lopHocPhan LopHocPhan[]
 dieuKien MonHocTienQuyet[] @relation("MonCanHoc")
 laTienQuyet MonHocTienQuyet[] @relation("MonTruoc")
}
```

## MonHocTienQuyet

```prisma
model MonHocTienQuyet {
 monHocId Int
 monTienQuyetId Int
 diemToiThieu Decimal @default(4) @db.Decimal(4,2)
 monHoc MonHoc @relation("MonCanHoc",fields:[monHocId],references:[id],onDelete:Restrict)
 monTienQuyet MonHoc @relation("MonTruoc",fields:[monTienQuyetId],references:[id],onDelete:Restrict)
 @@id([monHocId,monTienQuyetId])
}
```

## ChuongTrinhHoc

```prisma
model ChuongTrinhHoc {
 monHocId Int
 nganhId Int
 loaiMon String @default("BAT_BUOC") @db.VarChar(20)
 hocKyDuKien Int
 monHoc MonHoc @relation(fields:[monHocId],references:[id],onDelete:Restrict)
 nganh NganhDaoTao @relation(fields:[nganhId],references:[id],onDelete:Restrict)
 @@id([monHocId,nganhId])
}
```

## HocKy

```prisma
model HocKy {
 id Int @id @default(autoincrement())
 maHocKy String @unique @db.VarChar(30)
 tenHocKy String @db.VarChar(150)
 namHoc String @db.VarChar(20)
 ngayBatDau DateTime @db.Date
 ngayKetThuc DateTime @db.Date
 lopHocPhan LopHocPhan[]
}
```

## LopHocPhan

```prisma
model LopHocPhan {
 id Int @id @default(autoincrement())
 maLopHocPhan String @unique @db.VarChar(30)
 monHocId Int
 hocKyId Int
 giangVienId Int
 siSoToiDa Int
 lichHoc String @db.VarChar(200)
 phongHoc String @db.VarChar(50)
 trangThaiLop String @default("MO_DANG_KY") @db.VarChar(20)
 khoaDiem Boolean @default(false)
 monHoc MonHoc @relation(fields:[monHocId],references:[id],onDelete:Restrict)
 hocKy HocKy @relation(fields:[hocKyId],references:[id],onDelete:Restrict)
 giangVien GiangVien @relation(fields:[giangVienId],references:[id],onDelete:Restrict)
 ketQua KetQuaHocTap[]
 @@index([hocKyId])
 @@index([giangVienId])
}
```

## KetQuaHocTap

```prisma
model KetQuaHocTap {
 sinhVienId Int
 lopHocPhanId Int
 trangThaiDangKy String @default("DANG_KY") @db.VarChar(20)
 thoiDiemDangKy DateTime @default(now())
 diemTX Decimal? @db.Decimal(4,2)
 diemCuoiKy Decimal? @db.Decimal(4,2)
 sinhVien SinhVien @relation(fields:[sinhVienId],references:[id],onDelete:Restrict)
 lopHocPhan LopHocPhan @relation(fields:[lopHocPhanId],references:[id],onDelete:Restrict)
 @@id([sinhVienId,lopHocPhanId])
 @@index([lopHocPhanId,trangThaiDangKy])
}
```

## Ràng buộc nghiệp vụ

- Học kỳ thực tế gắn với lớp học phần; học kỳ dự kiến là số thứ tự trong chương trình.
- Đăng ký và điểm cùng bảng; khóa ghép cho phép lưu các lần học lại ở lớp khác.
- Một tài khoản chỉ có một hồ sơ theo vai trò. Ràng buộc khớp vai trò được kiểm tra ở service, không tự tạo bảng hồ sơ qua SQL ngoài ứng dụng.
- Trưởng khoa thuộc khoa tương ứng; tiên quyết không có chu trình; backend kiểm tra các điều kiện liên bảng.
- PhienDangNhap và GioiHanDangNhap là bảng kỹ thuật bổ sung cho bảo mật.
- SQL migration bổ sung CHECK và RLS ngoài các khai báo Prisma; không dùng db push thay migrate deploy.
