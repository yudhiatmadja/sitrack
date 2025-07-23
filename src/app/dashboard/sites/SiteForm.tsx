'use client'

import { useActionState } from 'react'
import type { State } from './actions'
import { type Database } from '@/types/supabase'
import { SubmitButton } from '@/components/ui/SubmitButton'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import createClient from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import { MapPin, Search, X } from 'lucide-react'

type Site = Database['public']['Tables']['sites']['Row']
type Regional = Database['public']['Tables']['regionals']['Row']
type Witel = Database['public']['Tables']['witels']['Row']
type Sto = Database['public']['Tables']['stos']['Row']
type SiteType = Database['public']['Tables']['site_types']['Row'];

interface SiteFormProps {
  site?: Site | null
  action: (prevState: State, formData: FormData) => Promise<State>
}

// Dynamic import untuk MapSelector
const MapSelector = dynamic(() => import('./MapSelector'), {
  loading: () => (
    <div className="h-64 w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Memuat peta...</p>
      </div>
    </div>
  ),
  ssr: false
});

// Interface untuk geocoding result
interface GeocodeResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

export function SiteForm({ site, action }: SiteFormProps) {
  const initialState: State = { message: null, errors: {} }
  const [state, dispatch] = useActionState(action, initialState)
  const [siteTypes, setSiteTypes] = useState<SiteType[]>([]);

  // State untuk menyimpan data dropdown
  const [regionals, setRegionals] = useState<Regional[]>([]);
  const [witels, setWitels] = useState<Witel[]>([]);
  const [stos, setStos] = useState<Sto[]>([]);

  // State untuk menyimpan pilihan pengguna
  const [selectedRegional, setSelectedRegional] = useState<string>(site?.regional_id?.toString() || '');
  const [selectedWitel, setSelectedWitel] = useState<string>(site?.witel_id?.toString() || '');
  const [selectedSto, setSelectedSto] = useState<string>(site?.sto_id?.toString() || '');
  
  // State untuk alamat dan koordinat
  const [address, setAddress] = useState<string>(site?.address ? String(site.address) : '');
  const [coordinates, setCoordinates] = useState<string>(site?.coordinates ? String(site.coordinates) : '');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [showMapSelector, setShowMapSelector] = useState<boolean>(false);
  
  // Refs
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLTextAreaElement>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchRegionals = async () => {
      const { data } = await supabase.from('regionals').select('*').order('name');
      if (data) setRegionals(data);
    };
    fetchRegionals();
  }, [supabase]);

  useEffect(() => {
    setWitels([]);
    setStos([]);
    setSelectedWitel('');
    setSelectedSto('');
    
    if (selectedRegional) {
      const fetchWitels = async () => {
        const { data } = await supabase.from('witels').select('*').eq('regional_id', selectedRegional).order('name');
        setWitels(data || []);
      };
      fetchWitels();
    }
  }, [selectedRegional, supabase]);
  
  useEffect(() => {
    setStos([]);
    setSelectedSto('');
    
    if (selectedWitel) {
      const fetchStos = async () => {
        const { data } = await supabase.from('stos').select('*').eq('witel_id', selectedWitel).order('name');
        setStos(data || []);
      };
      fetchStos();
    }
  }, [selectedWitel, supabase]);

  useEffect(() => {
    const fetchSiteTypes = async () => {
      const { data } = await supabase.from('site_types').select('*').order('name');
      if (data) setSiteTypes(data);
    };
    fetchSiteTypes();
  }, [supabase]);

  // Fungsi untuk melakukan geocoding search
  const searchAddress = async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    
    try {
      // Gunakan Nominatim OpenStreetMap untuk geocoding (gratis)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=id&addressdetails=1`
      );
      
      if (response.ok) {
        const results: GeocodeResult[] = await response.json();
        setSearchResults(results);
        setShowResults(results.length > 0);
      }
    } catch (error) {
      console.error('Error searching address:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handler untuk perubahan alamat dengan debounce
  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setAddress(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout untuk search
    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(value);
    }, 500); // Delay 500ms setelah user berhenti mengetik
  };

  // Handler untuk memilih alamat dari hasil pencarian
  const handleSelectAddress = (result: GeocodeResult) => {
    setAddress(result.display_name);
    setCoordinates(`${result.lat}, ${result.lon}`);
    setSearchResults([]);
    setShowResults(false);
  };

  // Handler untuk koordinat dari map selector
  const handleMapSelection = (lat: number, lng: number, addressFromMap?: string) => {
    setCoordinates(`${lat}, ${lng}`);
    if (addressFromMap) {
      setAddress(addressFromMap);
    }
    setShowMapSelector(false);
  };

  // Handler untuk mendapatkan lokasi saat ini
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoordinates(`${lat}, ${lng}`);
          
          // Reverse geocoding untuk mendapatkan alamat
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            );
            if (response.ok) {
              const result = await response.json();
              setAddress(result.display_name || '');
            }
          } catch (error) {
            console.error('Error reverse geocoding:', error);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Tidak dapat mengakses lokasi. Pastikan GPS diaktifkan dan izin lokasi diberikan.');
        }
      );
    } else {
      alert('Geolocation tidak didukung oleh browser ini.');
    }
  };

  return (
    <form action={dispatch} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Site</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          defaultValue={site?.name ? String(site.name) : ''} 
          required 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
        />
        {state.errors?.name && <p className="mt-2 text-sm text-red-600">{state.errors.name[0]}</p>}
      </div>

      <div>
        <label htmlFor="site_type" className="block text-sm font-medium text-gray-700">Tipe Site</label>
        <select 
          id="site_type_id" 
          name="site_type_id" 
          defaultValue={site?.site_type_id?.toString() || ''} 
          required 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="" disabled>Pilih Tipe</option>
          {siteTypes.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
        </select>
        {state.errors?.site_type && <p className="mt-2 text-sm text-red-600">{state.errors.site_type[0]}</p>}
      </div>

      {/* Cascading Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="regional_id" className="block text-sm font-medium text-gray-700">Regional</label>
          <select 
            id="regional_id" 
            name="regional_id" 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={selectedRegional}
            onChange={(e) => setSelectedRegional(e.target.value)}
          >
            <option value="">Pilih Regional</option>
            {regionals.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        
        <div>
          <label htmlFor="witel_id" className="block text-sm font-medium text-gray-700">Witel</label>
          <select 
            id="witel_id" 
            name="witel_id" 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={selectedWitel}
            onChange={(e) => setSelectedWitel(e.target.value)}
            disabled={!selectedRegional || witels.length === 0}
          >
            <option value="">Pilih Witel</option>
            {witels.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        
        <div>
          <label htmlFor="sto_id" className="block text-sm font-medium text-gray-700">STO</label>
          <select 
            id="sto_id" 
            name="sto_id" 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={selectedSto}
            onChange={(e) => setSelectedSto(e.target.value)}
            disabled={!selectedWitel || stos.length === 0}
          >
            <option value="">Pilih STO</option>
            {stos.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Enhanced Address Field with Autocomplete */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Alamat</label>
        <div className="relative">
          <textarea 
            ref={searchInputRef}
            id="address" 
            name="address" 
            rows={3} 
            value={address}
            onChange={handleAddressChange}
            placeholder="Ketik alamat untuk mendapatkan saran..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pr-20"
          />
          
          {/* Search indicator */}
          {isSearching && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Address search results dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.place_id}
                  type="button"
                  onClick={() => handleSelectAddress(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 border-b border-gray-100 last:border-b-0 flex items-start gap-2"
                >
                  <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                  <span className="text-sm text-gray-900 line-clamp-2">{result.display_name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Close search results */}
          {showResults && (
            <button
              type="button"
              onClick={() => {
                setShowResults(false);
                setSearchResults([]);
              }}
              className="absolute right-3 top-3 p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Address action buttons */}
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setShowMapSelector(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200"
          >
            <MapPin className="h-3 w-3" />
            Pilih dari Peta
          </button>
          
          <button
            type="button"
            onClick={getCurrentLocation}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md border border-green-200"
          >
            <Search className="h-3 w-3" />
            Lokasi Saat Ini
          </button>
        </div>
      </div>

      {/* Enhanced Coordinates Field */}
      <div>
        <label htmlFor="coordinates" className="block text-sm font-medium text-gray-700">
          Koordinat (Latitude, Longitude)
        </label>
        <input 
          type="text" 
          id="coordinates" 
          name="coordinates" 
          value={coordinates}
          onChange={(e) => setCoordinates(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
          placeholder="-6.2000, 106.8166"
          readOnly={false} // Allow manual editing
        />
        <p className="mt-1 text-xs text-gray-500">
          Koordinat akan terisi otomatis saat Anda memilih alamat atau lokasi dari peta
        </p>
      </div>

      {/* Map Selector Modal */}
      {showMapSelector && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowMapSelector(false)}></div>
            
            <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Pilih Lokasi dari Peta</h3>
                <button
                  type="button"
                  onClick={() => setShowMapSelector(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              
              <div className="h-96">
                <MapSelector
                  onLocationSelect={handleMapSelection}
                  initialCoordinates={coordinates}
                />
              </div>
              
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowMapSelector(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {state.message && (
        <p className="text-sm p-3 bg-red-50 text-red-700 rounded-md text-center">
          {state.message}
        </p>
      )}

      <div className="flex items-center justify-end gap-x-4">
        <Link 
          href="/dashboard/sites" 
          className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
        >
          Batal
        </Link>
        <SubmitButton text={site ? 'Simpan Perubahan' : 'Buat Site'} />
      </div>
    </form>
  )
}