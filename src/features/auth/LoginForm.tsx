"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { api, message } from "@/lib/api";
export default function LoginForm() {
  const [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(
        "auth/login",
        "POST",
        Object.fromEntries(new FormData(e.currentTarget)),
      );
      window.location.assign("/");
    } catch (e) {
      setError(message(e));
      setBusy(false);
    }
  }
  return (
    <main className="login-page">
      <section className="login-card">
        <img
          src="/images/haui-logo.png"
          alt="Logo Đại học Công nghiệp Hà Nội"
          width={68}
          height={68}
        />
        <h1>Đại học Công nghiệp Hà Nội</h1>
        <p className="login-subtitle">One HaUI</p>
        <form className="stack" onSubmit={submit}>
          {error && (
            <p className="alert error" role="alert">
              {error}
            </p>
          )}
          <label>
            Tên đăng nhập
            <input
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              required
              maxLength={50}
            />
          </label>
          <label>
            Mật khẩu
            <div className="password-input">
              <input
                name="password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="icon-button"
                aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <button className="login-button" disabled={busy}>
            {busy ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
        </form>
        <p className="login-copyright">
          Copyright {new Date().getFullYear()} © HaUI
        </p>
      </section>
    </main>
  );
}
