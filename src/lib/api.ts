export async function api<T = unknown>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const r = await fetch("/api/" + path, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await r.json();
  if (!r.ok) {
    if (r.status === 401 && path !== "auth/login")
      window.location.assign("/login");
    throw new Error(json.error ?? "Không thể xử lý yêu cầu.");
  }
  return json.data as T;
}
export const message = (e: unknown) =>
  e instanceof Error ? e.message : "Có lỗi xảy ra.";
