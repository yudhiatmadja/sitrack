'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Skema validasi untuk form login
const LoginSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid.' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
})

// Fungsi untuk menangani proses login
export async function login(prevState: any, formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient()
  
  const validatedFields = LoginSchema.safeParse(
    Object.fromEntries(formData.entries())
  )

  // Jika validasi gagal, kembalikan pesan error
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Input tidak valid.',
    }
  }
  
  const { email, password } = validatedFields.data

  // Coba login ke Supabase
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // Jika Supabase mengembalikan error (misal: password salah)
  if (error) {
    return {
      message: 'Email atau password salah. Silakan coba lagi.',
    }
  }

  // Jika berhasil, revalidate path dan redirect ke dashboard
  // revalidatePath('/', 'layout') // Opsional, untuk me-refresh data di layout
  redirect('/dashboard')
}