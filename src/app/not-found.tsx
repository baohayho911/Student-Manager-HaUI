import Link from "next/link";
export default function NotFound() {
  return (
    <div className="panel">
      <h1>Không tìm thấy trang</h1>
      <p>Trang không tồn tại hoặc không thuộc quyền truy cập của bạn.</p>
      <Link className="button" href="/">
        Về trang chính
      </Link>
    </div>
  );
}
