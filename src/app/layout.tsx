import "./globals.css";
import React from "react";

export const metadata = {
  title: "WebTools — Utility Suite",
  description:
    "Tweet→Image, JPEG Compressor, QR Code, Email Extractor, Color Palette",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-cyan-700 text-white">
        <div className="max-w-6xl mx-auto p-6">
          <header className="mb-6">
            <h1 className="text-3xl font-extrabold">WebTools</h1>
            <p className="text-sm opacity-80">
              A compact suite of web utilities — responsive, modern, and
              privacy-friendly (client-side).
            </p>
          </header>
          {children}
          <footer className="mt-12 text-sm opacity-80">
            Made By Hanzlla Soomro — client-side only. Compatible with Next.js
            15 and modern browsers.
          </footer>
        </div>
      </body>
    </html>
  );
}
