import { Prisma } from "@prisma/client";
import { z } from "zod";
import { catalogs } from "@/lib/catalogs";
import { hasCycle } from "@/lib/rules";
import { db, transaction } from "@/server/db";
import { requireThat } from "@/server/errors";
import type { Row } from "@/types";
type Args = Record<string, unknown>;
type Delegate = {
  findMany(args?: Args): Promise<Row[]>;
  findUniqueOrThrow(args: Args): Promise<Row>;
  create(args: Args): Promise<Row>;
  update(args: Args): Promise<Row>;
  delete(args: Args): Promise<Row>;
};
function config(kind: string) {
  const c = catalogs[kind];
  requireThat(c, "Danh mục không tồn tại.", 404);
  return c;
}
function repo(tx: Prisma.TransactionClient, kind: string) {
  return (tx as unknown as Record<string, Delegate>)[config(kind).model];
}
export function recordKey(kind: string, r: Row) {
  return (
    config(kind)
      .compound?.map((k) => r[k])
      .join("-") ?? String(r.id)
  );
}
function whereKey(kind: string, key: string) {
  const c = config(kind);
  const vals = key.split("-").map(Number);
  requireThat(
    vals.every((v) => Number.isSafeInteger(v) && v > 0),
    "Mã định danh không hợp lệ.",
  );
  if (!c.compound) {
    requireThat(vals.length === 1, "Mã không hợp lệ.");
    return { id: vals[0] };
  }
  requireThat(vals.length === c.compound.length, "Khóa không hợp lệ.");
  return {
    [c.compound.join("_")]: Object.fromEntries(
      c.compound.map((k, i) => [k, vals[i]]),
    ),
  };
}
export async function listCatalog(kind: string) {
  const c = config(kind);
  return repo(db, kind).findMany({
    orderBy: c.compound ? { [c.compound[0]]: "asc" } : { id: "desc" },
  });
}
function parse(kind: string, body: unknown) {
  const c = config(kind),
    raw = z.record(z.string(), z.unknown()).parse(body),
    out: Args = {};
  for (const f of c.fields) {
    const v = raw[f.key];
    if (v === null || v === undefined || v === "") {
      requireThat(!f.required, "Thiếu " + f.label);
      out[f.key] = null;
      continue;
    }
    if (f.lookup || f.type === "number") {
      let s = z.coerce
        .number()
        .min(f.min ?? (f.lookup ? 1 : 0))
        .max(f.max ?? 2147483647);
      if (f.key !== "diemToiThieu") s = s.int();
      out[f.key] = s.parse(v);
    } else if (f.type === "date") {
      const s = z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .parse(v);
      const date = new Date(s + "T00:00:00Z");
      requireThat(
        !isNaN(date.getTime()) && date.toISOString().slice(0, 10) === s,
        "Ngày không hợp lệ.",
      );
      out[f.key] = date;
    } else {
      const max = f.key.startsWith("ma")
        ? 30
        : f.key === "namHoc"
          ? 20
          : f.key === "phongHoc"
            ? 50
            : f.key === "lichHoc"
              ? 200
              : f.key === "noiDungMonHoc"
                ? 2000
                : f.key === "dacThuKhoa"
                  ? 500
                  : f.type === "textarea"
                    ? 1000
                    : 150;
      const s = z.string().trim().min(1).max(max).parse(v);
      if (f.key.startsWith("ma"))
        requireThat(
          /^[A-Za-z0-9._-]+$/.test(s),
          "Mã chỉ chứa chữ, số, dấu chấm, gạch ngang hoặc gạch dưới.",
        );
      if (f.options)
        requireThat(s in f.options, "Giá trị lựa chọn không hợp lệ.");
      out[f.key] = s;
    }
  }
  return out;
}
export async function saveCatalog(
  kind: string,
  key: string | null,
  body: unknown,
) {
  const data = parse(kind, body),
    c = config(kind);
  return transaction(async (tx) => {
    const old = key
      ? await repo(tx, kind).findUniqueOrThrow({ where: whereKey(kind, key) })
      : null;
    if (old && c.compound)
      for (const f of c.compound)
        requireThat(
          old[f] === data[f],
          "Không đổi khóa của bản ghi. Hãy xóa rồi tạo lại.",
        );
    if (kind === "departments" && data.truongKhoaId) {
      requireThat(key, "Hãy tạo khoa trước rồi phân công trưởng khoa.");
      const teacher = await tx.giangVien.findUniqueOrThrow({
        where: { id: Number(data.truongKhoaId) },
      });
      requireThat(
        teacher.khoaId === Number(key),
        "Trưởng khoa phải thuộc khoa này.",
      );
    }
    if (kind === "subjects") {
      requireThat(
        Number(data.trongSoDiemTX) + Number(data.trongSoDiemCuoiKy) === 100,
        "Tổng trọng số phải bằng 100%.",
      );
      if (old) {
        const changed = ["soTinChi", "trongSoDiemTX", "trongSoDiemCuoiKy"].some(
          (k) => old[k] !== data[k],
        );
        if (changed)
          requireThat(
            (await tx.ketQuaHocTap.count({
              where: { lopHocPhan: { monHocId: Number(key) } },
            })) === 0,
            "Môn đã có lịch sử đăng ký; không đổi tín chỉ hoặc trọng số.",
          );
      }
    }
    if (kind === "semesters")
      requireThat(
        (data.ngayKetThuc as Date) >= (data.ngayBatDau as Date),
        "Ngày kết thúc phải từ ngày bắt đầu trở đi.",
      );
    if (kind === "prerequisites") {
      const edges = await tx.monHocTienQuyet.findMany();
      const proposed = {
        monHocId: Number(data.monHocId),
        monTienQuyetId: Number(data.monTienQuyetId),
      };
      requireThat(
        !hasCycle([
          ...edges.filter(
            (e) =>
              !(
                e.monHocId === proposed.monHocId &&
                e.monTienQuyetId === proposed.monTienQuyetId
              ),
          ),
          proposed,
        ]),
        "Môn tiên quyết tạo chu trình hoặc trỏ tới chính nó.",
      );
    }
    if (kind === "sections") {
      const teacher = await tx.giangVien.findUniqueOrThrow({
        where: { id: Number(data.giangVienId) },
        include: { taiKhoan: true },
      });
      requireThat(
        teacher.taiKhoan.hoatDong,
        "Giảng viên đã bị khóa tài khoản.",
      );
      if (old) {
        const n = await tx.ketQuaHocTap.count({
          where: { lopHocPhanId: Number(key), trangThaiDangKy: "DANG_KY" },
        });
        requireThat(
          Number(data.siSoToiDa) >= n,
          "Sĩ số tối đa không thể thấp hơn số đang đăng ký.",
        );
        if (
          (await tx.ketQuaHocTap.count({
            where: { lopHocPhanId: Number(key) },
          })) > 0
        )
          requireThat(
            old.monHocId === data.monHocId && old.hocKyId === data.hocKyId,
            "Không đổi môn hoặc học kỳ của lớp đã có lịch sử đăng ký.",
          );
        requireThat(
          !old.khoaDiem || data.trangThaiLop !== "MO_DANG_KY",
          "Không mở đăng ký khi đã chốt điểm.",
        );
      }
    }
    const r = key
      ? await repo(tx, kind).update({ where: whereKey(kind, key), data })
      : await repo(tx, kind).create({ data });
    return { key: recordKey(kind, r) };
  });
}
export async function deleteCatalog(kind: string, key: string) {
  config(kind);
  await transaction(async (tx) => {
    await repo(tx, kind).delete({ where: whereKey(kind, key) });
  });
  return { ok: true };
}
export async function lookups() {
  const [departments, majors, classes, subjects, semesters, teachers] =
    await Promise.all([
      db.khoa.findMany(),
      db.nganhDaoTao.findMany(),
      db.lopHanhChinh.findMany(),
      db.monHoc.findMany(),
      db.hocKy.findMany(),
      db.giangVien.findMany({
        include: { taiKhoan: { select: { hoTen: true } } },
      }),
    ]);
  return {
    departments: departments.map((x) => ({
      id: x.id,
      label: x.maKhoa + " — " + x.tenKhoa,
    })),
    majors: majors.map((x) => ({
      id: x.id,
      label: x.maNganh + " — " + x.tenNganh,
    })),
    classes: classes.map((x) => ({
      id: x.id,
      label: x.maLop + " — " + x.tenLop,
    })),
    subjects: subjects.map((x) => ({
      id: x.id,
      label: x.maMonHoc + " — " + x.tenMonHoc,
    })),
    semesters: semesters.map((x) => ({
      id: x.id,
      label: x.tenHocKy + " · " + x.namHoc,
    })),
    teachers: teachers.map((x) => ({
      id: x.id,
      label: x.maGiangVien + " — " + x.taiKhoan.hoTen,
      khoaId: x.khoaId,
    })),
  };
}
