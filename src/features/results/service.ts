import { z } from "zod";
import { db, transaction } from "@/server/db";
import { requireThat } from "@/server/errors";
import { checkTeacher } from "@/features/sections/service";
import { permit } from "@/server/permissions";
import { letterScore, totalScore } from "@/lib/rules";
import type { User } from "@/types";
const point = z.preprocess(
  (v) => (v === "" || v === null ? null : v),
  z.coerce.number().min(0).max(10).nullable(),
);
export async function saveScore(
  u: User,
  id: number,
  studentId: number,
  body: unknown,
) {
  const b = z.object({ diemTX: point, diemCuoiKy: point }).parse(body);
  return transaction(async (tx) => {
    const s = await checkTeacher(tx, u, id);
    requireThat(!s.khoaDiem, "Bảng điểm đã chốt. Hãy mở lại trước khi sửa.");
    const key = { sinhVienId: studentId, lopHocPhanId: id };
    const r = await tx.ketQuaHocTap.findUniqueOrThrow({
      where: { sinhVienId_lopHocPhanId: key },
    });
    requireThat(
      r.trangThaiDangKy === "DANG_KY",
      "Không nhập điểm cho đăng ký đã hủy.",
    );
    await tx.ketQuaHocTap.update({
      where: { sinhVienId_lopHocPhanId: key },
      data: b,
    });
    return { ok: true };
  });
}
export async function publish(u: User, id: number, locked: boolean) {
  return transaction(async (tx) => {
    const s = await checkTeacher(tx, u, id);
    if (locked) {
      requireThat(
        s.trangThaiLop !== "MO_DANG_KY",
        "Đóng đăng ký lớp trước khi công bố điểm.",
      );
      requireThat(
        (await tx.ketQuaHocTap.count({
          where: {
            lopHocPhanId: id,
            trangThaiDangKy: "DANG_KY",
            OR: [{ diemTX: null }, { diemCuoiKy: null }],
          },
        })) === 0,
        "Cần nhập đủ điểm cho tất cả sinh viên.",
      );
    }
    await tx.lopHocPhan.update({ where: { id }, data: { khoaDiem: locked } });
    return { ok: true };
  });
}
export async function results(u: User) {
  permit(u, "STUDENT");
  const rows = await db.ketQuaHocTap.findMany({
    where: { sinhVien: { taiKhoanId: u.id } },
    include: { lopHocPhan: { include: { monHoc: true, hocKy: true } } },
    orderBy: { thoiDiemDangKy: "desc" },
  });
  return rows.map((r) => {
    const s = r.lopHocPhan,
      visible = s.khoaDiem && r.trangThaiDangKy === "DANG_KY";
    const tx = visible && r.diemTX !== null ? Number(r.diemTX) : null,
      final = visible && r.diemCuoiKy !== null ? Number(r.diemCuoiKy) : null;
    const total = totalScore(tx, final, s.monHoc.trongSoDiemTX);
    return {
      id: s.id,
      monHocId: s.monHocId,
      maMonHoc: s.monHoc.maMonHoc,
      tenMonHoc: s.monHoc.tenMonHoc,
      maLopHocPhan: s.maLopHocPhan,
      hocKy: s.hocKy.tenHocKy + " · " + s.hocKy.namHoc,
      soTinChi: s.monHoc.soTinChi,
      trangThai:
        r.trangThaiDangKy === "HUY"
          ? "Đã hủy"
          : visible
            ? "Đã công bố"
            : "Chưa công bố",
      diemTX: tx,
      diemCuoiKy: final,
      diemTongKet: total,
      ...letterScore(total),
    };
  });
}
