import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a fallback, Geist is primary
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Added Toaster

export const metadata: Metadata = {
  title: 'Image Insight Explorer',
  description: 'Identify objects in images and explore related products and properties with AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
