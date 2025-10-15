import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "지란지교패밀리 - 윤리경영 상담관리센터",
  description: "Customer inquiry management system",
  icons: {
    icon: "/fav.svg",
  },
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
