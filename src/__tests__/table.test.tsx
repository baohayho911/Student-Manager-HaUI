// @vitest-environment jsdom
import React from "react";
import { it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DataTable from "@/components/shared/DataTable";
it("tìm kiếm và phân trang danh sách", () => {
  render(
    <DataTable
      rows={Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        name: `Sinh viên ${i + 1}`,
      }))}
      columns={[{ key: "name", label: "Họ tên" }]}
    />,
  );
  expect(screen.queryByText("Sinh viên 12")).toBeNull();
  fireEvent.click(screen.getByLabelText("Trang sau"));
  expect(screen.getByText("Sinh viên 12")).toBeTruthy();
  fireEvent.change(screen.getByLabelText("Tìm kiếm trong danh sách"), {
    target: { value: "Sinh viên 1" },
  });
  expect(screen.getByText("Sinh viên 1")).toBeTruthy();
  expect(screen.queryByText("Sinh viên 2")).toBeNull();
});
