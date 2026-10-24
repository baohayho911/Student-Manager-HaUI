import { redirect } from "next/navigation";
import { currentUser } from "@/server/auth/session";
import Shell from "@/components/layout/Shell";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const u = await currentUser();
  if (!u) redirect("/login");
  return <Shell user={u}>{children}</Shell>;
}
