import { db } from "@/server/db";
import { profileSchema } from "@/features/users/schemas";
import type { User } from "@/types";
export async function profile(u: User) {
  const [st, gv, admin] = await Promise.all([
    db.sinhVien.findUnique({
      where: { taiKhoanId: u.id },
      include: { lop: { include: { nganh: true } } },
    }),
    db.giangVien.findUnique({
      where: { taiKhoanId: u.id },
      include: { khoa: true },
    }),
    db.quanTriVien.findUnique({ where: { taiKhoanId: u.id } }),
  ]);
  return {
    ...u,
    chiTiet: st
      ? {
          maHoSo: st.maSinhVien,
          lop: st.lop.tenLop,
          nganh: st.lop.nganh.tenNganh,
          nienKhoa: st.nienKhoa,
          trangThaiHocTap: st.trangThaiHocTap,
        }
      : gv
        ? {
            maHoSo: gv.maGiangVien,
            khoa: gv.khoa.tenKhoa,
            hocHam: gv.hocHam,
            hocVi: gv.hocVi,
          }
        : { phongBan: admin?.phongBan, chucVu: admin?.chucVu },
  };
}
export async function updateProfile(u: User, body: unknown) {
  // Name and birth date are maintained by administration.
  const editable = profileSchema
    .pick({ email: true, soDienThoai: true, diaChi: true })
    .parse(body);
  await db.taiKhoan.update({ where: { id: u.id }, data: editable });
  return { ok: true };
}
