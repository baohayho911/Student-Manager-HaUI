"use client";
import { useState } from "react";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import type { Row } from "@/types";
export type Column = {
  key: string;
  label: string;
  render?: (r: Row) => React.ReactNode;
  value?: (r: Row) => unknown;
};
export default function DataTable({
  rows,
  columns,
  actions,
  rowKey,
}: {
  rows: Row[];
  columns: Column[];
  actions?: (r: Row) => React.ReactNode;
  rowKey?: (r: Row) => string;
}) {
  const [query, setQuery] = useState(""),
    [page, setPage] = useState(0);
  const value = (r: Row, c: Column) => (c.value ? c.value(r) : r[c.key]);
  const filtered = rows.filter((r) =>
    columns.some((c) =>
      String(value(r, c) ?? "")
        .toLocaleLowerCase("vi")
        .includes(query.toLocaleLowerCase("vi")),
    ),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 10)),
    current = Math.min(page, pages - 1);
  function download() {
    const safe = (v: unknown) => {
      let s = String(v ?? "");
      if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
      return '"' + s.replaceAll('"', '""') + '"';
    };
    const text = [
      columns.map((c) => safe(c.label)).join(","),
      ...filtered.map((r) => columns.map((c) => safe(value(r, c))).join(",")),
    ].join("\r\n");
    const url = URL.createObjectURL(
        new Blob(["\ufeff" + text], { type: "text/csv;charset=utf-8;" }),
      ),
      a = document.createElement("a");
    a.href = url;
    a.download = "danh-sach.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="table-card">
      <div className="table-toolbar">
        <label className="search">
          <Search size={18} />
          <input
            aria-label="Tìm kiếm trong danh sách"
            placeholder="Tìm kiếm trong danh sách..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
        </label>
        <button className="secondary" onClick={download}>
          <Download size={16} />
          Xuất CSV
        </button>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
              {actions && <th>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(current * 10, current * 10 + 10).map((r, i) => (
              <tr key={rowKey?.(r) ?? String(r.id ?? i)}>
                {columns.map((c) => (
                  <td key={c.key}>
                    {c.render ? c.render(r) : String(value(r, c) ?? "—")}
                  </td>
                ))}
                {actions && (
                  <td>
                    <div className="row-actions">{actions(r)}</div>
                  </td>
                )}
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="empty"
                >
                  Chưa có dữ liệu phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>{filtered.length} bản ghi</span>
        <div className="row-actions">
          <button
            className="icon-button"
            aria-label="Trang trước"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft size={17} />
          </button>
          <span>
            {current + 1} / {pages}
          </span>
          <button
            className="icon-button"
            aria-label="Trang sau"
            disabled={current >= pages - 1}
            onClick={() => setPage(current + 1)}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
