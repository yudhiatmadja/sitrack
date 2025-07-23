'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import type { SiteForMap } from './page'

interface MapLoaderProps {
  sites: SiteForMap[];
}

export function MapLoader({ sites }: MapLoaderProps) {
  // Dynamic import dengan ssr: false untuk menghindari SSR issues dengan Leaflet
  const Map = useMemo(() => dynamic(
    () => import('./MapViewClient').then((mod) => mod.MapViewClient),
    { 
      loading: () => (
        <div className="h-full w-full flex flex-col items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Memuat Peta...</p>
          <p className="text-gray-500 text-sm mt-2">
            {sites.length > 0 
              ? `Memproses ${sites.length} site dengan koordinat` 
              : 'Memuat data site...'
            }
          </p>
          <div className="mt-4 text-xs text-gray-400">
            💡 Pastikan JavaScript diaktifkan dan browser mendukung geolocation
          </div>
        </div>
      ),
      ssr: false // Menonaktifkan server-side rendering untuk komponen ini
    }
  ), []); // Empty dependency array - hanya dibuat sekali

  return <Map sites={sites} />;
}