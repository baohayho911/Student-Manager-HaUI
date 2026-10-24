export type Role = "ADMIN" | "TEACHER" | "STUDENT";
export type Row = Record<string, unknown> & { id?: number };
export type User = {
  id: number;
  tenDangNhap: string;
  hoTen: string;
  vaiTro: Role;
  yeuCauDoiMatKhau: boolean;
  email: string | null;
  soDienThoai: string | null;
  ngaySinh: string | null;
  diaChi: string | null;
};
export type Field = {
  key: string;
  label: string;
  type?: "number" | "date" | "password" | "email" | "textarea";
  required?: boolean;
  options?: Record<string, string>;
  lookup?: string;
  min?: number;
  max?: number;
};
export type Catalog = {
  title: string;
  description: string;
  model: string;
  fields: Field[];
  compound?: string[];
};
