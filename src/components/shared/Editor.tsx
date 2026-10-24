"use client";
import { useState } from "react";
import type { Field, Row } from "@/types";
import Modal from "@/components/ui/Modal";
import { message } from "@/lib/api";
export type Lookups = Record<
  string,
  { id: number; label: string; khoaId?: number }[]
>;
export default function Editor({
  title,
  fields,
  initial,
  lookups = {},
  onSave,
  onClose,
  locked = [],
}: {
  title: string;
  fields: Field[];
  initial: Row;
  lookups?: Lookups;
  onSave: (v: Row) => Promise<void>;
  onClose: () => void;
  locked?: string[];
}) {
  const [values, setValues] = useState<Row>(initial),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSave(values);
      onClose();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  const role = String(values.vaiTro ?? "");
  const visible = fields.filter((f) => {
    if (!role) return true;
    if (["maHoSo"].includes(f.key)) return role !== "ADMIN";
    if (["lopId", "nienKhoa", "trangThaiHocTap"].includes(f.key))
      return role === "STUDENT";
    if (["hocHam", "hocVi"].includes(f.key)) return role === "TEACHER";
    if (["phongBan", "chucVu"].includes(f.key)) return role === "ADMIN";
    if (f.key === "khoaId") return role !== "STUDENT";
    return true;
  });
  return (
    <Modal
      title={title}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form onSubmit={submit}>
        <div className="form-grid">
          {visible.map((f) => {
            const val = values[f.key];
            const value =
              val === null || val === undefined
                ? ""
                : String(val).slice(0, f.type === "date" ? 10 : undefined);
            const change = (v: string) =>
              setValues({
                ...values,
                [f.key]: f.lookup ? (v ? Number(v) : null) : v,
              });
            return (
              <label
                key={f.key}
                className={f.type === "textarea" ? "full" : ""}
              >
                {f.label}
                {f.required && <span className="required"> *</span>}
                {f.options || f.lookup ? (
                  <select
                    value={value}
                    disabled={locked.includes(f.key)}
                    required={f.required}
                    onChange={(e) => change(e.target.value)}
                  >
                    <option value="">— Chọn —</option>
                    {f.options
                      ? Object.entries(f.options).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))
                      : (lookups[f.lookup!] ?? []).map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.label}
                          </option>
                        ))}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea
                    rows={3}
                    value={value}
                    onChange={(e) => change(e.target.value)}
                  />
                ) : (
                  <input
                    type={f.type ?? "text"}
                    value={value}
                    required={f.required}
                    disabled={locked.includes(f.key)}
                    min={f.min}
                    max={f.max}
                    step={
                      f.key.startsWith("diem")
                        ? "0.01"
                        : f.type === "number"
                          ? "1"
                          : undefined
                    }
                    autoComplete={
                      f.type === "password" ? "new-password" : undefined
                    }
                    onChange={(e) => change(e.target.value)}
                  />
                )}
              </label>
            );
          })}
        </div>
        {error && (
          <p role="alert" className="alert error">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button
            type="button"
            className="secondary"
            disabled={busy}
            onClick={onClose}
          >
            Hủy
          </button>
          <button disabled={busy}>{busy ? "Đang lưu…" : "Lưu thay đổi"}</button>
        </div>
      </form>
    </Modal>
  );
}
