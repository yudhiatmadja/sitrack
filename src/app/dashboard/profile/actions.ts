'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Definisikan tipe untuk data profil
type ProfileData = {
  full_name: string | null;
  phone_number: string | null;
}

// Tipe untuk state feedback
type FormState = {
  message: string;
  isSuccess: boolean;
  // Tambahkan data profil yang diperbarui di sini
  updatedProfile?: ProfileData | null;
}

type ChangePasswordState = {
  error?: string;
  success?: boolean;
}

const ProfileSchema = z.object({
  full_name: z.string().min(3, { message: 'Nama lengkap minimal 3 karakter.' }),
  phone_number: z.string().optional(),
});

export async function updateProfile(prevState: FormState, formData: FormData): Promise<FormState> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { message: 'Pengguna tidak ditemukan.', isSuccess: false };
  }

  const validatedFields = ProfileSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    const errorMessage = validatedFields.error.issues[0]?.message || 'Input tidak valid.';
    return { message: errorMessage, isSuccess: false };
  }
  
  const { full_name, phone_number } = validatedFields.data;
  const dataToUpdate = {
    full_name,
    phone_number: phone_number || null,
  };

  // Update dan langsung ambil data yang baru (select())
  const { data: updatedData, error } = await supabase
    .from('users')
    .update(dataToUpdate)
    .eq('id', user.id)
    .select('full_name, phone_number') // Hanya select kolom yang di-update
    .single();

  if (error) {
    return { message: `Gagal memperbarui profil: ${error.message}`, isSuccess: false };
  }

  revalidatePath('/dashboard/profile');
  // Kembalikan data baru agar UI bisa di-update
  return { 
    message: 'Profil berhasil diperbarui!', 
    isSuccess: true,
    updatedProfile: updatedData
  };
}

export async function changeUserPassword(prevState: ChangePasswordState, formData: FormData): Promise<ChangePasswordState> {
    'use server'

    const supabase = createClient();
    const newPassword = formData.get('new_password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    // 1. Validasi Sederhana di Server
    if (newPassword.length < 8) {
        return { error: "Password baru minimal harus 8 karakter." };
    }
    if (newPassword !== confirmPassword) {
        return { error: "Konfirmasi password baru tidak cocok." };
    }

    // 2. Update password pengguna
    // Fungsi updateUser dari Supabase sudah otomatis melakukan re-autentikasi
    // jika password diubah, sehingga tidak perlu verifikasi password lama secara manual.
    const { error } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (error) {
        return { error: `Gagal mengubah password: ${error.message}` };
    }

    return { success: true, error: undefined };
}