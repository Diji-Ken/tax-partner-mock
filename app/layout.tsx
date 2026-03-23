import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "TAX PARTNER - 税理士事務所DXプラットフォーム",
  description: "Powered by Rit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-[#f1f5f9] text-[#0f172a]">
        <Sidebar />
        <main className="ml-[260px] min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
