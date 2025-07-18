'use client'

import { useActionState } from 'react'
import type { Database } from '@/types/supabase'
import Link from 'next/link'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { type UserState, createUser } from './actions' // Ganti kembali ke createUser

type RoleForForm = {
  id: string;
  name: string | null;
}

interface UserFormProps {
  roles: RoleForForm[]
}

export function UserForm({ roles }: UserFormProps) {
  const initialState: UserState = { message: null, errors: {} };
  // Gunakan action `createUser`
  const [state, formAction] = useActionState(createUser, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
        <input type="text" name="full_name" id="full_name" required className="input-style" />
        {state?.errors?.full_name && <p className="mt-2 text-sm text-red-600">{state.errors.full_name[0]}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Alamat Email</label>
        <input type="email" name="email" id="email" required className="input-style" />
        {state?.errors?.email && <p className="mt-2 text-sm text-red-600">{state.errors.email[0]}</p>}
      </div>
      
      {/* KEMBALIKAN INPUT PASSWORD */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input type="password" name="password" id="password" required className="input-style" />
        <p className="text-xs text-gray-500 mt-1">Minimal 8 karakter.</p>
        {state?.errors?.password && <p className="mt-2 text-sm text-red-600">{state.errors.password[0]}</p>}
      </div>

      <div>
        <label htmlFor="role_id" className="block text-sm font-medium text-gray-700">Peran (Role)</label>
        <select id="role_id" name="role_id" required className="input-style" defaultValue="">
          <option value="" disabled>-- Pilih Peran --</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
        {state?.errors?.role_id && <p className="mt-2 text-sm text-red-600">{state.errors.role_id[0]}</p>}
      </div>
      
      {state?.message && <p className="text-sm p-3 bg-red-50 text-red-700 rounded-md text-center">{state.message}</p>}

      <div className="flex items-center justify-end gap-x-4 pt-4">
        <Link href="/dashboard/users" className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300">
          Batal
        </Link>
        <SubmitButton text="Buat Pengguna" loadingText="Membuat..." />
      </div>
    </form>
  )
}