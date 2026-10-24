import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
export class AppError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function requireThat(
  ok: unknown,
  message: string,
  status = 400,
): asserts ok {
  if (!ok) throw new AppError(message, status);
}
export function errorResponse(e: unknown) {
  if (e instanceof SyntaxError)
    return Response.json(
      { error: "Dữ liệu JSON không hợp lệ." },
      { status: 400 },
    );
  if (e instanceof AppError)
    return Response.json({ error: e.message }, { status: e.status });
  if (e instanceof ZodError)
    return Response.json(
      {
        error: e.issues
          .map((i) => i.path.join(".") + ": " + i.message)
          .join("; "),
      },
      { status: 400 },
    );
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    const msg: Record<string, string> = {
      P2002: "Mã hoặc tên đăng nhập đã tồn tại.",
      P2003:
        "Dữ liệu đang được sử dụng hoặc tham chiếu không hợp lệ. Hãy kiểm tra dữ liệu liên quan.",
      P2025: "Bản ghi không còn tồn tại.",
      P2034: "Có thao tác đồng thời. Hãy thử lại.",
    };
    if (msg[e.code])
      return Response.json({ error: msg[e.code] }, { status: 409 });
  }
  console.error("Request failed", e instanceof Error ? e.name : "Unknown");
  return Response.json(
    {
      error:
        "Không thể xử lý yêu cầu. Kiểm tra kết nối cơ sở dữ liệu và thử lại.",
    },
    { status: 500 },
  );
}
