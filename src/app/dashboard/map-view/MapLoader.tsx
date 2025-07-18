'use client' // Tandai ini sebagai Client Component

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import type { SiteForMap } from './page' // Kita bisa mengimpor tipe dari page

interface MapLoaderProps {
  sites: SiteForMap[];
}

export function MapLoader({ sites }: MapLoaderProps) {
  // Logika dynamic import dengan ssr: false sekarang valid di sini
  const Map = useMemo(() => dynamic(
    () => import('./MapViewClient').then((mod) => mod.MapViewClient),
    { 
      loading: () => (
        <div className="h-full w-full flex flex-col items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Memuat Peta...</p>
          <p className="text-gray-500 text-sm mt-2">Mendeteksi lokasi dan memuat {sites.length} site</p>
        </div>
      ),
      ssr: false // <-- Ini sekarang diizinkan
    }
  ), []); // dependensi kosong agar hanya dibuat sekali

  return <Map sites={sites} />;
}