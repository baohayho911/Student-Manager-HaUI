import { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { requireThat } from "@/server/errors";
import { permit } from "@/server/permissions";
import type { User } from "@/types";
export async function checkTeacher(
  tx: Prisma.TransactionClient,
  u: User,
  id: number,
) {
  permit(u, "TEACHER");
  const s = await tx.lopHocPhan.findUniqueOrThrow({
    where: { id },
    include: { giangVien: true, monHoc: true },
  });
  requireThat(
    s.giangVien.taiKhoanId === u.id,
    "Bạn không phụ trách lớp học phần này.",
    403,
  );
  return s;
}
export async function listSections(u: User) {
  const where: Prisma.LopHocPhanWhereInput =
    u.vaiTro === "TEACHER"
      ? { giangVien: { taiKhoanId: u.id } }
      : u.vaiTro === "STUDENT"
        ? {
            OR: [
              { trangThaiLop: "MO_DANG_KY" },
              { ketQua: { some: { sinhVien: { taiKhoanId: u.id } } } },
            ],
          }
        : {};
  const sections = await db.lopHocPhan.findMany({
    where,
    include: {
      monHoc: true,
      hocKy: true,
      giangVien: { include: { taiKhoan: { select: { hoTen: true } } } },
      _count: { select: { ketQua: { where: { trangThaiDangKy: "DANG_KY" } } } },
    },
    orderBy: { id: "desc" },
  });
  const registered =
    u.vaiTro === "STUDENT"
      ? await db.ketQuaHocTap.findMany({
          where: { sinhVien: { taiKhoanId: u.id } },
          select: { lopHocPhanId: true, trangThaiDangKy: true },
        })
      : [];
  return sections.map((s) => ({
    ...s,
    tenMonHoc: s.monHoc.tenMonHoc,
    soTinChi: s.monHoc.soTinChi,
    tenHocKy: s.hocKy.tenHocKy + " · " + s.hocKy.namHoc,
    tenGiangVien: s.giangVien.taiKhoan.hoTen,
    siSo: s._count.ketQua,
    dangKy:
      registered.find((r) => r.lopHocPhanId === s.id)?.trangThaiDangKy ?? "",
  }));
}
export async function roster(u: User, id: number) {
  await checkTeacher(db, u, id);
  return db.ketQuaHocTap.findMany({
    where: { lopHocPhanId: id, trangThaiDangKy: "DANG_KY" },
    include: {
      sinhVien: {
        include: { taiKhoan: { select: { hoTen: true, email: true } } },
      },
    },
    orderBy: { sinhVienId: "asc" },
  });
}
