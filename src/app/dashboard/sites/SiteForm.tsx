'use client'

import { useActionState } from 'react'
import type { State } from './actions' // Impor State yang benar
import { type Database } from '@/types/supabase'
import { SubmitButton } from '@/components/ui/SubmitButton'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import createClient from '@/lib/supabase/client'

type Site = Database['public']['Tables']['sites']['Row']
type Regional = Database['public']['Tables']['regionals']['Row']
type Witel = Database['public']['Tables']['witels']['Row']
type Sto = Database['public']['Tables']['stos']['Row']
type SiteType = Database['public']['Tables']['site_types']['Row'];

interface SiteFormProps {
  site?: Site | null
  action: (prevState: State, formData: FormData) => Promise<State>
}

export function SiteForm({ site, action }: SiteFormProps) {
  // 1. Gunakan initialState yang BENAR dan KOSONG
  const initialState: State = { message: null, errors: {} }
  const [state, dispatch] = useActionState(action, initialState)
  const [siteTypes, setSiteTypes] = useState<SiteType[]>([]);

   // State untuk menyimpan data dropdown
  const [regionals, setRegionals] = useState<Regional[]>([]);
  const [witels, setWitels] = useState<Witel[]>([]);
  const [stos, setStos] = useState<Sto[]>([]);

  // State untuk menyimpan pilihan pengguna - SEMUA CONTROLLED
  const [selectedRegional, setSelectedRegional] = useState<string>(site?.regional_id?.toString() || '');
  const [selectedWitel, setSelectedWitel] = useState<string>(site?.witel_id?.toString() || '');
  const [selectedSto, setSelectedSto] = useState<string>(site?.sto_id?.toString() || ''); // TAMBAHKAN INI
  

  const supabase = createClient();

  useEffect(() => {
    const fetchRegionals = async () => {
      const { data } = await supabase.from('regionals').select('*').order('name');
      if (data) setRegionals(data);
    };
    fetchRegionals();
  }, [supabase]);

  useEffect(() => {
    // Reset witel & sto saat regional berubah
    setWitels([]);
    setStos([]);
    setSelectedWitel(''); // RESET SELECTED WITEL
    setSelectedSto('');   // RESET SELECTED STO
    
    if (selectedRegional) {
      const fetchWitels = async () => {
        const { data } = await supabase.from('witels').select('*').eq('regional_id', selectedRegional).order('name');
        setWitels(data || []);
      };
      fetchWitels();
    }
  }, [selectedRegional, supabase]);
  
  useEffect(() => {
    // Reset sto saat witel berubah
    setStos([]);
    setSelectedSto(''); // RESET SELECTED STO
    
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

  return (
    <form action={dispatch} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Site</label>
        <input type="text" id="name" name="name" defaultValue={site?.name ? String(site.name) : ''} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        {state.errors?.name && <p className="mt-2 text-sm text-red-600">{state.errors.name[0]}</p>}
      </div>
      <div>
        <label htmlFor="site_type" className="block text-sm font-medium text-gray-700">Tipe Site</label>
        <select id="site_type_id" name="site_type_id" defaultValue={site?.site_type_id?.toString() || ''} required className="input-style mt-1">
          <option value="" disabled>Pilih Tipe</option>
          {/* Isi dropdown dari state */}
          {siteTypes.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
        </select>
        {state.errors?.site_type && <p className="mt-2 text-sm text-red-600">{state.errors.site_type[0]}</p>}
      </div>

      {/* --- CASCADING DROPDOWNS - SEMUANYA CONTROLLED --- */}
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
            disabled={!selectedRegional || witels.length === 0} // DISABLE JIKA TIDAK ADA REGIONAL ATAU WITELS KOSONG
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
            value={selectedSto} // UBAH KE CONTROLLED
            onChange={(e) => setSelectedSto(e.target.value)} // TAMBAHKAN ONCHANGE
            disabled={!selectedWitel || stos.length === 0} // DISABLE JIKA TIDAK ADA WITEL ATAU STOS KOSONG
          >
            <option value="">Pilih STO</option>
            {stos.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Alamat</label>
        <textarea id="address" name="address" rows={3} defaultValue={site?.address ? String(site.address) : ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"></textarea>
      </div>
       <div>
        <label htmlFor="coordinates" className="block text-sm font-medium text-gray-700">Koordinat (Lat, Long)</label>
        <input type="text" id="coordinates" name="coordinates" defaultValue={site?.coordinates ? String(site.coordinates) : ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" placeholder="-6.2000, 106.8166" />
      </div>
      
      {state.message && <p className="text-sm p-3 bg-red-50 text-red-700 rounded-md text-center">{state.message}</p>}

      <div className="flex items-center justify-end gap-x-4">
        <Link href="/dashboard/sites" className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300">
          Batal
        </Link>
        <SubmitButton text={site ? 'Simpan Perubahan' : 'Buat Site'} />
      </div>
    </form>
  )
}