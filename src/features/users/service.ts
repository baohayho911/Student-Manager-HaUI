import { hash } from "bcryptjs";
import { db, transaction } from "@/server/db";
import { requireThat } from "@/server/errors";
import { publicUserSelect } from "@/server/auth/session";
import { userSchema, passwordSchema } from "./schemas";
import type { User } from "@/types";
export async function listUsers() {
  const users = await db.taiKhoan.findMany({
    select: {
      ...publicUserSelect,
      hoatDong: true,
      sinhVien: true,
      giangVien: true,
      quanTriVien: true,
    },
    orderBy: { id: "desc" },
  });
  return users.map((u) => ({
    ...u,
    maHoSo: u.sinhVien?.maSinhVien ?? u.giangVien?.maGiangVien ?? "",
    khoaId: u.giangVien?.khoaId ?? u.quanTriVien?.khoaId ?? null,
    lopId: u.sinhVien?.lopId ?? null,
    nienKhoa: u.sinhVien?.nienKhoa ?? "",
    trangThaiHocTap: u.sinhVien?.trangThaiHocTap ?? "DANG_HOC",
    hocHam: u.giangVien?.hocHam ?? "",
    hocVi: u.giangVien?.hocVi ?? "",
    phongBan: u.quanTriVien?.phongBan ?? "",
    chucVu: u.quanTriVien?.chucVu ?? "",
    ngaySinh: u.ngaySinh?.toISOString().slice(0, 10) ?? "",
  }));
}
export async function saveUser(id: number | null, body: unknown) {
  const b = userSchema.parse(body);
  if (b.vaiTro === "STUDENT")
    requireThat(
      b.lopId && b.nienKhoa && /^[A-Za-z0-9._-]{2,30}$/.test(b.maHoSo),
      "Sinh viên cần mã hồ sơ hợp lệ, lớp và niên khóa.",
    );
  if (b.vaiTro === "TEACHER")
    requireThat(
      b.khoaId && /^[A-Za-z0-9._-]{2,30}$/.test(b.maHoSo),
      "Giảng viên cần mã hồ sơ hợp lệ và khoa.",
    );
  const hashed = id
    ? undefined
    : await hash(passwordSchema.parse(b.matKhau), 12);
  return transaction(async (tx) => {
    const base = {
      tenDangNhap: b.tenDangNhap,
      hoTen: b.hoTen,
      email: b.email,
      soDienThoai: b.soDienThoai,
      ngaySinh: b.ngaySinh,
      diaChi: b.diaChi,
    };
    if (id) {
      const old = await tx.taiKhoan.findUniqueOrThrow({ where: { id } });
      requireThat(
        old.vaiTro === b.vaiTro,
        "Không đổi vai trò của hồ sơ đã tạo.",
      );
    }
    const u = id
      ? await tx.taiKhoan.update({ where: { id }, data: base })
      : await tx.taiKhoan.create({
          data: { ...base, vaiTro: b.vaiTro, giaTriBamMatKhau: hashed! },
        });
    if (b.vaiTro === "STUDENT") {
      const data = {
        maSinhVien: b.maHoSo,
        lopId: b.lopId!,
        nienKhoa: b.nienKhoa,
        trangThaiHocTap: b.trangThaiHocTap,
      };
      await tx.sinhVien.upsert({
        where: { taiKhoanId: u.id },
        create: { ...data, taiKhoanId: u.id },
        update: data,
      });
    } else if (b.vaiTro === "TEACHER") {
      const old = await tx.giangVien.findUnique({
        where: { taiKhoanId: u.id },
        include: { truongKhoa: true },
      });
      requireThat(
        !old?.truongKhoa || old.truongKhoa.id === b.khoaId,
        "Hãy bỏ phân công trưởng khoa trước khi chuyển khoa.",
      );
      const data = {
        maGiangVien: b.maHoSo,
        khoaId: b.khoaId!,
        hocHam: b.hocHam,
        hocVi: b.hocVi,
      };
      await tx.giangVien.upsert({
        where: { taiKhoanId: u.id },
        create: { ...data, taiKhoanId: u.id },
        update: data,
      });
    } else {
      const data = { phongBan: b.phongBan, chucVu: b.chucVu, khoaId: b.khoaId };
      await tx.quanTriVien.upsert({
        where: { taiKhoanId: u.id },
        create: { ...data, taiKhoanId: u.id },
        update: data,
      });
    }
    return { id: u.id };
  });
}
export async function toggleUser(actor: User, id: number, enabled: boolean) {
  requireThat(actor.id !== id, "Không thể khóa tài khoản đang sử dụng.");
  return transaction(async (tx) => {
    const target = await tx.taiKhoan.findUniqueOrThrow({ where: { id } });
    if (!enabled && target.vaiTro === "ADMIN")
      requireThat(
        (await tx.taiKhoan.count({
          where: { vaiTro: "ADMIN", hoatDong: true, id: { not: id } },
        })) > 0,
        "Phải giữ ít nhất một quản trị viên hoạt động.",
      );
    await tx.taiKhoan.update({ where: { id }, data: { hoatDong: enabled } });
    if (!enabled)
      await tx.phienDangNhap.deleteMany({ where: { taiKhoanId: id } });
    return { ok: true };
  });
}
export async function resetPassword(
  actor: User,
  id: number,
  password: unknown,
) {
  requireThat(actor.id !== id, "Hãy đổi mật khẩu ở trang thông tin cá nhân.");
  const value = await hash(passwordSchema.parse(password), 12);
  await db.$transaction([
    db.taiKhoan.update({
      where: { id },
      data: { giaTriBamMatKhau: value, yeuCauDoiMatKhau: true },
    }),
    db.phienDangNhap.deleteMany({ where: { taiKhoanId: id } }),
  ]);
  return { ok: true };
}
export async function deleteUser(actor: User, id: number) {
  requireThat(actor.id !== id, "Không thể xóa tài khoản đang sử dụng.");
  return transaction(async (tx) => {
    const u = await tx.taiKhoan.findUniqueOrThrow({
      where: { id },
      include: { sinhVien: true, giangVien: true },
    });
    if (u.vaiTro === "ADMIN")
      requireThat(
        (await tx.taiKhoan.count({
          where: { vaiTro: "ADMIN", hoatDong: true, id: { not: id } },
        })) > 0,
        "Phải giữ một quản trị viên hoạt động.",
      );
    if (u.sinhVien) {
      requireThat(
        (await tx.ketQuaHocTap.count({
          where: { sinhVienId: u.sinhVien.id },
        })) === 0,
        "Sinh viên có lịch sử học tập. Hãy khóa tài khoản để giữ hồ sơ.",
      );
      await tx.sinhVien.delete({ where: { id: u.sinhVien.id } });
    }
    if (u.giangVien) {
      requireThat(
        (await tx.lopHocPhan.count({
          where: { giangVienId: u.giangVien.id },
        })) === 0,
        "Giảng viên đang có lớp học phần. Hãy chuyển phân công hoặc khóa tài khoản.",
      );
      await tx.giangVien.delete({ where: { id: u.giangVien.id } });
    }
    await tx.quanTriVien.deleteMany({ where: { taiKhoanId: id } });
    await tx.taiKhoan.delete({ where: { id } });
    return { ok: true };
  });
}
