'use client'

import { useActionState } from 'react'
import type { State } from './actions' // Impor State yang benar
import { type Database } from '@/types/supabase'
import { SubmitButton } from '@/components/ui/SubmitButton'
import Link from 'next/link'

type Site = Database['public']['Tables']['sites']['Row']

interface SiteFormProps {
  site?: Site | null
  action: (prevState: State, formData: FormData) => Promise<State>
}

export function SiteForm({ site, action }: SiteFormProps) {
  // 1. Gunakan initialState yang BENAR dan KOSONG
  const initialState: State = { message: null, errors: {} }
  const [state, dispatch] = useActionState(action, initialState)

  return (
    <form action={dispatch} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Site</label>
        <input type="text" id="name" name="name" defaultValue={site?.name ? String(site.name) : ''} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        {state.errors?.name && <p className="mt-2 text-sm text-red-600">{state.errors.name[0]}</p>}
      </div>
      <div>
        <label htmlFor="site_type" className="block text-sm font-medium text-gray-700">Tipe Site</label>
        <select id="site_type" name="site_type" defaultValue={site?.site_type ? String(site.site_type) : ''} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
          <option value="" disabled>Pilih Tipe</option>
          <option value="ODC">ODC</option>
          <option value="Mini OLT">Mini OLT</option>
          <option value="Pole">Pole</option>
        </select>
        {state.errors?.site_type && <p className="mt-2 text-sm text-red-600">{state.errors.site_type[0]}</p>}
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