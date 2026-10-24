import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { db } from "@/server/db";
import { requireThat } from "@/server/errors";
export const publicUserSelect = {
  id: true,
  tenDangNhap: true,
  hoTen: true,
  vaiTro: true,
  email: true,
  soDienThoai: true,
  ngaySinh: true,
  diaChi: true,
  yeuCauDoiMatKhau: true,
} as const;
const cookieName = "haui_session";
export const digest = (v: string) =>
  createHash("sha256").update(v).digest("hex");
export async function currentUser() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  const s = await db.phienDangNhap.findUnique({
    where: { tokenHash: digest(token) },
    include: { taiKhoan: { select: { ...publicUserSelect, hoatDong: true } } },
  });
  if (!s || s.hetHan < new Date() || !s.taiKhoan.hoatDong) return null;
  const { hoatDong: _, ...u } = s.taiKhoan;
  void _;
  return { ...u, ngaySinh: u.ngaySinh?.toISOString().slice(0, 10) ?? null };
}
export async function needUser() {
  const u = await currentUser();
  requireThat(u, "Vui lòng đăng nhập.", 401);
  return u;
}
export async function createSession(id: number) {
  const token = randomBytes(32).toString("base64url"),
    hetHan = new Date(Date.now() + 8 * 3600 * 1000);
  await db.phienDangNhap.deleteMany({ where: { hetHan: { lt: new Date() } } });
  await db.phienDangNhap.create({
    data: { tokenHash: digest(token), taiKhoanId: id, hetHan },
  });
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: hetHan,
  });
}
export async function logout() {
  const jar = await cookies(),
    token = jar.get(cookieName)?.value;
  if (token)
    await db.phienDangNhap.deleteMany({ where: { tokenHash: digest(token) } });
  jar.delete(cookieName);
}
