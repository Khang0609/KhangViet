import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Khang Việt Design",
  description: "Khang Việt Design - Architectural and Interior Design Studio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col font-sans bg-[#050709] text-white">
        {children}
      </body>
    </html>
  );
}
