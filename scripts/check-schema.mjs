import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
const db = new PGlite();
const root = fileURLToPath(new URL("../", import.meta.url));
await db.exec(
  await fs.readFile(
    root + "prisma/migrations/202610240001_initial/migration.sql",
    "utf8",
  ),
);
const tables = await db.query(
  "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public'",
);
assert.equal(tables.rows.length, 15);
assert(tables.rows.every((t) => t.rowsecurity));
await db.exec(`INSERT INTO "Khoa" ("maKhoa","tenKhoa") VALUES ('IT','IT');
INSERT INTO "NganhDaoTao" ("maNganh","tenNganh","khoaId") VALUES ('IT','IT',1);
INSERT INTO "TaiKhoan" ("tenDangNhap","giaTriBamMatKhau","vaiTro","hoTen") VALUES ('gv','hash','TEACHER','GV'),('sv','hash','STUDENT','SV');
INSERT INTO "GiangVien" ("maGiangVien","taiKhoanId","khoaId") VALUES ('GV01',1,1);
INSERT INTO "LopHanhChinh" ("maLop","tenLop","nganhId") VALUES ('L01','L01',1);
INSERT INTO "SinhVien" ("maSinhVien","nienKhoa","taiKhoanId","lopId") VALUES ('SV01','2026',2,1);
INSERT INTO "MonHoc" ("maMonHoc","tenMonHoc","soTinChi") VALUES ('M1','M1',3);
INSERT INTO "HocKy" ("maHocKy","tenHocKy","namHoc","ngayBatDau","ngayKetThuc") VALUES ('HK1','HK1','2026','2026-01-01','2026-12-31');
INSERT INTO "LopHocPhan" ("maLopHocPhan","monHocId","hocKyId","giangVienId","siSoToiDa","lichHoc","phongHoc") VALUES ('LHP1',1,1,1,40,'Thu 2','A1');
INSERT INTO "KetQuaHocTap" ("sinhVienId","lopHocPhanId") VALUES (1,1);`);
assert.equal(
  (await db.query('SELECT "diemTX" FROM "KetQuaHocTap"')).rows[0].diemTX,
  null,
);
const cases = [
  [
    "duplicate registration",
    'INSERT INTO "KetQuaHocTap" ("sinhVienId","lopHocPhanId") VALUES (1,1)',
    "23505",
  ],
  ["score range", 'UPDATE "KetQuaHocTap" SET "diemTX"=11', "23514"],
  [
    "self prerequisite",
    'INSERT INTO "MonHocTienQuyet" ("monHocId","monTienQuyetId") VALUES (1,1)',
    "23514",
  ],
  ["historical student", 'DELETE FROM "SinhVien" WHERE id=1', "23503"],
  ["weight sum", 'UPDATE "MonHoc" SET "trongSoDiemTX"=55', "23514"],
  ["invalid period", `UPDATE "HocKy" SET "ngayKetThuc"='2025-01-01'`, "23514"],
  ["invalid capacity", 'UPDATE "LopHocPhan" SET "siSoToiDa"=0', "23514"],
  ["lock open section", 'UPDATE "LopHocPhan" SET "khoaDiem"=true', "23514"],
];
for (const [name, sql, code] of cases) {
  await assert.rejects(
    db.exec(sql),
    (e) => e.code === code || (code === "23503" && e.code === "23001"),
  );
  console.log("PASS", name);
}
console.log("PASS migration: 15 tables, RLS, fixture relations and null score");
await db.close();
