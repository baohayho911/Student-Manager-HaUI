-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "VaiTro" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');

-- CreateTable
CREATE TABLE "TaiKhoan" (
    "id" SERIAL NOT NULL,
    "tenDangNhap" VARCHAR(50) NOT NULL,
    "giaTriBamMatKhau" TEXT NOT NULL,
    "vaiTro" "VaiTro" NOT NULL,
    "hoTen" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150),
    "soDienThoai" VARCHAR(20),
    "ngaySinh" DATE,
    "diaChi" VARCHAR(300),
    "hoatDong" BOOLEAN NOT NULL DEFAULT true,
    "yeuCauDoiMatKhau" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TaiKhoan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhienDangNhap" (
    "tokenHash" TEXT NOT NULL,
    "taiKhoanId" INTEGER NOT NULL,
    "hetHan" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhienDangNhap_pkey" PRIMARY KEY ("tokenHash")
);

-- CreateTable
CREATE TABLE "GioiHanDangNhap" (
    "khoa" TEXT NOT NULL,
    "soLan" INTEGER NOT NULL DEFAULT 0,
    "hetHan" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GioiHanDangNhap_pkey" PRIMARY KEY ("khoa")
);

-- CreateTable
CREATE TABLE "Khoa" (
    "id" SERIAL NOT NULL,
    "maKhoa" VARCHAR(30) NOT NULL,
    "tenKhoa" VARCHAR(150) NOT NULL,
    "dacThuKhoa" VARCHAR(500),
    "truongKhoaId" INTEGER,

    CONSTRAINT "Khoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NganhDaoTao" (
    "id" SERIAL NOT NULL,
    "maNganh" VARCHAR(30) NOT NULL,
    "tenNganh" VARCHAR(150) NOT NULL,
    "yeuCauDauVao" VARCHAR(1000),
    "yeuCauDauRa" VARCHAR(1000),
    "thoiGianHoc" INTEGER NOT NULL DEFAULT 4,
    "khoaId" INTEGER NOT NULL,

    CONSTRAINT "NganhDaoTao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GiangVien" (
    "id" SERIAL NOT NULL,
    "maGiangVien" VARCHAR(30) NOT NULL,
    "hocHam" VARCHAR(100),
    "hocVi" VARCHAR(100),
    "taiKhoanId" INTEGER NOT NULL,
    "khoaId" INTEGER NOT NULL,

    CONSTRAINT "GiangVien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuanTriVien" (
    "id" SERIAL NOT NULL,
    "phongBan" VARCHAR(150),
    "chucVu" VARCHAR(100),
    "khoaId" INTEGER,
    "taiKhoanId" INTEGER NOT NULL,

    CONSTRAINT "QuanTriVien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LopHanhChinh" (
    "id" SERIAL NOT NULL,
    "maLop" VARCHAR(30) NOT NULL,
    "tenLop" VARCHAR(150) NOT NULL,
    "nganhId" INTEGER NOT NULL,
    "coVanId" INTEGER,

    CONSTRAINT "LopHanhChinh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SinhVien" (
    "id" SERIAL NOT NULL,
    "maSinhVien" VARCHAR(30) NOT NULL,
    "nienKhoa" VARCHAR(20) NOT NULL,
    "trangThaiHocTap" VARCHAR(20) NOT NULL DEFAULT 'DANG_HOC',
    "taiKhoanId" INTEGER NOT NULL,
    "lopId" INTEGER NOT NULL,

    CONSTRAINT "SinhVien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonHoc" (
    "id" SERIAL NOT NULL,
    "maMonHoc" VARCHAR(30) NOT NULL,
    "tenMonHoc" VARCHAR(150) NOT NULL,
    "soTinChi" INTEGER NOT NULL,
    "trongSoDiemTX" INTEGER NOT NULL DEFAULT 40,
    "trongSoDiemCuoiKy" INTEGER NOT NULL DEFAULT 60,
    "noiDungMonHoc" VARCHAR(2000),

    CONSTRAINT "MonHoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonHocTienQuyet" (
    "monHocId" INTEGER NOT NULL,
    "monTienQuyetId" INTEGER NOT NULL,
    "diemToiThieu" DECIMAL(4,2) NOT NULL DEFAULT 4,

    CONSTRAINT "MonHocTienQuyet_pkey" PRIMARY KEY ("monHocId","monTienQuyetId")
);

-- CreateTable
CREATE TABLE "ChuongTrinhHoc" (
    "monHocId" INTEGER NOT NULL,
    "nganhId" INTEGER NOT NULL,
    "loaiMon" VARCHAR(20) NOT NULL DEFAULT 'BAT_BUOC',
    "hocKyDuKien" INTEGER NOT NULL,

    CONSTRAINT "ChuongTrinhHoc_pkey" PRIMARY KEY ("monHocId","nganhId")
);

-- CreateTable
CREATE TABLE "HocKy" (
    "id" SERIAL NOT NULL,
    "maHocKy" VARCHAR(30) NOT NULL,
    "tenHocKy" VARCHAR(150) NOT NULL,
    "namHoc" VARCHAR(20) NOT NULL,
    "ngayBatDau" DATE NOT NULL,
    "ngayKetThuc" DATE NOT NULL,

    CONSTRAINT "HocKy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LopHocPhan" (
    "id" SERIAL NOT NULL,
    "maLopHocPhan" VARCHAR(30) NOT NULL,
    "monHocId" INTEGER NOT NULL,
    "hocKyId" INTEGER NOT NULL,
    "giangVienId" INTEGER NOT NULL,
    "siSoToiDa" INTEGER NOT NULL,
    "lichHoc" VARCHAR(200) NOT NULL,
    "phongHoc" VARCHAR(50) NOT NULL,
    "trangThaiLop" VARCHAR(20) NOT NULL DEFAULT 'MO_DANG_KY',
    "khoaDiem" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LopHocPhan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KetQuaHocTap" (
    "sinhVienId" INTEGER NOT NULL,
    "lopHocPhanId" INTEGER NOT NULL,
    "trangThaiDangKy" VARCHAR(20) NOT NULL DEFAULT 'DANG_KY',
    "thoiDiemDangKy" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diemTX" DECIMAL(4,2),
    "diemCuoiKy" DECIMAL(4,2),

    CONSTRAINT "KetQuaHocTap_pkey" PRIMARY KEY ("sinhVienId","lopHocPhanId")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaiKhoan_tenDangNhap_key" ON "TaiKhoan"("tenDangNhap");

-- CreateIndex
CREATE INDEX "PhienDangNhap_taiKhoanId_idx" ON "PhienDangNhap"("taiKhoanId");

-- CreateIndex
CREATE INDEX "PhienDangNhap_hetHan_idx" ON "PhienDangNhap"("hetHan");

-- CreateIndex
CREATE UNIQUE INDEX "Khoa_maKhoa_key" ON "Khoa"("maKhoa");

-- CreateIndex
CREATE UNIQUE INDEX "Khoa_truongKhoaId_key" ON "Khoa"("truongKhoaId");

-- CreateIndex
CREATE UNIQUE INDEX "NganhDaoTao_maNganh_key" ON "NganhDaoTao"("maNganh");

-- CreateIndex
CREATE UNIQUE INDEX "GiangVien_maGiangVien_key" ON "GiangVien"("maGiangVien");

-- CreateIndex
CREATE UNIQUE INDEX "GiangVien_taiKhoanId_key" ON "GiangVien"("taiKhoanId");

-- CreateIndex
CREATE UNIQUE INDEX "QuanTriVien_taiKhoanId_key" ON "QuanTriVien"("taiKhoanId");

-- CreateIndex
CREATE UNIQUE INDEX "LopHanhChinh_maLop_key" ON "LopHanhChinh"("maLop");

-- CreateIndex
CREATE UNIQUE INDEX "SinhVien_maSinhVien_key" ON "SinhVien"("maSinhVien");

-- CreateIndex
CREATE UNIQUE INDEX "SinhVien_taiKhoanId_key" ON "SinhVien"("taiKhoanId");

-- CreateIndex
CREATE UNIQUE INDEX "MonHoc_maMonHoc_key" ON "MonHoc"("maMonHoc");

-- CreateIndex
CREATE UNIQUE INDEX "HocKy_maHocKy_key" ON "HocKy"("maHocKy");

-- CreateIndex
CREATE UNIQUE INDEX "LopHocPhan_maLopHocPhan_key" ON "LopHocPhan"("maLopHocPhan");

-- CreateIndex
CREATE INDEX "LopHocPhan_hocKyId_idx" ON "LopHocPhan"("hocKyId");

-- CreateIndex
CREATE INDEX "LopHocPhan_giangVienId_idx" ON "LopHocPhan"("giangVienId");

-- CreateIndex
CREATE INDEX "KetQuaHocTap_lopHocPhanId_trangThaiDangKy_idx" ON "KetQuaHocTap"("lopHocPhanId", "trangThaiDangKy");

-- AddForeignKey
ALTER TABLE "PhienDangNhap" ADD CONSTRAINT "PhienDangNhap_taiKhoanId_fkey" FOREIGN KEY ("taiKhoanId") REFERENCES "TaiKhoan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Khoa" ADD CONSTRAINT "Khoa_truongKhoaId_fkey" FOREIGN KEY ("truongKhoaId") REFERENCES "GiangVien"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NganhDaoTao" ADD CONSTRAINT "NganhDaoTao_khoaId_fkey" FOREIGN KEY ("khoaId") REFERENCES "Khoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiangVien" ADD CONSTRAINT "GiangVien_taiKhoanId_fkey" FOREIGN KEY ("taiKhoanId") REFERENCES "TaiKhoan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiangVien" ADD CONSTRAINT "GiangVien_khoaId_fkey" FOREIGN KEY ("khoaId") REFERENCES "Khoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuanTriVien" ADD CONSTRAINT "QuanTriVien_khoaId_fkey" FOREIGN KEY ("khoaId") REFERENCES "Khoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuanTriVien" ADD CONSTRAINT "QuanTriVien_taiKhoanId_fkey" FOREIGN KEY ("taiKhoanId") REFERENCES "TaiKhoan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LopHanhChinh" ADD CONSTRAINT "LopHanhChinh_nganhId_fkey" FOREIGN KEY ("nganhId") REFERENCES "NganhDaoTao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LopHanhChinh" ADD CONSTRAINT "LopHanhChinh_coVanId_fkey" FOREIGN KEY ("coVanId") REFERENCES "GiangVien"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SinhVien" ADD CONSTRAINT "SinhVien_taiKhoanId_fkey" FOREIGN KEY ("taiKhoanId") REFERENCES "TaiKhoan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SinhVien" ADD CONSTRAINT "SinhVien_lopId_fkey" FOREIGN KEY ("lopId") REFERENCES "LopHanhChinh"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonHocTienQuyet" ADD CONSTRAINT "MonHocTienQuyet_monHocId_fkey" FOREIGN KEY ("monHocId") REFERENCES "MonHoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonHocTienQuyet" ADD CONSTRAINT "MonHocTienQuyet_monTienQuyetId_fkey" FOREIGN KEY ("monTienQuyetId") REFERENCES "MonHoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChuongTrinhHoc" ADD CONSTRAINT "ChuongTrinhHoc_monHocId_fkey" FOREIGN KEY ("monHocId") REFERENCES "MonHoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChuongTrinhHoc" ADD CONSTRAINT "ChuongTrinhHoc_nganhId_fkey" FOREIGN KEY ("nganhId") REFERENCES "NganhDaoTao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LopHocPhan" ADD CONSTRAINT "LopHocPhan_monHocId_fkey" FOREIGN KEY ("monHocId") REFERENCES "MonHoc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LopHocPhan" ADD CONSTRAINT "LopHocPhan_hocKyId_fkey" FOREIGN KEY ("hocKyId") REFERENCES "HocKy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LopHocPhan" ADD CONSTRAINT "LopHocPhan_giangVienId_fkey" FOREIGN KEY ("giangVienId") REFERENCES "GiangVien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KetQuaHocTap" ADD CONSTRAINT "KetQuaHocTap_sinhVienId_fkey" FOREIGN KEY ("sinhVienId") REFERENCES "SinhVien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KetQuaHocTap" ADD CONSTRAINT "KetQuaHocTap_lopHocPhanId_fkey" FOREIGN KEY ("lopHocPhanId") REFERENCES "LopHocPhan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Database constraints complement validation in the application.
ALTER TABLE "MonHoc" ADD CONSTRAINT "mon_score_weights" CHECK ("trongSoDiemTX" BETWEEN 0 AND 100 AND "trongSoDiemCuoiKy" BETWEEN 0 AND 100 AND "trongSoDiemTX" + "trongSoDiemCuoiKy" = 100), ADD CONSTRAINT "mon_credits" CHECK ("soTinChi" > 0);
ALTER TABLE "HocKy" ADD CONSTRAINT "semester_dates" CHECK ("ngayKetThuc" >= "ngayBatDau");
ALTER TABLE "LopHocPhan" ADD CONSTRAINT "section_capacity" CHECK ("siSoToiDa" > 0), ADD CONSTRAINT "section_state" CHECK ("trangThaiLop" IN ('MO_DANG_KY','DONG_DANG_KY','HOAN_THANH')), ADD CONSTRAINT "section_lock" CHECK (NOT "khoaDiem" OR "trangThaiLop" <> 'MO_DANG_KY');
ALTER TABLE "KetQuaHocTap" ADD CONSTRAINT "score_range" CHECK (("diemTX" IS NULL OR "diemTX" BETWEEN 0 AND 10) AND ("diemCuoiKy" IS NULL OR "diemCuoiKy" BETWEEN 0 AND 10)), ADD CONSTRAINT "enrollment_state" CHECK ("trangThaiDangKy" IN ('DANG_KY','HUY'));
ALTER TABLE "MonHocTienQuyet" ADD CONSTRAINT "prerequisite_distinct" CHECK ("monHocId" <> "monTienQuyetId"), ADD CONSTRAINT "prerequisite_score" CHECK ("diemToiThieu" BETWEEN 0 AND 10);
ALTER TABLE "ChuongTrinhHoc" ADD CONSTRAINT "curriculum_semester" CHECK ("hocKyDuKien" > 0);
-- This app accesses PostgreSQL only from the Next.js backend, not Supabase Data API.
-- Enabling RLS without public policies blocks anonymous/authenticated API access.
DO $$
DECLARE t text;
BEGIN
 FOREACH t IN ARRAY ARRAY['TaiKhoan','PhienDangNhap','GioiHanDangNhap','Khoa','NganhDaoTao','GiangVien','QuanTriVien','LopHanhChinh','SinhVien','MonHoc','MonHocTienQuyet','ChuongTrinhHoc','HocKy','LopHocPhan','KetQuaHocTap'] LOOP
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN EXECUTE format('REVOKE ALL ON TABLE %I FROM anon', t); END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN EXECUTE format('REVOKE ALL ON TABLE %I FROM authenticated', t); END IF;
 END LOOP;
END $$;
