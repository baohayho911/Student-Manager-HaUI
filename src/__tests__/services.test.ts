import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "@/types";
const { tx } = vi.hoisted(() => ({
  tx: {
    sinhVien: { findUniqueOrThrow: vi.fn() },
    lopHocPhan: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
    chuongTrinhHoc: { count: vi.fn() },
    ketQuaHocTap: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
  },
}));
vi.mock("@/server/db", () => ({
  db: tx,
  transaction: async (fn: (t: typeof tx) => unknown) => fn(tx),
}));
import { register, cancelRegistration } from "@/features/enrollments/service";
import { saveScore, publish, results } from "@/features/results/service";
const student = { id: 2, vaiTro: "STUDENT" } as User,
  teacher = { id: 3, vaiTro: "TEACHER" } as User;
const section = () => ({
  id: 10,
  monHocId: 1,
  hocKyId: 1,
  trangThaiLop: "MO_DANG_KY",
  khoaDiem: false,
  siSoToiDa: 2,
  hocKy: { ngayKetThuc: new Date("2099-01-01") },
  monHoc: { dieuKien: [], trongSoDiemTX: 40 },
  giangVien: { taiKhoanId: 3 },
});
beforeEach(() => {
  vi.resetAllMocks();
  tx.sinhVien.findUniqueOrThrow.mockResolvedValue({
    id: 2,
    trangThaiHocTap: "DANG_HOC",
    lop: { nganhId: 1 },
  });
  tx.lopHocPhan.findUniqueOrThrow.mockResolvedValue(section());
  tx.chuongTrinhHoc.count.mockResolvedValue(1);
  tx.ketQuaHocTap.count.mockResolvedValue(0);
  tx.ketQuaHocTap.findMany.mockResolvedValue([]);
});
describe("Đăng ký", () => {
  it("chặn giảng viên đăng ký thay sinh viên", async () => {
    await expect(register(teacher, 10)).rejects.toThrow("quyền");
    expect(tx.ketQuaHocTap.upsert).not.toHaveBeenCalled();
  });
  it("chặn trùng môn trong cùng kỳ", async () => {
    tx.ketQuaHocTap.count.mockResolvedValueOnce(1);
    await expect(register(student, 10)).rejects.toThrow("đã đăng ký");
  });
  it("chặn lớp đầy", async () => {
    tx.ketQuaHocTap.count.mockResolvedValueOnce(0).mockResolvedValueOnce(2);
    await expect(register(student, 10)).rejects.toThrow("đủ sĩ số");
  });
  it("chặn thiếu tiên quyết", async () => {
    tx.lopHocPhan.findUniqueOrThrow.mockResolvedValue({
      ...section(),
      monHoc: { dieuKien: [{ monTienQuyetId: 9, diemToiThieu: 4 }] },
    });
    await expect(register(student, 10)).rejects.toThrow("tiên quyết");
  });
  it("chặn môn ngoài chương trình", async () => {
    tx.chuongTrinhHoc.count.mockResolvedValue(0);
    await expect(register(student, 10)).rejects.toThrow("chương trình");
  });
  it("đăng ký hợp lệ và đăng ký lại không tạo hai khóa", async () => {
    await register(student, 10);
    expect(tx.ketQuaHocTap.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sinhVienId_lopHocPhanId: { sinhVienId: 2, lopHocPhanId: 10 } },
        update: expect.objectContaining({ trangThaiDangKy: "DANG_KY" }),
      }),
    );
  });
  it("không hủy khi có điểm", async () => {
    tx.ketQuaHocTap.findUniqueOrThrow.mockResolvedValue({
      trangThaiDangKy: "DANG_KY",
      lopHocPhan: section(),
      diemTX: 0,
      diemCuoiKy: null,
    });
    await expect(cancelRegistration(student, 10)).rejects.toThrow("Đã có điểm");
  });
});
describe("Quyền và công bố điểm", () => {
  it("sinh viên không nhập điểm", async () =>
    await expect(
      saveScore(student, 10, 2, { diemTX: 7, diemCuoiKy: 8 }),
    ).rejects.toThrow("quyền"));
  it("giảng viên không sửa lớp người khác", async () =>
    await expect(
      saveScore({ ...teacher, id: 4 }, 10, 2, { diemTX: 7, diemCuoiKy: 8 }),
    ).rejects.toThrow("không phụ trách"));
  it("không sửa điểm đã khóa", async () => {
    tx.lopHocPhan.findUniqueOrThrow.mockResolvedValue({
      ...section(),
      khoaDiem: true,
    });
    await expect(
      saveScore(teacher, 10, 2, { diemTX: 7, diemCuoiKy: 8 }),
    ).rejects.toThrow("đã chốt");
  });
  it("chặn điểm vượt 10", async () =>
    await expect(
      saveScore(teacher, 10, 2, { diemTX: 11, diemCuoiKy: 8 }),
    ).rejects.toThrow());
  it("không công bố khi còn mở đăng ký", async () =>
    await expect(publish(teacher, 10, true)).rejects.toThrow("Đóng đăng ký"));
  it("không công bố nếu thiếu điểm", async () => {
    tx.lopHocPhan.findUniqueOrThrow.mockResolvedValue({
      ...section(),
      trangThaiLop: "DONG_DANG_KY",
    });
    tx.ketQuaHocTap.count.mockResolvedValue(1);
    await expect(publish(teacher, 10, true)).rejects.toThrow("nhập đủ");
  });
  it("ẩn điểm nháp khỏi kết quả sinh viên", async () => {
    tx.ketQuaHocTap.findMany.mockResolvedValue([
      {
        diemTX: 10,
        diemCuoiKy: 10,
        trangThaiDangKy: "DANG_KY",
        lopHocPhan: {
          ...section(),
          monHoc: { trongSoDiemTX: 40, soTinChi: 3 },
          hocKy: {},
        },
      },
    ]);
    expect((await results(student))[0]).toMatchObject({
      diemTX: null,
      diemCuoiKy: null,
      diemTongKet: null,
      points: null,
    });
  });
});
