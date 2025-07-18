'use client'

import { useActionState } from 'react'
import { State } from './actions'
import Link from 'next/link'
import { SubmitButton } from '@/components/ui/SubmitButton'
import type { Database } from '@/types/supabase' // Impor tipe Database

// Definisikan tipe Owner
type Owner = Database['public']['Tables']['land_owners']['Row']

interface LandOwnerFormProps {
  owner?: Owner | null; 
  action: (prevState: State, formData: FormData) => Promise<State>
}

export function LandOwnerForm({ owner, action }: LandOwnerFormProps) {
  const initialState: State = { message: null, errors: {} }
  const [state, dispatch] = useActionState(action, initialState)

  return (
    <form action={dispatch} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
        {/* Gunakan defaultValue dari props 'owner' */}
        <input type="text" name="name" id="name" required className="input-style" defaultValue={owner?.name ?? ''} />
        {state.errors?.name && <p className="mt-2 text-sm text-red-600">{state.errors.name[0]}</p>}
      </div>
      <div>
        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">No. Telepon</label>
        <input type="text" name="phone_number" id="phone_number" className="input-style" defaultValue={owner?.phone_number ?? ''} />
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Alamat</label>
        <textarea name="address" id="address" rows={3} className="input-style" defaultValue={owner?.address ?? ''}></textarea>
      </div>
      <div>
        <label htmlFor="id_card_number" className="block text-sm font-medium text-gray-700">No. KTP (NIK)</label>
        <input type="text" name="id_card_number" id="id_card_number" className="input-style" defaultValue={owner?.id_card_number ?? ''} />
      </div>
      
      {state.message && <p className="text-sm text-center text-red-600">{state.message}</p>}

      <div className="flex items-center justify-end gap-x-4 pt-4">
        <Link href="/dashboard/land-owners" className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300">
          Batal
        </Link>
        {/* Ubah teks tombol berdasarkan apakah ini form edit atau create */}
        <SubmitButton text={owner ? "Simpan Perubahan" : "Simpan Data"} />
      </div>
    </form>
  )
}