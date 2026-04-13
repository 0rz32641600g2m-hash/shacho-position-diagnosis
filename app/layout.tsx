import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "社長の形勢診断",
  description:
    "最低限の入力で、今は攻めるべきか・守るべきか・まず盤面を整えるべきかを見立てる簡易診断。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-mist-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
