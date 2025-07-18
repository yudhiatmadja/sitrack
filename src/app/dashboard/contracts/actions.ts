'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

// ==========================
// TIPE-TIPE
// ==========================

export type UserState = {
  errors?: {
    email?: string[];
    password?: string[];
    full_name?: string[];
    role_id?: string[];
  };
  message?: string | null;
};

export type State = {
  errors?: {
    site_id?: string[];
    contract_number?: string[];
    start_date?: string[];
    end_date?: string[];
    rental_price?: string[];
    status?: string[];
  };
  message?: string | null;
};

// ==========================
// VALIDASI
// ==========================

const CreateUserSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid.' }),
  password: z.string().min(8, { message: 'Password minimal 8 karakter.' }),
  full_name: z.string().min(3, { message: 'Nama lengkap minimal 3 karakter.' }),
  role_id: z.string().uuid({ message: 'Role harus dipilih.' }),
});

const ContractSchema = z.object({
  site_id: z.string().uuid({ message: 'Site harus dipilih.' }),
  contract_number: z.string().min(1, 'Nomor kontrak tidak boleh kosong.'),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Tanggal mulai tidak valid." }),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Tanggal berakhir tidak valid." }),
  rental_price: z.coerce.number().min(0, 'Harga sewa tidak valid.'),
  status: z.enum(['Draft', 'Waiting Approval', 'Approved', 'Rejected', 'Expired']),
});

// ==========================
// ACTION: Buat User
// ==========================

export async function createUser(prevState: UserState, formData: FormData): Promise<UserState> {
  const validatedFields = CreateUserSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Input tidak valid. Mohon periksa kembali isian Anda.',
    };
  }

  const { email, password, full_name, role_id } = validatedFields.data;

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return { message: `Gagal membuat user di Auth: ${authError.message}` };
  }

  const { error: profileError } = await supabaseAdmin.from('users').insert({
    id: authData.user.id,
    full_name,
    role_id,
  });

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return { message: `Gagal membuat profil user: ${profileError.message}` };
  }

  revalidatePath('/dashboard/users');
  redirect('/dashboard/users');
}

// ==========================
// ACTION: Buat Kontrak
// ==========================

export async function createContract(prevState: State, formData: FormData): Promise<State> {
  const supabase = createClient();
  const validatedFields = ContractSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Data tidak valid.',
    };
  }

  const documentFile = formData.get('document') as File;
  let urlData: any = { publicUrl: null };

  if (documentFile && documentFile.size > 0) {
    const fileExt = documentFile.name.split('.').pop();
    const filePath = `public/${validatedFields.data.contract_number}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(filePath, documentFile);

    if (uploadError) {
      return { message: `Gagal mengunggah file: ${uploadError.message}` };
    }

    const { data } = supabase.storage.from('contracts').getPublicUrl(filePath);
    urlData = data;

    if (!urlData.publicUrl) {
      return { message: 'Gagal mendapatkan URL publik setelah upload.' };
    }
  }

  const { error: dbError } = await supabase.from('contracts').insert({
    ...validatedFields.data,
    document_url: urlData.publicUrl,
  });

  if (dbError) {
    if (urlData.publicUrl) {
      const filePath = urlData.publicUrl.split('/').pop();
      if (filePath) {
        await supabase.storage.from('contracts').remove([`public/${filePath}`]);
      }
    }
    return { message: `Gagal menyimpan data ke DB: ${dbError.message}` };
  }

  revalidatePath('/dashboard/contracts');
  redirect('/dashboard/contracts');
}

// ==========================
// ACTION: Hapus Kontrak
// ==========================

export async function deleteContract(id: string) {
  const supabase = createClient();

  const { data: contract, error: fetchError } = await supabase
    .from('contracts')
    .select('document_url')
    .eq('id', id)
    .single();

  const { error: deleteDbError } = await supabase
    .from('contracts')
    .delete()
    .eq('id', id);

  if (deleteDbError) {
    throw new Error(`Gagal menghapus kontrak dari database: ${deleteDbError.message}`);
  }

  if (contract?.document_url) {
    const filePath = contract.document_url.split('/').pop();
    if (filePath) {
      const { error: deleteStorageError } = await supabase.storage
        .from('contracts')
        .remove([`public/${filePath}`]);
      if (deleteStorageError) {
        console.error("Gagal menghapus file dari storage:", deleteStorageError.message);
      }
    }
  }

  revalidatePath('/dashboard/contracts');
}

// ==========================
// ACTION: Update Kontrak
// ==========================

export async function updateContract(id: string, prevState: State, formData: FormData): Promise<State> {
  const supabase = createClient();
  const validatedFields = ContractSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Data tidak valid.' };
  }

  const documentFile = formData.get('document') as File;
  let documentUrl: string | null = formData.get('current_document_url') as string || null;

  if (documentFile && documentFile.size > 0) {
    const fileExt = documentFile.name.split('.').pop();
    const filePath = `public/${validatedFields.data.contract_number}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from('contracts').upload(filePath, documentFile);
    if (uploadError) {
      return { message: `Gagal mengunggah file baru: ${uploadError.message}` };
    }

    if (documentUrl) {
      const oldFilePath = documentUrl.split('/').pop();
      if (oldFilePath) {
        await supabase.storage.from('contracts').remove([`public/${oldFilePath}`]);
      }
    }

    const { data: urlData } = supabase.storage.from('contracts').getPublicUrl(filePath);
    documentUrl = urlData.publicUrl;
  }

  const { error: dbError } = await supabase
    .from('contracts')
    .update({
      ...validatedFields.data,
      document_url: documentUrl,
    })
    .eq('id', id);

  if (dbError) {
    return { message: `Gagal memperbarui data di DB: ${dbError.message}` };
  }

  revalidatePath('/dashboard/contracts');
  revalidatePath(`/dashboard/contracts/${id}/edit`);
  revalidatePath(`/dashboard/contracts/${id}`);
  redirect('/dashboard/contracts');
}
