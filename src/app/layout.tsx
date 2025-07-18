// File: src/app/layout.tsx
// TIDAK ADA 'use client'

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // Judul utama yang muncul di tab browser & hasil pencarian
  title: {
  default: 'SITRACK - Platform Pelacakan SITAC oleh PT Telkom Infrastrukur Indonesia',
  template: '%s | SITRACK Telkom',
},
description: 'SITRACK adalah sistem resmi dari PT Telkom Indonesia untuk pelacakan dan manajemen Site Acquisition (SITAC) secara efisien dan transparan.',

  // Kata kunci utama
  keywords: ['SITAC', 'Site Acquisition', 'Manajemen Lahan', 'Tracker Telekomunikasi', 'ODC', 'Mini OLT'],
  // Informasi untuk social media sharing (Open Graph)
  openGraph: {
    title: 'SITRACK - Solusi Pelacakan Akuisisi Lahan Telekomunikasi',
    description: 'Optimalkan proses SITAC Anda dengan SITRACK.',
    url: 'https://sitrack.ydxlabs.my.id', // Ganti dengan domain Anda
    siteName: 'SITRACK',
    images: [
      {
        url: 'https://sitrack.ydxlabs.my.id/og-image.png', // Buat gambar preview 1200x630px
        width: 1200,
        height: 1200,
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  // Informasi untuk Twitter sharing
  twitter: {
    card: 'summary_large_image',
    title: 'SITRACK - Pelacakan Akuisisi Lahan Jadi Mudah',
    description: 'Lacak lokasi, kelola kontrak, dan monitor perizinan secara real-time.',
    images: ['https://sitrack.ydxlabs.my.id/og-image.png'], // Buat gambar preview 1200x675px
  },
  // Memberitahu Google URL kanonis dari situs Anda
  metadataBase: new URL('https://sitrack.ydxlabs.my.id'), // Ganti dengan domain Anda
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <Toaster richColors />
      </body>
    </html>
  );
}