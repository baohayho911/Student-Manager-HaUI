import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/server/db";
import { requireThat } from "@/server/errors";
import { createSession, digest, logout } from "@/server/auth/session";
import { passwordSchema } from "@/features/users/schemas";
import type { User } from "@/types";
const dummyHash =
  "$2b$12$C6UzMDM.H6dfI/f/IKcEe.2RFZR7nG0VeSLmLiC8xTK8VJ6s9K4i6";
export async function login(body: unknown) {
  const b = z
    .object({
      username: z.string().trim().toLowerCase().min(1).max(50),
      password: z.string().min(1).max(200),
    })
    .parse(body);
  const key = digest(b.username),
    now = new Date();
  await db.gioiHanDangNhap.deleteMany({ where: { hetHan: { lt: now } } });
  const limit = await db.gioiHanDangNhap.upsert({
    where: { khoa: key },
    create: {
      khoa: key,
      soLan: 1,
      hetHan: new Date(Date.now() + 15 * 60 * 1000),
    },
    update: { soLan: { increment: 1 } },
  });
  requireThat(
    limit.soLan <= 10,
    "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi 15 phút.",
    429,
  );
  const user = await db.taiKhoan.findUnique({
    where: { tenDangNhap: b.username },
  });
  const valid = await compare(b.password, user?.giaTriBamMatKhau ?? dummyHash);
  requireThat(
    user && valid && user.hoatDong,
    "Tên đăng nhập hoặc mật khẩu không đúng, hoặc tài khoản đã bị khóa.",
    401,
  );
  await db.gioiHanDangNhap.deleteMany({ where: { khoa: key } });
  await logout();
  await createSession(user.id);
  return { ok: true };
}
export async function changePassword(u: User, body: unknown) {
  const b = z
    .object({
      oldPassword: z.string(),
      password: passwordSchema,
      confirm: z.string(),
    })
    .refine((v) => v.password === v.confirm, "Xác nhận mật khẩu không khớp")
    .parse(body);
  const user = await db.taiKhoan.findUniqueOrThrow({ where: { id: u.id } });
  requireThat(
    await compare(b.oldPassword, user.giaTriBamMatKhau),
    "Mật khẩu hiện tại không đúng.",
  );
  requireThat(
    b.oldPassword !== b.password,
    "Mật khẩu mới phải khác mật khẩu hiện tại.",
  );
  await db.$transaction([
    db.taiKhoan.update({
      where: { id: u.id },
      data: {
        giaTriBamMatKhau: await hash(b.password, 12),
        yeuCauDoiMatKhau: false,
      },
    }),
    db.phienDangNhap.deleteMany({ where: { taiKhoanId: u.id } }),
  ]);
  await createSession(u.id);
  return { ok: true };
}
