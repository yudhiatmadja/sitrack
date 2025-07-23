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

// ENHANCED DELETE USER FUNCTION - Metode yang lebih robust
export async function deleteUser(userId: string) {
  'use server'

  if (!userId) {
    throw new Error("User ID tidak disediakan untuk dihapus.");
  }

  console.log(`[deleteUser] Memulai penghapusan user: ${userId}`);

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Metode 1: Gunakan RPC function (jika sudah dibuat)
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('force_delete_user', {
      p_user_id: userId
    });

    if (rpcError) {
      console.warn(`[deleteUser] RPC gagal: ${rpcError.message}. Mencoba metode manual...`);
      
      // Metode 2: Manual deletion jika RPC gagal
      await manualDeleteUser(supabaseAdmin, userId);
    } else {
      console.log(`[deleteUser] RPC berhasil: ${rpcData}`);
      
      // Pastikan juga hapus dari Auth (double check)
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (authDeleteError && !authDeleteError.message.includes('User not found')) {
        console.warn(`[deleteUser] Peringatan Auth delete: ${authDeleteError.message}`);
      }
    }

  } catch (error: any) {
    console.error(`[deleteUser] Error dalam RPC: ${error.message}`);
    
    // Fallback ke manual deletion
    try {
      await manualDeleteUser(supabaseAdmin, userId);
    } catch (manualError: any) {
      throw new Error(`Gagal menghapus user: ${manualError.message}`);
    }
  }

  console.log(`[deleteUser] User ${userId} berhasil dihapus`);
  revalidatePath('/dashboard/users');
}

// Helper function untuk manual deletion
async function manualDeleteUser(supabaseAdmin: any, userId: string) {
  console.log(`[manualDeleteUser] Memulai penghapusan manual untuk user: ${userId}`);

  // 1. Hapus dari tabel users (profile data)
  const { error: profileDeleteError } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', userId);

  if (profileDeleteError) {
    console.error(`[manualDeleteUser] Gagal hapus profil: ${profileDeleteError.message}`);
    throw new Error(`Gagal menghapus profil: ${profileDeleteError.message}`);
  }

  // 2. Hapus dari Auth
  const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  
  if (authDeleteError) {
    // Jika user sudah tidak ada di Auth, itu bukan masalah besar
    if (authDeleteError.message.includes('User not found')) {
      console.warn(`[manualDeleteUser] User tidak ditemukan di Auth (mungkin sudah dihapus): ${userId}`);
    } else {
      console.error(`[manualDeleteUser] Gagal hapus dari Auth: ${authDeleteError.message}`);
      throw new Error(`Gagal menghapus dari Auth: ${authDeleteError.message}`);
    }
  }

  console.log(`[manualDeleteUser] User ${userId} berhasil dihapus secara manual`);
}

// ALTERNATIVE: Soft Delete function (jika Anda ingin soft delete)
export async function softDeleteUser(userId: string) {
  'use server'

  if (!userId) {
    throw new Error("User ID tidak disediakan untuk dihapus.");
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Update user dengan flag deleted_at atau is_deleted
  const { error } = await supabaseAdmin
    .from('users')
    .update({ 
      deleted_at: new Date().toISOString(),
      // atau jika menggunakan boolean: is_deleted: true
    })
    .eq('id', userId);

  if (error) {
    throw new Error(`Gagal melakukan soft delete: ${error.message}`);
  }

  // Disable user di Auth (tidak menghapus, hanya disable)
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: { is_deleted: true },
    app_metadata: { is_deleted: true }
  });

  if (authError) {
    console.warn(`Peringatan: Gagal update metadata Auth: ${authError.message}`);
  }

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