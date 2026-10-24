import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { passwordSchema } from "../src/features/users/schemas";
const db = new PrismaClient({
  datasourceUrl: process.env.DIRECT_URL || process.env.DATABASE_URL,
});
async function main() {
  const password = passwordSchema.parse(process.env.SEED_ADMIN_PASSWORD);
  const admin = await db.taiKhoan.upsert({
    where: { tenDangNhap: "admin" },
    update: {},
    create: {
      tenDangNhap: "admin",
      hoTen: "Quản trị viên",
      vaiTro: "ADMIN",
      giaTriBamMatKhau: await hash(password, 12),
      quanTriVien: { create: { phongBan: "Phòng đào tạo" } },
    },
  });
  console.log(
    "Đã bảo đảm tài khoản admin tồn tại. Không ghi đè mật khẩu tài khoản cũ.",
  );
  if (process.env.SEED_DEMO !== "true") return;
  const demo = passwordSchema.parse(process.env.SEED_DEMO_PASSWORD);
  if ((await db.khoa.count()) > 0) {
    console.log("Bỏ qua dữ liệu mẫu vì đã có khoa.");
    return;
  }
  const demoHash = await hash(demo, 12);
  await db.$transaction(
    async (tx) => {
      const khoa = await tx.khoa.create({
        data: { maKhoa: "CNTT", tenKhoa: "Công nghệ thông tin" },
      });
      const nganh = await tx.nganhDaoTao.create({
        data: {
          maNganh: "CNTT",
          tenNganh: "Công nghệ thông tin",
          khoaId: khoa.id,
        },
      });
      const gv = await tx.taiKhoan.create({
        data: {
          tenDangNhap: "gv01",
          hoTen: "Nguyễn Minh An",
          vaiTro: "TEACHER",
          giaTriBamMatKhau: demoHash,
          giangVien: {
            create: { maGiangVien: "GV001", khoaId: khoa.id, hocVi: "Thạc sĩ" },
          },
        },
        include: { giangVien: true },
      });
      const lop = await tx.lopHanhChinh.create({
        data: {
          maLop: "CNTT01",
          tenLop: "Công nghệ thông tin 01",
          nganhId: nganh.id,
          coVanId: gv.giangVien!.id,
        },
      });
      const sv = await tx.taiKhoan.create({
        data: {
          tenDangNhap: "sv01",
          hoTen: "Trần Bảo Anh",
          vaiTro: "STUDENT",
          giaTriBamMatKhau: demoHash,
          sinhVien: {
            create: {
              maSinhVien: "SV001",
              lopId: lop.id,
              nienKhoa: "2026–2030",
            },
          },
        },
        include: { sinhVien: true },
      });
      const sv2 = await tx.taiKhoan.create({
        data: {
          tenDangNhap: "sv02",
          hoTen: "Lê Minh Bình",
          vaiTro: "STUDENT",
          giaTriBamMatKhau: demoHash,
          sinhVien: {
            create: {
              maSinhVien: "SV002",
              lopId: lop.id,
              nienKhoa: "2026–2030",
            },
          },
        },
        include: { sinhVien: true },
      });
      const year = new Date().getUTCFullYear();
      const hk = await tx.hocKy.create({
        data: {
          maHocKy: `HK1-${year}`,
          tenHocKy: "Học kỳ 1",
          namHoc: `${year}–${year + 1}`,
          ngayBatDau: new Date(`${year}-01-01`),
          ngayKetThuc: new Date(`${year + 1}-12-31`),
        },
      });
      const basic = await tx.monHoc.create({
        data: {
          maMonHoc: "IT001",
          tenMonHoc: "Nhập môn lập trình",
          soTinChi: 3,
        },
      });
      const advanced = await tx.monHoc.create({
        data: {
          maMonHoc: "IT002",
          tenMonHoc: "Cấu trúc dữ liệu và giải thuật",
          soTinChi: 3,
          dieuKien: { create: { monTienQuyetId: basic.id } },
        },
      });
      const sql = await tx.monHoc.create({
        data: { maMonHoc: "IT003", tenMonHoc: "Cơ sở dữ liệu", soTinChi: 3 },
      });
      for (const m of [basic, advanced, sql])
        await tx.chuongTrinhHoc.create({
          data: {
            nganhId: nganh.id,
            monHocId: m.id,
            hocKyDuKien: m.id === basic.id ? 1 : 2,
          },
        });
      const base = {
        hocKyId: hk.id,
        giangVienId: gv.giangVien!.id,
        siSoToiDa: 40,
        phongHoc: "A1-301",
      };
      const old = await tx.lopHocPhan.create({
        data: {
          ...base,
          maLopHocPhan: "IT001-01",
          monHocId: basic.id,
          lichHoc: "Thứ 2, tiết 1–3",
          trangThaiLop: "HOAN_THANH",
          khoaDiem: true,
        },
      });
      await tx.ketQuaHocTap.create({
        data: {
          sinhVienId: sv.sinhVien!.id,
          lopHocPhanId: old.id,
          diemTX: 8,
          diemCuoiKy: 7,
        },
      });
      await tx.lopHocPhan.create({
        data: {
          ...base,
          maLopHocPhan: "IT002-01",
          monHocId: advanced.id,
          lichHoc: "Thứ 3, tiết 1–3",
        },
      });
      const open = await tx.lopHocPhan.create({
        data: {
          ...base,
          maLopHocPhan: "IT003-01",
          monHocId: sql.id,
          lichHoc: "Thứ 4, tiết 4–6",
        },
      });
      await tx.ketQuaHocTap.create({
        data: { sinhVienId: sv2.sinhVien!.id, lopHocPhanId: open.id },
      });
      await tx.quanTriVien.update({
        where: { taiKhoanId: admin.id },
        data: { khoaId: khoa.id },
      });
    },
    { timeout: 20000 },
  );
  console.log(
    "Đã tạo dữ liệu minh họa và gv01, sv01, sv02. Tất cả phải đổi mật khẩu khi đăng nhập lần đầu.",
  );
}
main()
  .catch(() => {
    console.error(
      "Seed thất bại. Kiểm tra kết nối, migration và mật khẩu ít nhất 12 ký tự (tối đa 72 byte).",
    );
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
