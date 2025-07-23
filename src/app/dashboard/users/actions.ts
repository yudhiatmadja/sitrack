'use server'

import { z } from 'zod'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Tipe State untuk feedback
export type UserState = {
  errors?: {
    email?: string[];
    password?: string[];
    full_name?: string[];
    role_id?: string[];
  };
  message?: string | null;
};

const CreateUserSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid.' }),
  password: z.string().min(8, { message: 'Password minimal 8 karakter.' }),
  full_name: z.string().min(3, { message: 'Nama lengkap minimal 3 karakter.' }),
  role_id: z.string().uuid({ message: 'Peran (role) harus dipilih.' }),
});

export async function createUser(prevState: UserState, formData: FormData): Promise<UserState> {
  console.log("[createUser] Mulai");

  const validatedFields = CreateUserSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    console.log("[createUser] Validasi gagal:", validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Input tidak valid.',
    };
  }

  const { email, password, full_name, role_id } = validatedFields.data;

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Cek apakah user dengan email ini sudah ada di Auth
  const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) {
    console.error("[createUser] Gagal ambil daftar user:", listError.message);
    return { message: `Gagal cek user di Auth: ${listError.message}` };
  }

  const existingUser = userList.users.find(
    (user) => user.email?.toLowerCase() === email.toLowerCase()
  );

  let userId: string | null = null;
  let isNewUser = false;

  if (existingUser) {
    userId = existingUser.id;
    console.log("[createUser] User sudah ada di Auth:", userId);
  } else {
    // 2. Buat user Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error("[createUser] Gagal membuat user di Auth:", authError.message);
      return { message: `Gagal membuat user di Auth: ${authError.message}` };
    }

    userId = authData.user.id;
    isNewUser = true;
    console.log("[createUser] User Auth baru dibuat:", userId);
  }

  // 3. Cek apakah user sudah punya profil
  const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (profileCheckError) {
    console.error("[createUser] Gagal cek profil:", profileCheckError.message);
    return { message: `Gagal cek profil: ${profileCheckError.message}` };
  }

  if (existingProfile) {
    console.warn("[createUser] Profil sudah ada, tidak bisa insert lagi.");
    return { message: `Gagal: User dengan email '${email}' sudah punya profil.` };
  }

  // 4. Insert ke tabel users
  const { error: profileInsertError } = await supabaseAdmin.from('users').insert({
    id: userId,
    full_name,
    role_id,
  });

  if (profileInsertError) {
    console.error("[createUser] Gagal insert ke tabel users:", profileInsertError.message);

    if (isNewUser && userId) {
      console.warn("[createUser] Rollback: Hapus user dari Auth:", userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
    }

    return { message: `Gagal membuat profil pengguna: ${profileInsertError.message}` };
  }

  console.log("[createUser] User berhasil dibuat dan profil ditambahkan.");
  revalidatePath('/dashboard/users');
  throw redirect('/dashboard/users');
}


// ACTION: DELETE USER (MENGGUNAKAN RPC 'force_delete_user')
export async function deleteUser(userId: string) {
    'use server'

    if (!userId) {
        throw new Error("User ID tidak disediakan untuk dihapus.");
    }
    
    // Gunakan Supabase Admin Client karena memanggil RPC yang sensitif
    // adalah operasi administratif.
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Panggil fungsi RPC yang telah kita buat di database
    const { data, error } = await supabaseAdmin.rpc('force_delete_user', {
        p_user_id: userId // Nama parameter harus sama dengan di fungsi SQL (p_user_id)
    });

    if (error) {
        // Jika RPC function itu sendiri error
        console.error("RPC Error:", error);
        throw new Error(`Gagal menjalankan force_delete_user: ${error.message}`);
    }

    // `data` akan berisi string "User ... cleared." atau "Failed to delete..."
    console.log("Hasil dari force_delete_user:", data);

    // Jika pesan dari RPC mengandung kata "Failed", kita lempar error
    if (data && data.includes('Failed')) {
        throw new Error(data);
    }
    
    // Revalidate path untuk memperbarui UI
    revalidatePath('/dashboard/users');
}

export async function updateUserRole(
  userId: string,
  prevState: UserState,
  formData: FormData
): Promise<UserState> {
  const role_id = formData.get('role_id') as string;

  if (!role_id) {
    return {
      errors: { role_id: ['Peran harus dipilih.'] },
      message: 'Input tidak valid.',
    };
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from('users')
    .update({ role_id })
    .eq('id', userId);

  if (error) {
    console.error('[updateUserRole] Gagal update peran:', error.message);
    return { message: `Gagal memperbarui peran: ${error.message}` };
  }

  revalidatePath('/dashboard/users');
  return { message: 'Peran berhasil diperbarui.' };
}
