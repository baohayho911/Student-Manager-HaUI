"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { roleLabels, userFields } from "@/lib/catalogs";
import { useData } from "@/hooks/use-data";
import type { Row } from "@/types";
import Editor, { type Lookups } from "@/components/shared/Editor";
import Confirm from "@/components/shared/Confirm";
import DataTable from "@/components/shared/DataTable";
import PageHeader, { State } from "@/components/shared/PageHeader";
export default function UsersPage() {
  const list = useData<Row[]>("users"),
    look = useData<Lookups>("lookups");
  const [editing, setEditing] = useState<Row | null>(null),
    [reset, setReset] = useState<Row | null>(null),
    [action, setAction] = useState<{ row: Row; type: string } | null>(null),
    [notice, setNotice] = useState(""),
    [role, setRole] = useState("");
  const done = () => {
    list.refresh();
    setNotice("Thao tác thành công.");
  };
  return (
    <>
      <PageHeader
        title="Người dùng và tài khoản"
        description="Quản lý hồ sơ, phân vai trò và quyền truy cập hệ thống."
      >
        <button
          onClick={() =>
            setEditing({
              _new: true,
              vaiTro: "STUDENT",
              trangThaiHocTap: "DANG_HOC",
            })
          }
        >
          <Plus size={18} />
          Thêm người dùng
        </button>
      </PageHeader>
      {notice && (
        <p className="alert success" role="status">
          {notice}
        </p>
      )}
      <State loading={list.loading} error={list.error || look.error} />
      <div className="filter-bar">
        <label>
          Vai trò{" "}
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Tất cả</option>
            {Object.entries(roleLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>
      {list.data && (
        <DataTable
          rows={list.data.filter((r) => !role || r.vaiTro === role)}
          columns={[
            { key: "maHoSo", label: "Mã hồ sơ" },
            { key: "hoTen", label: "Họ tên" },
            { key: "tenDangNhap", label: "Tên đăng nhập" },
            {
              key: "vaiTro",
              label: "Vai trò",
              value: (r) => roleLabels[r.vaiTro as keyof typeof roleLabels],
            },
            { key: "email", label: "Email" },
            {
              key: "hoatDong",
              label: "Trạng thái",
              value: (r) => (r.hoatDong ? "Hoạt động" : "Đã khóa"),
              render: (r) => (
                <span className={"badge " + (r.hoatDong ? "" : "gray")}>
                  {r.hoatDong ? "Hoạt động" : "Đã khóa"}
                </span>
              ),
            },
          ]}
          actions={(r) => (
            <>
              <button className="small secondary" onClick={() => setEditing(r)}>
                Sửa
              </button>
              <button className="small secondary" onClick={() => setReset(r)}>
                Đặt lại mật khẩu
              </button>
              <button
                className="small secondary"
                onClick={() => setAction({ row: r, type: "toggle" })}
              >
                {r.hoatDong ? "Khóa" : "Mở khóa"}
              </button>
              <button
                className="small danger"
                onClick={() => setAction({ row: r, type: "delete" })}
              >
                Xóa
              </button>
            </>
          )}
        />
      )}
      {editing && (
        <Editor
          title={editing._new ? "Thêm người dùng" : "Cập nhật hồ sơ"}
          fields={userFields
            .filter((f) => editing._new || f.key !== "matKhau")
            .map((f) => (f.key === "matKhau" ? { ...f, required: true } : f))}
          initial={{
            email: "",
            soDienThoai: "",
            ngaySinh: "",
            diaChi: "",
            maHoSo: "",
            khoaId: null,
            lopId: null,
            nienKhoa: "",
            hocHam: "",
            hocVi: "",
            phongBan: "",
            chucVu: "",
            ...editing,
          }}
          lookups={look.data ?? {}}
          locked={editing._new ? [] : ["vaiTro"]}
          onClose={() => setEditing(null)}
          onSave={async (v) => {
            await api(
              "users" + (editing._new ? "" : "/" + editing.id),
              editing._new ? "POST" : "PUT",
              v,
            );
            done();
          }}
        />
      )}
      {reset && (
        <Editor
          title={"Đặt lại mật khẩu · " + reset.tenDangNhap}
          fields={[
            {
              key: "password",
              label: "Mật khẩu mới (ít nhất 12 ký tự)",
              type: "password",
              required: true,
            },
          ]}
          initial={{}}
          onClose={() => setReset(null)}
          onSave={async (v) => {
            await api("users/" + reset.id + "/password", "POST", v);
            done();
          }}
        />
      )}
      {action && (
        <Confirm
          title={
            action.type === "delete"
              ? "Xóa tài khoản và hồ sơ?"
              : "Thay đổi trạng thái tài khoản?"
          }
          text={
            action.type === "delete"
              ? "Xóa vĩnh viễn chỉ được thực hiện khi hồ sơ chưa có lịch sử học tập hoặc lớp giảng dạy. Nếu đã có, hãy khóa tài khoản."
              : "Tài khoản bị khóa sẽ không thể đăng nhập; dữ liệu hồ sơ được giữ lại."
          }
          onClose={() => setAction(null)}
          onConfirm={async () => {
            await api(
              "users/" +
                action.row.id +
                (action.type === "toggle" ? "/enabled" : ""),
              action.type === "toggle" ? "POST" : "DELETE",
              action.type === "toggle"
                ? { enabled: !action.row.hoatDong }
                : undefined,
            );
            done();
          }}
        />
      )}
    </>
  );
}
