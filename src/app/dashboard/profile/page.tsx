import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from './ProfileClient' // Impor komponen baru

// Fungsi untuk mengambil data user dan profilnya
async function getUserData() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Ambil profil beserta nama rolenya
    const { data: profile, error } = await supabase
        .from('users')
        .select(`
            id,
            full_name,
            phone_number,
            avatar_url,
            roles (name)
        `)
        .eq('id', user.id)
        .single();
    
    return { user, profile, error };
}

export default async function ProfilePage() {
  const { user, profile, error } = await getUserData();

  if (error || !profile) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h3>
        <p className="text-red-600">Gagal memuat data profil.</p>
        <p className="text-xs text-gray-500 mt-2">{error?.message}</p>
      </div>
    )
  }

  // Siapkan data untuk dikirim sebagai props
  const profileData = {
    id: profile.id,
    full_name: profile.full_name,
    phone_number: profile.phone_number,
    avatar_url: profile.avatar_url,
    role_name: (profile as any).roles?.name || 'Tidak ada peran',
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Profil Pengguna</h1>
      <ProfileClient user={user} profile={profileData} />
    </div>
  )
}