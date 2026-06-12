import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wedding CMS Admin",
  description: "Admin panel for wedding invitation management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body
        className={`${inter.className} antialiased`}
        style={{
          background: 'var(--color-background, #f8f7f4)',
          color: 'var(--color-text-primary, #22382D)',
        }}
      >
        <a href="#main-content" className="skip-to-content">
          Lewati ke konten
        </a>
        <div id="main-content" tabIndex={-1}>
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>
  );
}
