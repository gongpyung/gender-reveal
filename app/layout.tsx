import type { Metadata } from "next";
import "@daypicker/react/style.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "젠더리빌 | Gender Reveal",
  description: "아기의 성별을 공개해보세요!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
