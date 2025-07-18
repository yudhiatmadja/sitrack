'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Tipe State untuk feedback ke form
export type State = {
  errors?: {
    name?: string[];
    phone_number?: string[];
    address?: string[];
    id_card_number?: string[];
  };
  message?: string | null;
}

// Skema Zod untuk validasi
const LandOwnerSchema = z.object({
  name: z.string().min(3, { message: 'Nama lengkap minimal 3 karakter.' }),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  id_card_number: z.string().optional(),
});

// ACTION: CREATE LAND OWNER
export async function createLandOwner(prevState: State, formData: FormData): Promise<State> {
  const supabase = createClient()

  const validatedFields = LandOwnerSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Data tidak valid.',
    }
  }

  const { error } = await supabase.from('land_owners').insert(validatedFields.data);
  if (error) {
    return { message: `Database Error: Gagal membuat data pemilik lahan. (${error.message})` }
  }

  // Revalidate halaman daftar dan halaman tambah kontrak (karena dropdown akan berubah)
  revalidatePath('/dashboard/land-owners');
  revalidatePath('/dashboard/contracts/new');
  redirect('/dashboard/land-owners');
}

export async function updateLandOwner(id: string, prevState: State, formData: FormData): Promise<State> {
  const supabase = createClient();

  const validatedFields = LandOwnerSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Data tidak valid.',
    }
  }

  const { error } = await supabase
    .from('land_owners')
    .update(validatedFields.data)
    .eq('id', id);

  if (error) {
    return { message: `Database Error: Gagal memperbarui data. (${error.message})` }
  }

  revalidatePath('/dashboard/land-owners');
  revalidatePath(`/dashboard/land-owners/${id}/edit`);
  redirect('/dashboard/land-owners');
}

export async function deleteLandOwner(id: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from('land_owners')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(`Gagal menghapus data pemilik lahan: ${error.message}`);
    }

    revalidatePath('/dashboard/land-owners');
}