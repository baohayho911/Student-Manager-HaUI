import { NextRequest } from "next/server";
import { z } from "zod";
import { needUser } from "@/server/auth/session";
import { logout } from "@/server/auth/session";
import { errorResponse, AppError, requireThat } from "@/server/errors";
import { permit } from "@/server/permissions";
import { login, changePassword } from "@/features/auth/service";
import {
  listUsers,
  saveUser,
  toggleUser,
  resetPassword,
  deleteUser,
} from "@/features/users/service";
import {
  listCatalog,
  saveCatalog,
  deleteCatalog,
  lookups,
} from "@/features/catalogs/service";
import { listSections, roster } from "@/features/sections/service";
import { register, cancelRegistration } from "@/features/enrollments/service";
import { saveScore, publish, results } from "@/features/results/service";
import { profile, updateProfile } from "@/features/profile/service";
import { db } from "@/server/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
const positive = (v: unknown) => z.coerce.number().int().positive().parse(v);
async function handle(req: NextRequest, { params }: Context) {
  try {
    const p = (await params).path,
      m = req.method;
    let body: Record<string, unknown> = {};
    if (m !== "GET") {
      requireThat(
        req.headers.get("origin") === req.nextUrl.origin,
        "Yêu cầu không hợp lệ (nguồn truy cập).",
        403,
      );
      requireThat(
        Number(req.headers.get("content-length") ?? 0) < 65536,
        "Dữ liệu quá lớn.",
        413,
      );
      const text = await req.text();
      requireThat(text.length < 65536, "Dữ liệu quá lớn.", 413);
      body = text
        ? z.record(z.string(), z.unknown()).parse(JSON.parse(text))
        : {};
    }
    let result: unknown;
    if (p.join("/") === "auth/login" && m === "POST")
      result = await login(body);
    else {
      const u = await needUser();
      if (p.join("/") === "auth/logout" && m === "POST") {
        await logout();
        result = { ok: true };
      } else if (p.join("/") === "auth/password" && m === "POST")
        result = await changePassword(u, body);
      else if (p.join("/") === "auth/me" && m === "GET") result = u;
      else {
        requireThat(
          !u.yeuCauDoiMatKhau || p[0] === "profile",
          "Hãy đổi mật khẩu ban đầu tại Thông tin cá nhân.",
          403,
        );
        if (p[0] === "profile" && p.length === 1)
          result =
            m === "GET"
              ? await profile(u)
              : m === "PUT"
                ? await updateProfile(u, body)
                : undefined;
        else if (p[0] === "lookups" && m === "GET") {
          permit(u, "ADMIN");
          result = await lookups();
        } else if (p[0] === "users") {
          permit(u, "ADMIN");
          if (p.length === 1)
            result =
              m === "GET"
                ? await listUsers()
                : m === "POST"
                  ? await saveUser(null, body)
                  : undefined;
          else if (p.length === 2) {
            const id = positive(p[1]);
            result =
              m === "PUT"
                ? await saveUser(id, body)
                : m === "DELETE"
                  ? await deleteUser(u, id)
                  : undefined;
          } else if (p[2] === "enabled" && m === "POST")
            result = await toggleUser(
              u,
              positive(p[1]),
              z.boolean().parse(body.enabled),
            );
          else if (p[2] === "password" && m === "POST")
            result = await resetPassword(u, positive(p[1]), body.password);
        } else if (p[0] === "catalog") {
          permit(u, "ADMIN");
          result =
            m === "GET" && p.length === 2
              ? await listCatalog(p[1])
              : m === "POST" && p.length === 2
                ? await saveCatalog(p[1], null, body)
                : m === "PUT" && p.length === 3
                  ? await saveCatalog(p[1], p[2], body)
                  : m === "DELETE" && p.length === 3
                    ? await deleteCatalog(p[1], p[2])
                    : undefined;
        } else if (p[0] === "sections") {
          if (p.length === 1 && m === "GET") result = await listSections(u);
          else if (p[2] === "roster" && m === "GET")
            result = await roster(u, positive(p[1]));
          else if (p[2] === "enroll")
            result =
              m === "POST"
                ? await register(u, positive(p[1]))
                : m === "DELETE"
                  ? await cancelRegistration(u, positive(p[1]))
                  : undefined;
          else if (p[2] === "scores" && p.length === 4 && m === "PUT")
            result = await saveScore(u, positive(p[1]), positive(p[3]), body);
          else if (p[2] === "publish" && m === "POST")
            result = await publish(
              u,
              positive(p[1]),
              z.boolean().parse(body.locked),
            );
        } else if (p[0] === "results" && m === "GET") result = await results(u);
        else if (p[0] === "dashboard" && m === "GET") {
          if (u.vaiTro === "ADMIN") {
            const [students, teachers, subjects, sections] = await Promise.all([
              db.sinhVien.count(),
              db.giangVien.count(),
              db.monHoc.count(),
              db.lopHocPhan.count(),
            ]);
            result = { students, teachers, subjects, sections };
          } else result = { sections: (await listSections(u)).length };
        }
      }
    }
    if (result === undefined)
      throw new AppError("Không tìm thấy chức năng.", 404);
    return Response.json(
      { data: result },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return errorResponse(e);
  }
}
export { handle as GET, handle as POST, handle as PUT, handle as DELETE };
