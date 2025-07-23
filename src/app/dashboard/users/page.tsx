import { createClient } from "@/lib/supabase/server";
import Link from 'next/link';
import { PlusCircle, Edit, Users, Shield } from "lucide-react";
import { DeleteButton } from "./DeteleButton"

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
        return (
            <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                    <Shield className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-red-700 font-medium">Gagal memuat data pengguna</p>
                </div>
                <p className="text-red-600 text-sm mt-1">{error.message}</p>
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className="mt-8 text-center py-12 bg-gray-50 rounded-lg">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg font-medium">Tidak ada pengguna</p>
                <p className="text-gray-400 text-sm">Mulai dengan menambahkan pengguna pertama</p>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900">
                        Daftar Pengguna ({users.length})
                    </h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pengguna
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Peran
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user: UserDetail) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium text-gray-600">
                                                    {user.full_name?.charAt(0)?.toUpperCase() || 
                                                     user.email?.charAt(0)?.toUpperCase() || '?'}
                                                </span>
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.full_name || 'Nama tidak tersedia'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {user.id.slice(0, 8)}...
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            user.role_name 
                                                ? 'bg-blue-100 text-blue-800' 
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {user.role_name || 'Tanpa Peran'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            currentUser?.id === user.id
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {currentUser?.id === user.id ? 'Anda' : 'Aktif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-x-3">
                                            <Link 
                                                href={`/dashboard/users/${user.id}/edit`} 
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors" 
                                                title="Edit Pengguna"
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            
                                            <DeleteButton 
                                                userId={user.id} 
                                                currentUserId={currentUser?.id}
                                                userEmail={user.email || undefined}
                                                userName={user.full_name || undefined}
                                                // useSoftDelete={true}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function UsersPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-bold leading-6 text-gray-900">
                        Manajemen Pengguna
                    </h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Kelola semua akun pengguna dalam sistem. Anda dapat menambah, mengedit, dan menghapus pengguna.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <Link 
                        href="/dashboard/users/new" 
                        className="inline-flex items-center gap-x-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors"
                    >
                        <PlusCircle size={20} />
                        Tambah Pengguna Baru
                    </Link>
                </div>
            </div>

            {/* Users Table */}
            <UsersTable />

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                    <Shield className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                    <div>
                        <h3 className="text-sm font-medium text-blue-800">
                            Informasi Keamanan
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <p>
                                • Anda tidak dapat menghapus akun Anda sendiri untuk alasan keamanan.
                            </p>
                            <p>
                                • Penghapusan pengguna akan menghapus semua data terkait secara permanen.
                            </p>
                            <p>
                                • Pastikan untuk backup data penting sebelum menghapus pengguna.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}