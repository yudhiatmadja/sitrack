'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix untuk marker icons di Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void
  initialCoordinates?: string
}

export default function MapSelector({ onLocationSelect, initialCoordinates }: MapSelectorProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  
  const [currentPosition, setCurrentPosition] = useState<{lat: number, lng: number} | null>(null)
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>('')

  // Parse initial coordinates
  const parseCoordinates = (coords: string | undefined) => {
    if (!coords) return null
    const parts = coords.split(',').map(s => parseFloat(s.trim()))
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] }
    }
    return null
  }

  // Reverse geocoding untuk mendapatkan alamat dari koordinat
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsLoadingAddress(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      if (response.ok) {
        const result = await response.json()
        const address = result.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        setSelectedAddress(address)
        return address
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error)
    } finally {
      setIsLoadingAddress(false)
    }
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }

  // Handle marker drag
  const handleMarkerDrag = async (e: L.DragEndEvent) => {
    const marker = e.target
    const position = marker.getLatLng()
    setCurrentPosition({ lat: position.lat, lng: position.lng })
    await reverseGeocode(position.lat, position.lng)
  }

  // Handle map click
  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng
    
    // Update marker position
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    }
    
    setCurrentPosition({ lat, lng })
    await reverseGeocode(lat, lng)
  }

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Tentukan posisi awal
    const initialPos = parseCoordinates(initialCoordinates)
    const defaultPos = { lat: -6.2088, lng: 106.8456 } // Jakarta
    const startPos = initialPos || defaultPos

    // Buat map
    const map = L.map(mapRef.current).setView([startPos.lat, startPos.lng], 15)
    
    // Tambahkan tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    // Buat marker yang bisa di-drag
    const marker = L.marker([startPos.lat, startPos.lng], {
      draggable: true
    }).addTo(map)

    // Event listeners
    marker.on('dragend', handleMarkerDrag)
    map.on('click', handleMapClick)

    // Simpan references
    mapInstanceRef.current = map
    markerRef.current = marker
    setCurrentPosition(startPos)

    // Load initial address jika ada koordinat
    if (initialPos) {
      reverseGeocode(initialPos.lat, initialPos.lng)
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  // Handle location selection
  const handleSelectLocation = () => {
    if (currentPosition) {
      onLocationSelect(currentPosition.lat, currentPosition.lng, selectedAddress)
    }
  }

  // Get current user location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          
          // Update map view
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 15)
          }
          
          // Update marker
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng])
          }
          
          setCurrentPosition({ lat, lng })
          await reverseGeocode(lat, lng)
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Tidak dapat mengakses lokasi. Pastikan GPS diaktifkan dan izin lokasi diberikan.')
        }
      )
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Map container */}
      <div ref={mapRef} className="flex-1 rounded-lg overflow-hidden border border-gray-300" />
      
      {/* Control panel */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
        {/* Current coordinates */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Koordinat Terpilih:
          </label>
          <div className="text-sm font-mono bg-white px-3 py-2 rounded border">
            {currentPosition 
              ? `${currentPosition.lat.toFixed(6)}, ${currentPosition.lng.toFixed(6)}`
              : 'Klik pada peta untuk memilih lokasi'
            }
          </div>
        </div>

        {/* Current address */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Alamat:
          </label>
          <div className="text-sm bg-white px-3 py-2 rounded border min-h-[40px] flex items-center">
            {isLoadingAddress ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-gray-500">Mencari alamat...</span>
              </div>
            ) : (
              selectedAddress || 'Klik pada peta untuk mendapatkan alamat'
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={getCurrentLocation}
            className="flex-1 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200"
          >
            📍 Lokasi Saat Ini
          </button>
          
          <button
            type="button"
            onClick={handleSelectLocation}
            disabled={!currentPosition}
            className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded"
          >
            ✓ Pilih Lokasi
          </button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 text-center">
          💡 Klik pada peta atau seret marker untuk memilih lokasi
        </div>
      </div>
    </div>
  )
}