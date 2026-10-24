"use client";
import { useState } from "react";
import { api, message } from "@/lib/api";
import { useData } from "@/hooks/use-data";
import { roleLabels, studyStates } from "@/lib/catalogs";
import type { Row, User } from "@/types";
import Editor from "@/components/shared/Editor";
import PageHeader, { State } from "@/components/shared/PageHeader";
export default function ProfilePage({ user }: { user: User }) {
  const list = useData<Row>("profile"),
    [edit, setEdit] = useState(false),
    [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function change(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = e.currentTarget;
    try {
      await api(
        "auth/password",
        "POST",
        Object.fromEntries(new FormData(form)),
      );
      form.reset();
      window.location.assign("/profile");
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  const details = list.data?.chiTiet as Row | undefined;
  const labels: Record<string, string> = {
    maHoSo: "Mã hồ sơ",
    lop: "Lớp hành chính",
    nganh: "Ngành",
    nienKhoa: "Niên khóa",
    trangThaiHocTap: "Trạng thái học tập",
    khoa: "Khoa",
    hocHam: "Học hàm",
    hocVi: "Học vị",
    phongBan: "Phòng ban",
    chucVu: "Chức vụ",
  };
  return (
    <>
      <PageHeader
        title="Thông tin cá nhân"
        description="Thông tin hồ sơ và bảo mật tài khoản của bạn."
      />
      {user.yeuCauDoiMatKhau && (
        <p className="alert warning">
          Vui lòng đổi mật khẩu ban đầu trước khi sử dụng các chức năng khác.
        </p>
      )}
      {notice && <p className="alert success">{notice}</p>}
      <State loading={list.loading} error={list.error} />
      <div className="profile-grid">
        <section className="panel">
          <div className="profile-avatar">{user.hoTen.slice(0, 1)}</div>
          <h2>{user.hoTen}</h2>
          <p className="muted">{roleLabels[user.vaiTro]}</p>
          <dl>
            {[
              ["Tên đăng nhập", user.tenDangNhap],
              ["Ngày sinh", user.ngaySinh],
              ["Email", list.data?.email],
              ["Số điện thoại", list.data?.soDienThoai],
              ["Địa chỉ", list.data?.diaChi],
              ...Object.entries(details ?? {}).map(([k, v]) => [
                labels[k] ?? k,
                k === "trangThaiHocTap"
                  ? studyStates[v as keyof typeof studyStates]
                  : v,
              ]),
            ].map(([k, v]) => (
              <div key={String(k)}>
                <dt>{String(k)}</dt>
                <dd>{String(v ?? "—")}</dd>
              </div>
            ))}
          </dl>
          <button className="secondary" onClick={() => setEdit(true)}>
            Cập nhật liên hệ
          </button>
        </section>
        <section className="panel">
          <h2>Đổi mật khẩu</h2>
          <p className="muted">
            Ít nhất 12 ký tự. Sau khi đổi, các phiên đăng nhập khác sẽ kết thúc.
          </p>
          <form className="stack" onSubmit={change}>
            <label>
              Mật khẩu hiện tại
              <input
                name="oldPassword"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>
            <label>
              Mật khẩu mới
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
              />
            </label>
            <label>
              Xác nhận mật khẩu mới
              <input
                name="confirm"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
              />
            </label>
            {error && (
              <p className="alert error" role="alert">
                {error}
              </p>
            )}
            <button disabled={busy}>
              {busy ? "Đang lưu…" : "Đổi mật khẩu"}
            </button>
          </form>
        </section>
      </div>
      {edit && (
        <Editor
          title="Cập nhật thông tin liên hệ"
          fields={[
            { key: "email", label: "Email", type: "email" },
            { key: "soDienThoai", label: "Số điện thoại" },
            { key: "diaChi", label: "Địa chỉ" },
          ]}
          initial={{
            email: list.data?.email ?? "",
            soDienThoai: list.data?.soDienThoai ?? "",
            diaChi: list.data?.diaChi ?? "",
          }}
          onClose={() => setEdit(false)}
          onSave={async (v) => {
            await api("profile", "PUT", v);
            list.refresh();
            setNotice("Đã cập nhật thông tin liên hệ.");
          }}
        />
      )}
    </>
  );
}
