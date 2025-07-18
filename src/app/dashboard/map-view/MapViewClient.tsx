'use client'

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet'
import type { SiteForMap } from './page'
import Link from 'next/link';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { useEffect, useState } from 'react';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icon untuk lokasi pengguna
const userLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface UserLocation {
  lat: number;
  lng: number;
}

interface RouteData {
  siteId: string;
  coordinates: [number, number][];
  distance: number;
  duration: number;
  isRoutingApi: boolean; // Flag untuk menandai apakah menggunakan API atau garis lurus
}

export function MapViewClient({ sites }: { sites: SiteForMap[] }) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showDirections, setShowDirections] = useState<boolean>(false);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState<boolean>(false);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);

  // Fungsi untuk mendapatkan lokasi pengguna
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError(null);
        },
        (error) => {
          let errorMessage = 'Tidak dapat mengakses lokasi';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Izin lokasi ditolak';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Informasi lokasi tidak tersedia';
              break;
            case error.TIMEOUT:
              errorMessage = 'Waktu tunggu lokasi habis';
              break;
          }
          setLocationError(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setLocationError('Geolokasi tidak didukung browser ini');
    }
  }, []);

  // Fungsi untuk mendapatkan rute menggunakan OSRM (Open Source Routing Machine)
  const getRoute = async (start: [number, number], end: [number, number], siteId: string) => {
    try {
      // Menggunakan OSRM API (gratis, tidak perlu API key)
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=false`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
        
        return {
          siteId,
          coordinates,
          distance: route.distance / 1000, // Convert to km
          duration: route.duration / 60, // Convert to minutes
          isRoutingApi: true
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching route:', error);
      
      // Fallback ke garis lurus jika API gagal
      console.log('Falling back to straight line for site:', siteId);
      return {
        siteId,
        coordinates: [start, end],
        distance: calculateStraightDistance(start[0], start[1], end[0], end[1]),
        duration: calculateStraightDistance(start[0], start[1], end[0], end[1]) * 2, // Estimasi 2 menit per km
        isRoutingApi: false
      };
    }
  };

  // Fungsi untuk mendapatkan rute ke semua site atau site tertentu
  const fetchRoutes = async (targetSiteId?: string) => {
    if (!userLocation) return;
    
    setLoadingRoutes(true);
    const targetSites = targetSiteId 
      ? validSites.filter(site => site.id === targetSiteId)
      : validSites.slice(0, 5); // Batasi maksimal 5 site untuk performa
    
    try {
      const routePromises = targetSites.map(site => 
        site.position ? getRoute([userLocation.lat, userLocation.lng], site.position, site.id) : null
      ).filter(Boolean);
      
      const routeResults = await Promise.allSettled(routePromises);
      const validRoutes = routeResults
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => (result as PromiseFulfilledResult<RouteData>).value);
      
      if (targetSiteId) {
        setRoutes(prev => [...prev.filter(r => r.siteId !== targetSiteId), ...validRoutes]);
      } else {
        setRoutes(validRoutes);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoadingRoutes(false);
    }
  };

  // Fungsi untuk mem-parsing koordinat "lat,long"
  const parseCoords = (coords: string): [number, number] | null => {
    const parts = coords.split(',').map(part => parseFloat(part.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return [parts[0], parts[1]];
    }
    return null;
  };

  const validSites = sites.map(site => ({
    ...site,
    position: parseCoords(site.coordinates)
  })).filter(site => site.position !== null);

  if (sites.length === 0) {
    return (
      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
        <p>Tidak ada site dengan data koordinat untuk ditampilkan.</p>
      </div>
    );
  }

  // Tentukan pusat peta berdasarkan lokasi pengguna atau site pertama
  const centerPosition = userLocation 
    ? [userLocation.lat, userLocation.lng] as [number, number]
    : validSites[0]?.position as [number, number] || [-6.914744, 107.609810];

  // Fungsi untuk menghitung jarak lurus antara dua titik
  const calculateStraightDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // radius bumi dalam km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Handle toggle directions
  const handleToggleDirections = async (checked: boolean) => {
    setShowDirections(checked);
    if (checked && userLocation && routes.length === 0) {
      await fetchRoutes();
    }
  };

  // Handle individual site route
  const handleSiteRoute = async (siteId: string) => {
    if (!userLocation) return;
    
    if (selectedSite === siteId) {
      setSelectedSite(null);
      setRoutes(prev => prev.filter(r => r.siteId !== siteId));
    } else {
      setSelectedSite(siteId);
      await fetchRoutes(siteId);
    }
  };

  return (
    <div className="relative h-full w-full">
      {/* Control panel */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3 space-y-2 max-w-xs">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showDirections"
            checked={showDirections}
            onChange={(e) => handleToggleDirections(e.target.checked)}
            disabled={!userLocation || loadingRoutes}
            className="rounded"
          />
          <label htmlFor="showDirections" className="text-sm font-medium">
            Tampilkan Rute Jalan
          </label>
          {!userLocation && (
            <span className="text-xs text-gray-500">(Butuh lokasi)</span>
          )}
        </div>
        
        {loadingRoutes && (
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded flex items-center space-x-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            <span>Memuat rute...</span>
          </div>
        )}
        
        {locationError && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            {locationError}
          </div>
        )}
        
        {userLocation && (
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
            ✓ Lokasi pengguna terdeteksi
          </div>
        )}

        {routes.length > 0 && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            Menampilkan {routes.length} rute
            <div className="mt-1 text-xs text-gray-500">
              💡 Tip: Jika rute tidak muncul, coba refresh atau periksa koneksi internet
            </div>
          </div>
        )}
      </div>

      <MapContainer 
        center={centerPosition} 
        zoom={userLocation ? 12 : 10} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Marker untuk lokasi pengguna */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]} 
            icon={userLocationIcon}
          >
            <Popup>
              <div className="font-sans">
                <h3 className="font-bold text-base mb-1 text-red-600">📍 Lokasi Anda</h3>
                <p className="text-sm text-gray-600">
                  <strong>Koordinat:</strong> {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Rute jalan dari lokasi pengguna ke setiap site */}
        {showDirections && routes.map(route => (
          <Polyline
            key={`route-${route.siteId}`}
            positions={route.coordinates}
            color="blue"
            weight={3}
            opacity={0.7}
          />
        ))}

        {/* Rute individual site */}
        {selectedSite && routes.find(r => r.siteId === selectedSite) && (
          <Polyline
            key={`selected-route-${selectedSite}`}
            positions={routes.find(r => r.siteId === selectedSite)!.coordinates}
            color="red"
            weight={4}
            opacity={0.8}
          />
        )}
        
        <MarkerClusterGroup>
          {validSites.map(site => {
            const siteRoute = routes.find(r => r.siteId === site.id);
            
            return site.position && (
              <Marker key={site.id} position={site.position}>
                <Popup>
                  <div className="font-sans">
                    <h3 className="font-bold text-base mb-1">{site.name}</h3>
                    <p className="text-sm text-gray-600"><strong>ID:</strong> {site.site_id || 'N/A'}</p>
                    <p className="text-sm text-gray-600"><strong>Tipe:</strong> {site.site_type}</p>
                    <p className="text-sm text-gray-600">
                      <strong>Koordinat:</strong> {site.position[0].toFixed(6)}, {site.position[1].toFixed(6)}
                    </p>
                    
                    {/* Tampilkan informasi jarak dan rute */}
                    {userLocation && (
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">
                          <strong>Jarak Lurus:</strong> {calculateStraightDistance(
                            userLocation.lat, 
                            userLocation.lng, 
                            site.position[0], 
                            site.position[1]
                          ).toFixed(2)} km
                        </p>
                        
                        {siteRoute && (
                          <div className="mt-1">
                            <p className="text-sm text-blue-600">
                              <strong>Jarak {siteRoute.isRoutingApi ? 'Jalan' : 'Lurus'}:</strong> {siteRoute.distance.toFixed(2)} km
                            </p>
                            <p className="text-sm text-blue-600">
                              <strong>Estimasi Waktu:</strong> {Math.round(siteRoute.duration)} menit
                            </p>
                            {!siteRoute.isRoutingApi && (
                              <p className="text-xs text-orange-600 mt-1">
                                ⚠️ Menggunakan jarak lurus (API routing gagal)
                              </p>
                            )}
                          </div>
                        )}
                        
                        <button
                          onClick={() => handleSiteRoute(site.id)}
                          className="mt-2 w-full bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          disabled={!userLocation || loadingRoutes}
                        >
                          {selectedSite === site.id ? 'Sembunyikan Rute' : 'Tampilkan Rute'}
                        </button>
                      </div>
                    )}
                    
                    <Link 
                      href={`/dashboard/sites/${site.id}`} 
                      className="text-blue-600 hover:underline mt-2 inline-block text-sm"
                    >
                      Lihat Detail →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}