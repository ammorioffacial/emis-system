import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "نظام EMIS لإدارة الطلاب",
  description: "نظام إدارة معلومات الطلاب - استمارة إضافة التلاميذ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className="font-tajawal bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
