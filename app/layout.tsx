import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

import SessionProvider from '@/components/providers/SessionProvider';

const inter = Inter({ subsets: ["latin"] });

import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: "Flow Forge AI - Convert YouTube Videos to Blog Posts",
  description: "Transform any YouTube video into a well-structured, SEO-optimized blog post in seconds with Flow Forge AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-white`}>
        <SessionProvider>
          <Navbar />
          <main className="pt-16 max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
          <Toaster position="top-right" />
        </SessionProvider>
      </body>
    </html>
  );
}
