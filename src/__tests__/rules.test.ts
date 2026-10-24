import { describe, it, expect } from "vitest";
import { hasCycle, totalScore, letterScore } from "@/lib/rules";
import { passwordSchema, profileSchema } from "@/features/users/schemas";
describe("Quy tắc điểm", () => {
  it("giữ điểm chưa nhập là null, phân biệt điểm 0", () => {
    expect(totalScore(null, 8, 40)).toBeNull();
    expect(totalScore(0, 0, 40)).toBe(0);
    expect(totalScore(8, 7, 40)).toBe(7.4);
  });
  it.each([
    [3.99, "F"],
    [4, "D"],
    [5.5, "C"],
    [7, "B"],
    [8.5, "A"],
  ])("ranh giới %s => %s", (n, l) =>
    expect(letterScore(Number(n)).letter).toBe(l),
  );
  it("chưa có điểm không quy thành F", () =>
    expect(letterScore(null).points).toBeNull());
});
describe("Tiên quyết", () => {
  it("phát hiện chu trình gián tiếp và tự tham chiếu", () => {
    expect(
      hasCycle([
        { monHocId: 1, monTienQuyetId: 2 },
        { monHocId: 2, monTienQuyetId: 3 },
        { monHocId: 3, monTienQuyetId: 1 },
      ]),
    ).toBe(true);
    expect(hasCycle([{ monHocId: 1, monTienQuyetId: 1 }])).toBe(true);
  });
  it("cho phép DAG có môn chung", () =>
    expect(
      hasCycle([
        { monHocId: 1, monTienQuyetId: 3 },
        { monHocId: 2, monTienQuyetId: 3 },
      ]),
    ).toBe(false));
});
it("giới hạn bcrypt tính theo byte", () => {
  expect(passwordSchema.safeParse("a".repeat(73)).success).toBe(false);
  expect(passwordSchema.safeParse("ắ".repeat(25)).success).toBe(false);
});
it("không chấp nhận ngày sinh không tồn tại", () =>
  expect(
    profileSchema.safeParse({
      hoTen: "A",
      email: "",
      soDienThoai: "",
      diaChi: "",
      ngaySinh: "2025-02-30",
    }).success,
  ).toBe(false));
