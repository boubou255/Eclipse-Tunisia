import type { Metadata } from "next";
import { Schibsted_Grotesk, Bodoni_Moda } from "next/font/google";
import "./admin.css";

const body = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Bodoni_Moda({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "Admin | Eclipse Tunisia",
  robots: { index: false, follow: false },
};

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${display.variable}`}>{children}</body>
    </html>
  );
}
