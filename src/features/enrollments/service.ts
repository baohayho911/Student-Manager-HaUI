import { transaction } from "@/server/db";
import { requireThat } from "@/server/errors";
import { permit } from "@/server/permissions";
import { totalScore } from "@/lib/rules";
import type { User } from "@/types";
export async function register(u: User, sectionId: number) {
  permit(u, "STUDENT");
  return transaction(async (tx) => {
    const st = await tx.sinhVien.findUniqueOrThrow({
      where: { taiKhoanId: u.id },
      include: { lop: true },
    });
    requireThat(
      st.trangThaiHocTap === "DANG_HOC",
      "Chỉ sinh viên đang học được đăng ký.",
    );
    const s = await tx.lopHocPhan.findUniqueOrThrow({
      where: { id: sectionId },
      include: { hocKy: true, monHoc: { include: { dieuKien: true } } },
    });
    requireThat(
      s.trangThaiLop === "MO_DANG_KY" && !s.khoaDiem,
      "Lớp không mở đăng ký.",
    );
    requireThat(
      new Date() <= new Date(s.hocKy.ngayKetThuc.getTime() + 86400000),
      "Học kỳ đã kết thúc.",
    );
    const inProgram = await tx.chuongTrinhHoc.count({
      where: { monHocId: s.monHocId, nganhId: st.lop.nganhId },
    });
    requireThat(
      inProgram > 0,
      "Môn học chưa thuộc chương trình đào tạo của ngành bạn.",
    );
    requireThat(
      (await tx.ketQuaHocTap.count({
        where: {
          sinhVienId: st.id,
          trangThaiDangKy: "DANG_KY",
          lopHocPhan: { hocKyId: s.hocKyId, monHocId: s.monHocId },
        },
      })) === 0,
      "Bạn đã đăng ký môn này trong học kỳ.",
    );
    requireThat(
      (await tx.ketQuaHocTap.count({
        where: { lopHocPhanId: sectionId, trangThaiDangKy: "DANG_KY" },
      })) < s.siSoToiDa,
      "Lớp đã đủ sĩ số.",
    );
    const prior = await tx.ketQuaHocTap.findMany({
      where: {
        sinhVienId: st.id,
        trangThaiDangKy: "DANG_KY",
        lopHocPhan: { khoaDiem: true },
      },
      include: { lopHocPhan: { include: { monHoc: true } } },
    });
    for (const p of s.monHoc.dieuKien) {
      const passed = prior.some(
        (r) =>
          r.lopHocPhan.monHocId === p.monTienQuyetId &&
          (totalScore(
            r.diemTX === null ? null : Number(r.diemTX),
            r.diemCuoiKy === null ? null : Number(r.diemCuoiKy),
            r.lopHocPhan.monHoc.trongSoDiemTX,
          ) ?? -1) >= Number(p.diemToiThieu),
      );
      requireThat(
        passed,
        "Bạn chưa đạt đủ các môn tiên quyết. Hãy kiểm tra kết quả đã công bố.",
      );
    }
    await tx.ketQuaHocTap.upsert({
      where: {
        sinhVienId_lopHocPhanId: { sinhVienId: st.id, lopHocPhanId: sectionId },
      },
      create: { sinhVienId: st.id, lopHocPhanId: sectionId },
      update: { trangThaiDangKy: "DANG_KY", thoiDiemDangKy: new Date() },
    });
    return { ok: true };
  });
}
export async function cancelRegistration(u: User, sectionId: number) {
  permit(u, "STUDENT");
  return transaction(async (tx) => {
    const st = await tx.sinhVien.findUniqueOrThrow({
      where: { taiKhoanId: u.id },
    });
    const r = await tx.ketQuaHocTap.findUniqueOrThrow({
      where: {
        sinhVienId_lopHocPhanId: { sinhVienId: st.id, lopHocPhanId: sectionId },
      },
      include: { lopHocPhan: true },
    });
    requireThat(r.trangThaiDangKy === "DANG_KY", "Đăng ký đã hủy.");
    requireThat(
      r.lopHocPhan.trangThaiLop === "MO_DANG_KY" && !r.lopHocPhan.khoaDiem,
      "Chỉ hủy khi lớp đang mở đăng ký và chưa chốt điểm.",
    );
    requireThat(
      r.diemTX === null && r.diemCuoiKy === null,
      "Đã có điểm, không thể hủy.",
    );
    await tx.ketQuaHocTap.update({
      where: {
        sinhVienId_lopHocPhanId: { sinhVienId: st.id, lopHocPhanId: sectionId },
      },
      data: { trangThaiDangKy: "HUY" },
    });
    return { ok: true };
  });
}
