"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useData } from "@/hooks/use-data";
import type { Row } from "@/types";
import DataTable from "@/components/shared/DataTable";
import Confirm from "@/components/shared/Confirm";
import Editor from "@/components/shared/Editor";
import PageHeader, { State } from "@/components/shared/PageHeader";
import { totalScore } from "@/lib/rules";
export default function SectionsPage({
  student = false,
}: {
  student?: boolean;
}) {
  const list = useData<Row[]>("sections");
  const [selected, setSelected] = useState<Row | null>(null),
    [confirm, setConfirm] = useState<{ row: Row; cancel: boolean } | null>(
      null,
    ),
    [notice, setNotice] = useState(""),
    [semester, setSemester] = useState("");
  const semesters = [
    ...new Set(list.data?.map((s) => String(s.tenHocKy)) ?? []),
  ];
  const columns = [
    { key: "maLopHocPhan", label: "Mã lớp" },
    { key: "tenMonHoc", label: "Môn học" },
    { key: "tenHocKy", label: "Học kỳ" },
    { key: "tenGiangVien", label: "Giảng viên" },
    { key: "lichHoc", label: "Lịch học" },
    { key: "phongHoc", label: "Phòng" },
    {
      key: "siSo",
      label: "Sĩ số",
      value: (r: Row) => r.siSo + " / " + r.siSoToiDa,
    },
    {
      key: "trangThaiLop",
      label: "Trạng thái",
      value: (r: Row) =>
        ({
          MO_DANG_KY: "Mở đăng ký",
          DONG_DANG_KY: "Đóng đăng ký",
          HOAN_THANH: "Hoàn thành",
        })[String(r.trangThaiLop)] ?? r.trangThaiLop,
    },
  ];
  return (
    <>
      <PageHeader
        title={student ? "Đăng ký học phần" : "Lớp học phần phụ trách"}
        description={
          student
            ? "Chọn lớp phù hợp với chương trình và điều kiện tiên quyết."
            : "Theo dõi danh sách sinh viên và quản lý kết quả học tập."
        }
      />
      {notice && (
        <p className="alert success" role="status">
          {notice}
        </p>
      )}
      <State loading={list.loading} error={list.error} />
      <div className="filter-bar">
        <label>
          Học kỳ{" "}
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="">Tất cả học kỳ</option>
            {semesters.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      {list.data && (
        <DataTable
          rows={list.data.filter((s) => !semester || s.tenHocKy === semester)}
          columns={columns}
          actions={(r) =>
            student ? (
              <>
                <span
                  className={"badge " + (r.dangKy === "DANG_KY" ? "" : "gray")}
                >
                  {r.dangKy === "DANG_KY"
                    ? "Đã đăng ký"
                    : r.dangKy === "HUY"
                      ? "Đã hủy"
                      : "Chưa đăng ký"}
                </span>
                <button
                  className="small secondary"
                  disabled={r.trangThaiLop !== "MO_DANG_KY" || !!r.khoaDiem}
                  onClick={() =>
                    setConfirm({ row: r, cancel: r.dangKy === "DANG_KY" })
                  }
                >
                  {r.dangKy === "DANG_KY" ? "Hủy đăng ký" : "Đăng ký"}
                </button>
              </>
            ) : (
              <button
                className="small secondary"
                onClick={() => setSelected(r)}
              >
                Danh sách & điểm
              </button>
            )
          }
        />
      )}
      {confirm && (
        <Confirm
          title={confirm.cancel ? "Hủy đăng ký học phần?" : "Đăng ký học phần?"}
          text={
            String(confirm.row.maLopHocPhan) + " — " + confirm.row.tenMonHoc
          }
          onClose={() => setConfirm(null)}
          onConfirm={async () => {
            await api(
              "sections/" + confirm.row.id + "/enroll",
              confirm.cancel ? "DELETE" : "POST",
            );
            list.refresh();
            setNotice(
              confirm.cancel ? "Đã hủy đăng ký." : "Đăng ký thành công.",
            );
          }}
        />
      )}
      {selected && (
        <GradeBook
          key={String(selected.id)}
          section={selected}
          onClose={() => setSelected(null)}
          onUpdate={() => {
            list.refresh();
          }}
        />
      )}
    </>
  );
}
function GradeBook({
  section,
  onClose,
  onUpdate,
}: {
  section: Row;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const list = useData<Row[]>("sections/" + section.id + "/roster"),
    [editing, setEditing] = useState<Row | null>(null),
    [locked, setLocked] = useState(Boolean(section.khoaDiem)),
    [confirm, setConfirm] = useState(false),
    [notice, setNotice] = useState("");
  const rows = (list.data ?? []).map((r) => {
    const st = r.sinhVien as Row,
      account = st.taiKhoan as Row,
      mon = section.monHoc as Row;
    return {
      ...r,
      id: Number(r.sinhVienId),
      maSinhVien: st.maSinhVien,
      hoTen: account.hoTen,
      email: account.email,
      diemTongKet: totalScore(
        r.diemTX === null ? null : Number(r.diemTX),
        r.diemCuoiKy === null ? null : Number(r.diemCuoiKy),
        Number(mon.trongSoDiemTX),
      ),
    };
  });
  return (
    <section className="grade-panel">
      <div className="page-heading">
        <div>
          <h2>{String(section.maLopHocPhan)} · Bảng điểm</h2>
          <p className="muted">
            {locked
              ? "Đã công bố kết quả cho sinh viên."
              : "Điểm đang ở chế độ nháp, sinh viên chưa xem được."}
          </p>
        </div>
        <div className="row-actions">
          <button className="secondary" onClick={onClose}>
            Đóng bảng
          </button>
          <button onClick={() => setConfirm(true)}>
            {locked ? "Mở lại bảng điểm" : "Chốt & công bố"}
          </button>
        </div>
      </div>
      {notice && <p className="alert success">{notice}</p>}
      <State loading={list.loading} error={list.error} />
      <DataTable
        rows={rows}
        columns={[
          { key: "maSinhVien", label: "Mã sinh viên" },
          { key: "hoTen", label: "Họ tên" },
          { key: "diemTX", label: "Thường xuyên" },
          { key: "diemCuoiKy", label: "Cuối kỳ" },
          { key: "diemTongKet", label: "Tổng kết" },
        ]}
        actions={(r) => (
          <button
            className="small secondary"
            disabled={locked}
            onClick={() => setEditing(r)}
          >
            Nhập / sửa điểm
          </button>
        )}
      />
      {editing && (
        <Editor
          title={"Nhập điểm · " + editing.hoTen}
          initial={editing}
          fields={[
            {
              key: "diemTX",
              label: "Điểm thường xuyên (0–10)",
              type: "number",
              min: 0,
              max: 10,
            },
            {
              key: "diemCuoiKy",
              label: "Điểm cuối kỳ (0–10)",
              type: "number",
              min: 0,
              max: 10,
            },
          ]}
          onClose={() => setEditing(null)}
          onSave={async (v) => {
            await api(
              "sections/" + section.id + "/scores/" + editing.sinhVienId,
              "PUT",
              v,
            );
            list.refresh();
            setNotice("Đã lưu điểm.");
          }}
        />
      )}
      {confirm && (
        <Confirm
          title={locked ? "Mở lại bảng điểm?" : "Chốt và công bố điểm?"}
          text={
            locked
              ? "Sinh viên sẽ tạm thời không xem được điểm của lớp cho đến lần công bố tiếp theo."
              : "Lớp phải đóng đăng ký và mọi sinh viên phải có đủ hai thành phần điểm."
          }
          onClose={() => setConfirm(false)}
          onConfirm={async () => {
            await api("sections/" + section.id + "/publish", "POST", {
              locked: !locked,
            });
            setLocked(!locked);
            onUpdate();
            setNotice("Đã cập nhật trạng thái bảng điểm.");
          }}
        />
      )}
    </section>
  );
}
