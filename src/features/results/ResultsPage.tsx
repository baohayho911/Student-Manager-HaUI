"use client";
import { useData } from "@/hooks/use-data";
import type { Row } from "@/types";
import DataTable from "@/components/shared/DataTable";
import PageHeader, { State } from "@/components/shared/PageHeader";
export default function ResultsPage() {
  const list = useData<Row[]>("results");
  const best = new Map<number, Row>();
  for (const r of list.data ?? []) {
    if (r.points === null) continue;
    const old = best.get(Number(r.monHocId));
    if (!old || Number(r.diemTongKet) > Number(old.diemTongKet))
      best.set(Number(r.monHocId), r);
  }
  const rows = [...best.values()],
    credits = rows.reduce((n, r) => n + Number(r.soTinChi), 0),
    earned = rows.reduce(
      (n, r) => n + (Number(r.points) > 0 ? Number(r.soTinChi) : 0),
      0,
    );
  const gpa = credits
    ? rows.reduce((n, r) => n + Number(r.points) * Number(r.soTinChi), 0) /
      credits
    : null;
  return (
    <>
      <PageHeader
        title="Kết quả học tập"
        description="Xem điểm đã công bố và tiến độ tích lũy tín chỉ."
      />
      <State loading={list.loading} error={list.error} />
      <div className="stats">
        <div className="stat">
          <span>GPA tích lũy</span>
          <strong>{gpa?.toFixed(2) ?? "—"}</strong>
          <small>Thang điểm 4</small>
        </div>
        <div className="stat">
          <span>Tín chỉ đã đạt</span>
          <strong>{earned}</strong>
          <small>Lấy kết quả tốt nhất mỗi môn</small>
        </div>
        <div className="stat">
          <span>Tín chỉ có điểm</span>
          <strong>{credits}</strong>
          <small>Chỉ tính kết quả đã công bố</small>
        </div>
      </div>
      {list.data && (
        <DataTable
          rows={list.data}
          columns={[
            { key: "maMonHoc", label: "Mã môn" },
            { key: "tenMonHoc", label: "Môn học" },
            { key: "hocKy", label: "Học kỳ" },
            { key: "soTinChi", label: "Tín chỉ" },
            { key: "diemTX", label: "Thường xuyên" },
            { key: "diemCuoiKy", label: "Cuối kỳ" },
            { key: "diemTongKet", label: "Tổng kết" },
            { key: "letter", label: "Điểm chữ" },
            { key: "points", label: "Hệ 4" },
            { key: "trangThai", label: "Trạng thái" },
          ]}
        />
      )}
    </>
  );
}
