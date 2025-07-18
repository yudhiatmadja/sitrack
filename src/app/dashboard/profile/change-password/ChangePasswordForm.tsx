'use client'

import { useActionState, useEffect, useRef } from 'react'
import { changeUserPassword } from '../actions' // Impor dari profile/actions.ts
import { SubmitButton } from '@/components/ui/SubmitButton'
import { toast } from 'sonner'

export function ChangePasswordForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const initialState = { error: undefined, success: false };
    const [state, formAction] = useActionState(changeUserPassword, initialState);

    useEffect(() => {
        if (state.error) {
            toast.error(state.error);
        }
        if (state.success) {
            toast.success("Password berhasil diubah!");
            formRef.current?.reset(); // Kosongkan form setelah sukses
        }
    }, [state]);

    return (
        <form ref={formRef} action={formAction} className="space-y-4">
            <div>
                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">Password Saat Ini</label>
                <input type="password" id="current_password" name="current_password" required className="input-style mt-1" />
                {/* Supabase menangani verifikasi ini, jadi kita tidak perlu input ini untuk validasi server */}
            </div>
            <div>
                <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">Password Baru</label>
                <input type="password" id="new_password" name="new_password" required className="input-style mt-1" />
            </div>
            <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                <input type="password" id="confirm_password" name="confirm_password" required className="input-style mt-1" />
            </div>
            <div className="pt-4">
                <SubmitButton text="Ubah Password" className="w-full" />
            </div>
        </form>
    );
}