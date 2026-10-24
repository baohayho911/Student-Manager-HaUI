"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { catalogs } from "@/lib/catalogs";
import { api } from "@/lib/api";
import { useData } from "@/hooks/use-data";
import type { Row } from "@/types";
import Editor, { type Lookups } from "@/components/shared/Editor";
import Confirm from "@/components/shared/Confirm";
import DataTable from "@/components/shared/DataTable";
import PageHeader, { State } from "@/components/shared/PageHeader";
export default function CatalogPage({ kind }: { kind: string }) {
  const c = catalogs[kind],
    list = useData<Row[]>("catalog/" + kind),
    look = useData<Lookups>("lookups");
  const [editing, setEditing] = useState<Row | null>(null),
    [deleting, setDeleting] = useState<Row | null>(null),
    [notice, setNotice] = useState("");
  const key = (r: Row) =>
    c.compound?.map((k) => r[k]).join("-") ?? String(r.id);
  const isNew = editing ? editing._new === true : false;
  const defaults: Row = Object.fromEntries(
    c.fields.map((f) => [
      f.key,
      f.options
        ? Object.keys(f.options)[0]
        : f.type === "number"
          ? f.key === "trongSoDiemTX"
            ? 40
            : f.key === "trongSoDiemCuoiKy"
              ? 60
              : f.key === "siSoToiDa"
                ? 40
                : (f.min ?? 1)
          : "",
    ]),
  );
  const done = () => {
    list.refresh();
    look.refresh();
    setNotice("Đã cập nhật dữ liệu.");
  };
  const columns = c.fields
    .filter((f) => f.type !== "textarea")
    .map((f) => ({
      key: f.key,
      label: f.label,
      value: (r: Row) =>
        f.lookup
          ? (look.data?.[f.lookup]?.find((x) => x.id === r[f.key])?.label ??
            "—")
          : f.options
            ? f.options[String(r[f.key])]
            : f.type === "date"
              ? String(r[f.key]).slice(0, 10)
              : r[f.key],
    }));
  return (
    <>
      <PageHeader title={c.title} description={c.description}>
        <button onClick={() => setEditing({ ...defaults, _new: true })}>
          <Plus size={18} />
          Thêm mới
        </button>
      </PageHeader>
      {notice && (
        <p role="status" className="alert success">
          {notice}
        </p>
      )}
      <State
        loading={list.loading || look.loading}
        error={list.error || look.error}
      />
      {list.data && (
        <DataTable
          rows={list.data}
          columns={columns}
          rowKey={key}
          actions={(r) => (
            <>
              <button className="small secondary" onClick={() => setEditing(r)}>
                <Pencil size={15} />
                Sửa
              </button>
              <button
                className="small danger"
                onClick={() => setDeleting(r)}
                aria-label="Xóa bản ghi"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        />
      )}
      {editing && (
        <Editor
          title={(isNew ? "Thêm " : "Cập nhật ") + c.title.toLowerCase()}
          fields={c.fields}
          initial={editing}
          lookups={look.data ?? {}}
          locked={isNew ? [] : (c.compound ?? [])}
          onClose={() => setEditing(null)}
          onSave={async (v) => {
            await api(
              "catalog/" + kind + (isNew ? "" : "/" + key(editing)),
              isNew ? "POST" : "PUT",
              v,
            );
            done();
          }}
        />
      )}
      {deleting && (
        <Confirm
          title="Xóa bản ghi?"
          text="Bản ghi sẽ bị xóa vĩnh viễn. Hệ thống sẽ từ chối nếu dữ liệu đang được sử dụng."
          onClose={() => setDeleting(null)}
          onConfirm={async () => {
            await api("catalog/" + kind + "/" + key(deleting), "DELETE");
            done();
          }}
        />
      )}
    </>
  );
}
