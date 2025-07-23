'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

// 1. Definisikan tipe State yang BENAR untuk SITES
export type State = {
  errors?: {
    name?: string[];
    site_type?: string[];
    address?: string[];
    coordinates?: string[];
  };
  message?: string | null;
}

// 2. Definisikan Skema Zod yang BENAR dan LENGKAP
const SiteSchema = z.object({
  name: z.string().min(3, { message: 'Nama site minimal 3 karakter.' }),
  site_type_id: z.coerce.number({ message: 'Tipe site harus dipilih.' }).positive(),
  regional_id: z.coerce.number().optional().nullable(),
  witel_id: z.coerce.number().optional().nullable(),
  sto_id: z.coerce.number().optional().nullable(),
  address: z.string().optional(),
  coordinates: z.string().optional(),
});

// 3. Action CREATE SITE yang menggunakan tipe dan skema yang benar
export async function createSite(prevState: State, formData: FormData): Promise<State> {
  const cookieStore = cookies()
  const supabase = createClient()
  
  const validatedFields = SiteSchema.safeParse(Object.fromEntries(formData.entries()))
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Gagal membuat site. Mohon periksa kembali isian Anda.',
    }
  }
  
  const { error } = await supabase
    .from('sites')
    .insert(validatedFields.data)

  if (error) {
    return { message: `Database Error: Gagal membuat site. (${error.message})` }
  }
  
  revalidatePath('/dashboard/sites')
  redirect('/dashboard/sites')
}

// 4. Action DELETE SITE yang bersih - Fixed to work with FormData
// export async function deleteSite(formData: FormData) {
//     const cookieStore = cookies()
//     const supabase = createClient(cookieStore);
    
//     const id = formData.get('id') as string;
    
//     const { error } = await supabase.from("sites").delete().eq("id", id);
//     if(error) throw new Error(`Gagal menghapus site: ${error.message}`);
    
//     revalidatePath('/dashboard/sites');
// }

export async function deleteSite(formData: FormData) {
  const id = formData.get('id') as string
  if (!id) throw new Error("ID tidak ditemukan")

  const supabase = createClient()
  const { error } = await supabase.from('sites').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/sites')
}

// ACTION: UPDATE SITE
export async function updateSite(id: string, prevState: State, formData: FormData): Promise<State> {
  const cookieStore = cookies()
  const supabase = createClient()

  const validatedFields = SiteSchema.safeParse(Object.fromEntries(formData.entries()))
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Gagal memperbarui site. Mohon periksa kembali isian Anda.',
    }
  }

  const { error } = await supabase
    .from('sites')
    .update(validatedFields.data)
    .eq('id', id)
  
  if (error) {
    return {
      message: `Database Error: Gagal memperbarui site. (${error.message})`,
    }
  }

  revalidatePath('/dashboard/sites')
  revalidatePath(`/dashboard/sites/${id}/edit`)
  redirect('/dashboard/sites')
}