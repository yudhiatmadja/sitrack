'use client'

import { useActionState } from 'react'
import type { Database } from '@/types/supabase'
import Link from 'next/link'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { State } from '../../actions'

// Definisikan tipe props
type Site = Database['public']['Tables']['sites']['Row']
type Contract = Database['public']['Tables']['contracts']['Row']

interface ContractFormProps {
  sites: SiteForForm[] // Daftar semua site untuk dropdown
  contract?: Contract | null
  action: (prevState: any, formData: FormData) => Promise<State>
}

type SiteForForm = {
  id: string;
  name: string;
}

export function ContractForm({ sites, contract, action }: ContractFormProps) {
  const initialState: State = { message: null, errors: {
      contract_number: undefined,
      start_date: undefined,
      end_date: undefined,
      rental_price: undefined,
      status: undefined
  } }
  const [state, dispatch] = useActionState(action, initialState)

  return (
    <form action={dispatch} className="space-y-6">
      {/* --- Site Selection --- */}
      {contract?.document_url && (
    <input type="hidden" name="current_document_url" value={contract.document_url} />
  )}
      <div>
        <label htmlFor="contract_number" className="block text-sm font-medium text-gray-700">Nomor Kontrak</label>
        <input type="text" id="contract_number" name="contract_number" defaultValue={contract?.contract_number ?? ''} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        {state.errors?.contract_number && <p className="mt-2 text-sm text-red-600">{state.errors.contract_number[0]}</p>}
      </div>
      <div>
        <label htmlFor="site_id" className="block text-sm font-medium text-gray-700">Pilih Site</label>
        <select
          id="site_id"
          name="site_id"
          defaultValue={contract?.site_id ?? ''}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="" disabled>-- Pilih Lokasi Site --</option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </select>
        {state.errors?.site_id && <p className="mt-2 text-sm text-red-600">{state.errors.site_id[0]}</p>}
      </div>

      {/* --- Contract Number --- */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- Start Date --- */}
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
          <input type="date" id="start_date" name="start_date" defaultValue={contract?.start_date ?? ''} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          {state.errors?.start_date && <p className="mt-2 text-sm text-red-600">{state.errors.start_date[0]}</p>}
        </div>
        {/* --- End Date --- */}
        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">Tanggal Berakhir</label>
          <input type="date" id="end_date" name="end_date" defaultValue={contract?.end_date ?? ''} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          {state.errors?.end_date && <p className="mt-2 text-sm text-red-600">{state.errors.end_date[0]}</p>}
        </div>
      </div>
      
      {/* --- Rental Price --- */}
      <div>
        <label htmlFor="rental_price" className="block text-sm font-medium text-gray-700">Harga Sewa (Rp)</label>
        <input type="number" id="rental_price" name="rental_price" step="0.01" defaultValue={contract?.rental_price ?? 0} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
        {state.errors?.rental_price && <p className="mt-2 text-sm text-red-600">{state.errors.rental_price[0]}</p>}
      </div>

      {/* --- Status --- */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
        <select id="status" name="status" defaultValue={contract?.status ?? 'Draft'} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
          <option value="Draft">Draft</option>
          <option value="Waiting Approval">Waiting Approval</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Expired">Expired</option>
        </select>
        {state.errors?.status && <p className="mt-2 text-sm text-red-600">{state.errors.status[0]}</p>}
      </div>
      
      {/* --- Document Upload --- */}
      <div>
        <label htmlFor="document" className="block text-sm font-medium text-gray-700">Dokumen Kontrak (PDF, JPG, PNG)</label>
        <input type="file" id="document" name="document" accept=".pdf,.jpg,.jpeg,.png" required={!contract} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        {contract?.document_url && <p className="text-sm mt-2">File saat ini: <a href={contract.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Lihat Dokumen</a>. Unggah file baru untuk menggantinya.</p>}
      </div>
      
      {state.message && <p className="text-sm text-red-600">{state.message}</p>}

      <div className="flex items-center justify-end gap-x-4 pt-4">
        <Link href="/dashboard/contracts" className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300">
          Batal
        </Link>
        <SubmitButton text={contract ? 'Simpan Perubahan' : 'Buat Kontrak'} />
      </div>
    </form>
  )
}