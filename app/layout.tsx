import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { AuthGuard } from "@/components/AuthGuard";
import { LayoutShell } from "@/components/LayoutShell";

export const metadata: Metadata = {
  title: "TAX PARTNER - \u7A0E\u7406\u58EB\u4E8B\u52D9\u6240DX\u30D7\u30E9\u30C3\u30C8\u30D5\u30A9\u30FC\u30E0",
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
        <AuthProvider>
          <AuthGuard>
            <LayoutShell>{children}</LayoutShell>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
