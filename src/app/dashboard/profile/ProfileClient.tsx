'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Edit, Lock, Camera, Mail, Phone } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import createClient from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { EditProfileModal } from './EditProfileModal'


// Tipe untuk data gabungan yang diterima sebagai props
type ProfileData = {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  role_name: string | null;
}

interface ProfileClientProps {
  user: User;
  profile: ProfileData;
}

export function ProfileClient({ user, profile: initialProfile }: ProfileClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState(initialProfile);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    toast.info("Mengunggah foto profil...");

    const filePath = `avatars/${user.id}-${Date.now()}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars') // Pastikan bucket 'avatars' sudah ada
      .upload(filePath, file, { upsert: true }); // upsert: true akan menimpa file lama

    if (uploadError) {
      toast.error(`Gagal unggah foto: ${uploadError.message}`);
      setIsUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const newAvatarUrl = urlData.publicUrl;

    // Update URL avatar di tabel 'users'
    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: newAvatarUrl })
      .eq('id', user.id)
      .select()
      .single();
    
    if (updateError) {
      toast.error(`Gagal menyimpan URL foto: ${updateError.message}`);
    } else {
      setProfile(updatedProfile as ProfileData);
      toast.success("Foto profil berhasil diperbarui!");
    }
    setIsUploading(false);
  };

  const handleProfileUpdate = (newProfileData: { full_name: string | null; phone_number: string | null; }) => {
    // Update state 'profile' dengan data baru dari action
    setProfile(prevProfile => ({
      ...prevProfile,
      ...newProfileData,
    }));
  };

  const initial = profile.full_name?.charAt(0).toUpperCase() || 'U';

  
  return (
<>
    {isEditing && (
        <EditProfileModal
          user={{ full_name: profile.full_name, phone_number: profile.phone_number }}
          onClose={() => setIsEditing(false)}
          onProfileUpdate={handleProfileUpdate} // Teruskan fungsi callback baru
        />
      )}
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
      {/* Header Internal */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative flex-shrink-0">
            <label htmlFor="avatarInput" className="cursor-pointer group">
              {profile.avatar_url ? (
                <div className="w-24 h-24 rounded-full border-4 border-white/50 shadow-lg group-hover:opacity-80 transition-opacity overflow-hidden">
                  <Image
                    src={profile.avatar_url}
                    alt="Avatar"
                    width={96} // Sesuaikan dengan w-24 (24 * 4 = 96px)
                    height={96} // Sesuaikan dengan h-24 (24 * 4 = 96px)
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center shadow-lg border-4 border-white/50 group-hover:opacity-80 transition-opacity">
                  <span className="text-4xl font-bold text-white">{initial}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Camera size={24} className="text-white" />}
              </div>
            </label>
            <input type="file" id="avatarInput" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-white">{profile.full_name}</h1>
            <p className="text-red-200 mt-1 text-lg">{profile.role_name}</p>
          </div>
        </div>
      </div>
      
      {/* Detail Info */}
      <div className="p-8">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 mb-6">Detail Informasi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500">Email</label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Mail size={16} className="text-gray-400" />
              <p className="text-gray-900">{user.email}</p>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500">Nomor Telepon</label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Phone size={16} className="text-gray-400" />
              <p className="text-gray-900">{profile.phone_number || 'Belum diisi'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <button onClick={() => router.push('/dashboard/profile/change-password')} className="inline-flex items-center px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition">
            <Lock size={16} className="mr-2" />
            Ubah Password
          </button>
          <button onClick={() => setIsEditing(true)} className="inline-flex items-center px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition">
              <Edit size={16} className="mr-2" />
              Edit Profile
            </button>
        </div>
      </div>
    </div>

    </>
  )
}