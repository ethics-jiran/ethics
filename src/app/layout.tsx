import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "지란지교패밀리 - 윤리경영 제보관리센터",
  description: "Customer inquiry management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
