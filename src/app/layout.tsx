import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { VideoProvider } from '@/contexts/VideoContext';
import { Toaster } from "@/components/ui/toaster";
import MainLayout from '@/components/layout/MainLayout';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'StreamVerse',
  description: 'Your personal media streaming server.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark"> {/* Enforce dark theme */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <VideoProvider>
          <MainLayout>
            {children}
          </MainLayout>
          <Toaster />
        </VideoProvider>
      </body>
    </html>
  );
}
