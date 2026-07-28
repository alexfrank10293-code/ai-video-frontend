import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AI Video Factory | Zero-Cost Video Generation",
  description: "Automated decoupled AI video generation powered by Wan2.2 & Kokoro-TTS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased bg-slate-950 text-slate-50 min-h-screen relative selection:bg-indigo-500/30 selection:text-indigo-200`}>
        {/* Background ambient lighting */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-indigo-900/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-900/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>
        {children}
      </body>
    </html>
  );
}
