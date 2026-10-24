import { z } from "zod";
export const passwordSchema = z
  .string()
  .min(12, "Mật khẩu cần ít nhất 12 ký tự")
  .refine((v) => Buffer.byteLength(v, "utf8") <= 72, "Mật khẩu tối đa 72 byte");
export const profileSchema = z.object({
  hoTen: z.string().trim().min(1).max(150),
  email: z
    .union([z.literal(""), z.email().max(150)])
    .transform((v) => v || null),
  soDienThoai: z
    .string()
    .trim()
    .max(20)
    .refine(
      (v) => !v || /^[+0-9 ()-]{7,20}$/.test(v),
      "Số điện thoại không hợp lệ",
    )
    .transform((v) => v || null),
  ngaySinh: z
    .string()
    .refine(
      (v) =>
        !v ||
        (/^\d{4}-\d{2}-\d{2}$/.test(v) &&
          !isNaN(Date.parse(v)) &&
          new Date(v).toISOString().slice(0, 10) === v &&
          v <= new Date().toISOString().slice(0, 10)),
      "Ngày sinh không hợp lệ",
    )
    .transform((v) => (v ? new Date(v + "T00:00:00Z") : null)),
  diaChi: z
    .string()
    .trim()
    .max(300)
    .transform((v) => v || null),
});
export const userSchema = profileSchema.extend({
  tenDangNhap: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9._-]{2,50}$/,
      "Tên đăng nhập chỉ chứa chữ, số, dấu chấm, gạch dưới hoặc gạch ngang",
    ),
  vaiTro: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
  maHoSo: z.string().trim().max(30).optional().default(""),
  khoaId: z.coerce.number().int().positive().nullable(),
  lopId: z.coerce.number().int().positive().nullable(),
  nienKhoa: z.string().max(20).default(""),
  trangThaiHocTap: z
    .enum(["DANG_HOC", "BAO_LUU", "THOI_HOC", "TOT_NGHIEP"])
    .default("DANG_HOC"),
  hocHam: z.string().max(100).default(""),
  hocVi: z.string().max(100).default(""),
  phongBan: z.string().max(150).default(""),
  chucVu: z.string().max(100).default(""),
  matKhau: z.string().default(""),
});
