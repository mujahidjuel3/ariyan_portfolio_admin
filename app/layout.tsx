import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin | Sha Ariyan Portfolio",
  description: "Manage portfolio content dynamically",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      style={{ colorScheme: "light" }}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-slate-50 font-sans text-slate-900">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
