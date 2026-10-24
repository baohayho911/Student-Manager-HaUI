"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  BookOpen,
  CalendarDays,
  GraduationCap,
  ClipboardList,
  UserRound,
  LogOut,
  Menu,
  X,
  Layers,
} from "lucide-react";
import { api, message } from "@/lib/api";
import { roleLabels } from "@/lib/catalogs";
import type { User } from "@/types";
export default function Shell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const path = usePathname(),
    [open, setOpen] = useState(false),
    [error, setError] = useState("");
  const base = user.vaiTro.toLowerCase();
  const common = [
    { href: "/" + base, label: "Tổng quan", icon: LayoutDashboard },
  ];
  const menus =
    user.vaiTro === "ADMIN"
      ? [
          {
            href: "/admin/users",
            label: "Người dùng & tài khoản",
            icon: Users,
          },
          { href: "/admin/departments", label: "Khoa", icon: Building2 },
          {
            href: "/admin/majors",
            label: "Ngành đào tạo",
            icon: GraduationCap,
          },
          { href: "/admin/subjects", label: "Môn học", icon: BookOpen },
          { href: "/admin/curricula", label: "Chương trình học", icon: Layers },
          {
            href: "/admin/prerequisites",
            label: "Môn tiên quyết",
            icon: ClipboardList,
          },
          { href: "/admin/classes", label: "Lớp hành chính", icon: Users },
          { href: "/admin/sections", label: "Lớp học phần", icon: BookOpen },
          { href: "/admin/semesters", label: "Học kỳ", icon: CalendarDays },
        ]
      : user.vaiTro === "TEACHER"
        ? [
            {
              href: "/teacher/sections",
              label: "Lớp phụ trách & kết quả",
              icon: BookOpen,
            },
          ]
        : [
            {
              href: "/student/enrollments",
              label: "Đăng ký học phần",
              icon: ClipboardList,
            },
            {
              href: "/student/results",
              label: "Kết quả học tập",
              icon: GraduationCap,
            },
          ];
  return (
    <div className="workspace">
      {open && (
        <button
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
          aria-label="Đóng menu"
        />
      )}
      <aside className={"sidebar " + (open ? "is-open" : "")}>
        <Link className="brand" href={"/" + base}>
          <img src="/images/haui-logo.png" alt="HaUI" width={46} height={46} />
          <span>QUẢN LÝ SINH VIÊN</span>
        </Link>
        <p className="nav-caption">KHÔNG GIAN LÀM VIỆC</p>
        <nav>
          {[
            ...common,
            ...menus,
            { href: "/profile", label: "Thông tin cá nhân", icon: UserRound },
          ].map((item) => (
            <Link
              key={item.href}
              href={user.yeuCauDoiMatKhau ? "/profile" : item.href}
              onClick={() => setOpen(false)}
              className={"nav-item " + (path === item.href ? "active" : "")}
            >
              <item.icon size={19} strokeWidth={1.6} />
              <span>{item.label}</span>
              {path === item.href && <i />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">{roleLabels[user.vaiTro]}</div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="row-actions">
            <button
              className="icon-button mobile-menu"
              onClick={() => setOpen(!open)}
              aria-label="Mở menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
            <span className="muted">Cổng thông tin</span>
            <span>{roleLabels[user.vaiTro]}</span>
          </div>
          <div className="row-actions">
            <span className="avatar">{user.hoTen.slice(0, 1)}</span>
            <div>
              <strong>{user.tenDangNhap}</strong>
              <small className="muted block">{roleLabels[user.vaiTro]}</small>
            </div>
            <button
              className="icon-button"
              aria-label="Đăng xuất"
              title="Đăng xuất"
              onClick={async () => {
                try {
                  await api("auth/logout", "POST");
                  window.location.assign("/login");
                } catch (e) {
                  setError(message(e));
                }
              }}
            >
              <LogOut size={19} />
            </button>
          </div>
        </header>
        <main className="content">
          {error && <p className="alert error">{error}</p>}
          {children}
          <footer>
            <span>Hệ thống quản lý sinh viên</span>
            <span>Dữ liệu học tập, trong tầm tay.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
