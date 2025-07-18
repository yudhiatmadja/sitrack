'use client'

import { useActionState, useEffect, useRef } from 'react'
import { updateProfile } from './actions'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { toast } from 'sonner'

// Tipe data profil yang bisa di-update
type UpdatableProfile = {
  full_name: string | null;
  phone_number: string | null;
}

interface EditProfileModalProps {
  user: UpdatableProfile;
  onClose: () => void;
  // Fungsi callback baru untuk mengirim data baru ke parent
  onProfileUpdate: (newProfileData: UpdatableProfile) => void;
}

export function EditProfileModal({ user, onClose, onProfileUpdate }: EditProfileModalProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const initialState = { message: '', isSuccess: false, updatedProfile: null };
  const [state, formAction] = useActionState(updateProfile, initialState);

  // useEffect untuk menangani hasil dari server action
  useEffect(() => {
    if (state.message) {
      if (state.isSuccess && state.updatedProfile) {
        toast.success(state.message);
        // Panggil callback untuk update UI di parent
        onProfileUpdate(state.updatedProfile);
        onClose(); // Tutup modal
      } else if (!state.isSuccess) {
        toast.error(state.message);
      }
    }
  }, [state, onClose, onProfileUpdate]);

  return (
    <dialog open className="p-0 rounded-lg shadow-2xl backdrop:bg-black/50 fixed inset-0 m-auto z-50">
      <div className="w-full max-w-md">
        <form ref={formRef} action={formAction}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800">Edit Profil</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                <input type="text" id="full_name" name="full_name" required defaultValue={user.full_name ?? ''} className="input-style mt-1" />
              </div>
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
                <input type="tel" id="phone_number" name="phone_number" defaultValue={user.phone_number ?? ''} className="input-style mt-1" />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">
              Batal
            </button>
            <SubmitButton text="Simpan Perubahan" />
          </div>
        </form>
      </div>
    </dialog>
  );
}