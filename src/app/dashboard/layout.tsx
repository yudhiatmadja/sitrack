import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ResponsiveLayout } from '@/components/ResponsiveLayout'
import type { Database } from '@/types/supabase'
import { cookies } from 'next/headers'

// Definisikan tipe Profile yang lebih lengkap untuk digunakan di seluruh dashboard
export type ProfileWithRole = Database['public']['Tables']['users']['Row'] & {
  roles: {
    name: Database['public']['Enums']['role_name']
  } | null
}

async function getUserProfile(): Promise<ProfileWithRole | null> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return null
  }
  
  // Ambil profil user beserta nama rolenya
  const { data: profile, error } = await supabase
    .from('users')
    .select(`
      *,
      roles (
        name
      )
    `)
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    console.error('Error fetching profile or profile not found:', error?.message)
    // Jika profil tidak ditemukan, mungkin user baru saja mendaftar
    // dan profilnya belum dibuat. Redirect ke login bisa jadi solusi aman.
    return null
  }
  
  return profile as ProfileWithRole
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getUserProfile()

  if (!profile) {
    // Jika tidak ada profil (atau error), paksa user kembali ke login
    redirect('/login')
  }

  return (
    <ResponsiveLayout 
      userProfile={profile}
      roleName={profile.roles?.name}
    >
      {/* Container untuk main content - responsive */}
      <div className="container mx-auto px-3 py-4 lg:px-6 lg:py-8 max-w-7xl">
        {children}
      </div>
    </ResponsiveLayout>
  )
}