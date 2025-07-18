'use client'

import { useActionState } from 'react'
import type { Database } from '@/types/supabase'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { type UserState, updateUserRole } from '../../actions'

type Role = Database['public']['Tables']['roles']['Row'];
type UserDetail = {
    id: string;
    role_name: string | null;
}

interface EditFormProps {
    user: UserDetail;
    roles: Role[];
}

export function EditUserRoleForm({ user, roles }: EditFormProps) {
    const initialState: UserState = { message: null, errors: {} };
    
    // Create a wrapper function that matches the expected signature for useActionState
    const wrappedAction = async (prevState: UserState, formData: FormData): Promise<UserState> => {
        const result = await updateUserRole(user.id, prevState, formData);
        // Ensure we always return a UserState object
        return result || { message: 'Terjadi kesalahan yang tidak diketahui' };
    };

    const [state, formAction] = useActionState<UserState, FormData>(wrappedAction, initialState);

    return (
        <form action={formAction} className="space-y-4">
            <div>
                <label htmlFor="role_id" className="block text-sm font-medium text-gray-700">
                    Ubah Peran menjadi
                </label>
                <select
                    id="role_id"
                    name="role_id"
                    required
                    className="input-style mt-1"
                    defaultValue={roles.find(r => r.name === user.role_name)?.id ?? ''}
                >
                    <option value="" disabled>-- Pilih Peran Baru --</option>
                    {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                            {role.name}
                        </option>
                    ))}
                </select>
                
                {/* Display errors */}
                {state?.errors?.role_id && (
                    <p className="text-sm text-red-600 mt-2">{state.errors.role_id}</p>
                )}
                {state?.message && (
                    <p className="text-sm text-red-600 mt-2">{state.message}</p>
                )}
            </div>
            
            <div className="flex justify-end pt-4">
                <SubmitButton text="Simpan Perubahan Peran" />
            </div>
        </form>
    );
}