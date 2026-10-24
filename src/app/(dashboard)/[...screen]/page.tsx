import { notFound, redirect } from "next/navigation";
import { needUser } from "@/server/auth/session";
import { catalogs } from "@/lib/catalogs";
import CatalogPage from "@/features/catalogs/CatalogPage";
import UsersPage from "@/features/users/UsersPage";
import SectionsPage from "@/features/sections/SectionsPage";
import ResultsPage from "@/features/results/ResultsPage";
import ProfilePage from "@/features/profile/ProfilePage";
import DashboardPage from "@/features/dashboard/DashboardPage";
export default async function Page({
  params,
}: {
  params: Promise<{ screen: string[] }>;
}) {
  const { screen } = await params,
    u = await needUser();
  if (screen.length === 1 && screen[0] === "profile")
    return <ProfilePage user={u} />;
  if (u.yeuCauDoiMatKhau) redirect("/profile");
  if (screen[0] !== u.vaiTro.toLowerCase()) notFound();
  if (screen.length === 1) return <DashboardPage user={u} />;
  if (screen.length !== 2) notFound();
  const kind = screen[1];
  if (u.vaiTro === "ADMIN") {
    if (kind === "users") return <UsersPage />;
    if (catalogs[kind]) return <CatalogPage key={kind} kind={kind} />;
  }
  if (u.vaiTro === "TEACHER" && kind === "sections") return <SectionsPage />;
  if (u.vaiTro === "STUDENT" && kind === "enrollments")
    return <SectionsPage student />;
  if (u.vaiTro === "STUDENT" && kind === "results") return <ResultsPage />;
  notFound();
}
