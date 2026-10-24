import type { User, Role } from "@/types";
import { requireThat } from "./errors";
export function permit(user: User, ...roles: Role[]) {
  requireThat(
    roles.includes(user.vaiTro),
    "Bạn không có quyền thực hiện thao tác này.",
    403,
  );
}
