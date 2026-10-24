"use client";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { message } from "@/lib/api";
export default function Confirm({
  title,
  text,
  onConfirm,
  onClose,
}: {
  title: string;
  text: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Modal
      title={title}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <p className="muted">{text}</p>
      {error && (
        <p className="alert error" role="alert">
          {error}
        </p>
      )}
      <div className="modal-actions">
        <button className="secondary" disabled={busy} onClick={onClose}>
          Hủy
        </button>
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm();
              onClose();
            } catch (e) {
              setError(message(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Đang xử lý…" : "Xác nhận"}
        </button>
      </div>
    </Modal>
  );
}
