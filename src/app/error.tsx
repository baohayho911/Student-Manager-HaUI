"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="panel">
      <h1>Chưa thể tải dữ liệu</h1>
      <p>
        Vui lòng thử lại. Nếu vừa cài ứng dụng, hãy kiểm tra cấu hình cơ sở dữ
        liệu và chạy migration theo README.
      </p>
      <button onClick={reset}>Thử lại</button>
    </div>
  );
}
