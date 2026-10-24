import { redirect } from "next/navigation";
import { currentUser } from "@/server/auth/session";
export const dynamic = "force-dynamic";
export default async function Home() {
  const u = await currentUser();
  redirect(
    u
      ? u.yeuCauDoiMatKhau
        ? "/profile"
        : "/" + u.vaiTro.toLowerCase()
      : "/login",
  );
}
