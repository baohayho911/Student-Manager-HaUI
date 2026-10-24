export default function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">CỔNG THÔNG TIN ĐÀO TẠO</div>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
      {children}
    </div>
  );
}
export function State({ loading, error }: { loading: boolean; error: string }) {
  return error ? (
    <p className="alert error" role="alert">
      {error}
    </p>
  ) : loading ? (
    <p className="muted loading">Đang tải dữ liệu…</p>
  ) : null;
}
