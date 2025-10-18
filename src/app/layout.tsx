import "./globals.css";
import React from "react";

export const metadata = {
  title: "Semester Tools — Utility Suite",
  description:
    "Tweet→Image, JPEG Compressor, QR Code, Email Extractor, Color Palette — a crafted set of focused, privacy-first utilities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0B0B0F] text-white antialiased selection:bg-indigo-500/30">
        <div className="relative flex flex-col min-h-screen px-6">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-black" />

          <header className="w-full py-10">
            <div className="max-w-6xl mx-auto flex flex-col gap-3">
              <h1 className="text-4xl font-semibold tracking-tight text-white/90">
                Semester<span className="text-indigo-400"> Tools</span>
              </h1>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xl">
                A precision-built suite of web utilities — crafted with modern
                design, client-side performance, and user privacy in mind.
              </p>
            </div>
          </header>

          <main className="flex-1 max-w-6xl mx-auto w-full">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_40px_-20px_rgba(0,0,0,0.6)] p-8 transition-all hover:border-white/20 hover:shadow-[0_0_50px_-15px_rgba(99,102,241,0.3)]">
              {children}
            </div>
          </main>

          <footer className="max-w-6xl mx-auto w-full mt-16 border-t border-white/10 pt-6 pb-10 text-sm text-gray-500">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <p className="text-gray-400">
                © {new Date().getFullYear()}{" "}
                <span className="text-white/80 font-medium">
                  Hanzlla Soomro
                </span>
                . All rights reserved.
              </p>
              <p className="text-gray-500 text-xs">
                Built for performance.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
