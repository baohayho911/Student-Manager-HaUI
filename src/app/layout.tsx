import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "HaUI · Quản lý sinh viên",
  description: "Cổng thông tin quản lý sinh viên, đào tạo và kết quả học tập.",
  icons: { icon: "/images/haui-logo.png" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
