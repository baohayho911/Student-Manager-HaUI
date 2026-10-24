"use client";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { useData } from "@/hooks/use-data";
import { roleLabels } from "@/lib/catalogs";
import type { User } from "@/types";
import PageHeader, { State } from "@/components/shared/PageHeader";
export default function DashboardPage({ user }: { user: User }) {
  const list = useData<Record<string, number>>("dashboard");
  const dest =
    user.vaiTro === "ADMIN"
      ? "/admin/sections"
      : user.vaiTro === "TEACHER"
        ? "/teacher/sections"
        : "/student/enrollments";
  return (
    <>
      <PageHeader
        title={"Xin chào, " + user.hoTen}
        description="Theo dõi hoạt động đào tạo và tiếp tục công việc của bạn."
      />
      <div className="hero">
        <div>
          <div className="eyebrow">KHÔNG GIAN HỌC TẬP CỦA BẠN</div>
          <h2>Mỗi ngày, một bước tiến.</h2>
          <p>
            Quản lý dữ liệu nhất quán, theo dõi tiến độ và hỗ trợ người học.
          </p>
          <Link className="button" href={dest}>
            Xem lớp học phần <ArrowRight size={17} />
          </Link>
        </div>
        <div className="hero-icon">
          <BookOpen size={76} strokeWidth={1.4} />
        </div>
      </div>
      <State loading={list.loading} error={list.error} />
      {list.data && (
        <div className="stats">
          {Object.entries(list.data).map(([k, v]) => (
            <div className="stat" key={k}>
              <span>
                {{
                  students: "Sinh viên",
                  teachers: "Giảng viên",
                  subjects: "Môn học",
                  sections:
                    user.vaiTro === "TEACHER"
                      ? "Lớp phụ trách"
                      : "Lớp học phần",
                }[k] ?? k}
              </span>
              <strong>{v}</strong>
              <small>{roleLabels[user.vaiTro]}</small>
            </div>
          ))}
        </div>
      )}
      <section className="panel">
        <h2>Công việc của bạn</h2>
        <p className="muted">
          {user.vaiTro === "ADMIN"
            ? "Bắt đầu bằng việc thiết lập khoa, ngành, môn học và học kỳ. Sau đó tạo hồ sơ và mở lớp học phần."
            : user.vaiTro === "TEACHER"
              ? "Chọn lớp phụ trách để xem danh sách sinh viên, nhập và công bố kết quả học tập."
              : "Xem danh sách lớp đang mở, đăng ký học phần và theo dõi kết quả được giảng viên công bố."}
        </p>
      </section>
    </>
  );
}
