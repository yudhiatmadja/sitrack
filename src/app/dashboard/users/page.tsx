import { createClient } from "@/lib/supabase/server";
import Link from 'next/link';
import { PlusCircle, Edit } from "lucide-react";
import { DeleteButton } from "./DeteleButton";

type UserDetail = {
    id: string;
    full_name: string | null;
    email: string | null;
    role_name: string | null;
}

async function UsersTable() {
    const supabase = createClient();
    
    // Get current user for self-delete prevention
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    // Get all users with details
    const { data: users, error } = await supabase.rpc('get_all_users_with_details');
    
    if (error) {
        console.error("RPC Error:", error);
        return <p className="text-red-500">Gagal memuat data user: {error.message}</p>;
    }

    if (!users) {
        return <p className="text-gray-500 mt-4">Tidak ada data pengguna.</p>;
    }

    return (
        <div className="mt-8 flow-root">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nama Lengkap</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Peran</th>
                            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Aksi</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user: UserDetail) => (
                            <tr key={user.id}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{user.full_name}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {user.role_name ?? 'Tanpa Peran'}
                                </td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <div className="flex items-center justify-end gap-x-4">
                                        <Link href={`/dashboard/users/${user.id}/edit`} className="text-blue-600 hover:text-blue-900" title="Edit Pengguna">
                                            <Edit size={18} />
                                        </Link>
                                        {/* <DeleteButton userId={user.id} currentUserId={currentUser?.id} /> */}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function UsersPage() {
    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-bold leading-6 text-gray-900">Manajemen Pengguna</h1>
                    <p className="mt-2 text-sm text-gray-700">Kelola semua akun pengguna dalam sistem.</p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <Link href="/dashboard/users/new" className="inline-flex items-center gap-x-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500">
                        <PlusCircle size={20} />
                        Tambah Pengguna Baru
                    </Link>
                </div>
            </div>
            <UsersTable />
        </div>
    );
}