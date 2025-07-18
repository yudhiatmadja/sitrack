import { createClient } from "@/lib/supabase/server";
import Link from 'next/link';
import { PlusCircle, Users, Edit, Trash2 } from "lucide-react";
import { getCurrentUserRole } from "@/lib/auth-helper";
import { deleteLandOwner } from "./actions";
import { Search } from "@/components/ui/Search";
import { ExportButton } from "@/components/ui/ExportButton";

function DeleteButton({ id }: { id: string }) {
    const deleteAction = deleteLandOwner.bind(null, id);
    return (
        <form action={deleteAction}>
            <button type="submit" className="p-1 text-gray-500 hover:text-red-600" title="Hapus Pemilik Lahan">
                <Trash2 size={18} />
            </button>
        </form>
    );
}

// Fixed column configuration to match actual data structure
const LandOwnerColumns = [
  { header: 'Nama', key: 'name', width: 20 },
  { header: 'No. Telepon', key: 'phone_number', width: 18 },
  { header: 'Alamat', key: 'address', width: 30 },
];

// Komponen Tabel dengan fitur search
async function LandOwnersTable({ searchQuery }: { searchQuery?: string }) {
    const supabase = createClient();
    const userRole = await getCurrentUserRole();

    // Definisikan hak akses di sini
    const canEdit = userRole === 'Asset' || userRole === 'SuperAdmin';
    const canDelete = userRole === 'SuperAdmin';

    // Query dengan filter search
    let query = supabase
        .from('land_owners')
        .select('*')
        .order('name', { ascending: true });

    // Tambahkan filter search jika ada query
    if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,phone_number.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`);
    }

    const { data: owners, error } = await query;
    
    if (error) return <p className="text-red-500">Gagal memuat data: {error.message}</p>;
    
    if (!owners || owners.length === 0) {
        return (
            <div className="mt-8 text-center py-8">
                {searchQuery ? (
                    <p className="text-gray-500">
                        Tidak ada data pemilik lahan yang ditemukan untuk pencarian "{searchQuery}".
                    </p>
                ) : (
                    <p className="text-gray-500">Belum ada data pemilik lahan.</p>
                )}
            </div>
        );
    }

    return (
        <div className="mt-8 flow-root">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Nama</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">No. Telepon</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Alamat</th>
                            <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Aksi</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {owners.map(owner => (
                            <tr key={owner.id}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{owner.name}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{owner.phone_number}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{owner.address}</td>
                                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <div className="flex items-center justify-end gap-x-4">
                                        {canEdit && (
                                            <Link href={`/dashboard/land-owners/${owner.id}/edit`} className="text-blue-600 hover:text-blue-900" title="Edit Pemilik Lahan">
                                                <Edit size={18} />
                                            </Link>
                                        )}
                                        {canDelete && (
                                            <DeleteButton id={owner.id} />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Tampilkan informasi hasil pencarian */}
            {searchQuery && (
                <div className="mt-4 text-sm text-gray-600">
                    Menampilkan {owners.length} hasil untuk "{searchQuery}"
                </div>
            )}
        </div>
    );
}

// New component to handle export data fetching
async function ExportSection({ searchQuery }: { searchQuery?: string }) {
    const supabase = createClient();
    
    // Fetch the same data as the table for export
    let query = supabase
        .from('land_owners')
        .select('*')
        .order('name', { ascending: true });

    // Apply same search filter if exists
    if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,phone_number.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`);
    }

    const { data: owners, error } = await query;
    
    if (error || !owners) {
        return null; // Don't show export button if there's an error or no data
    }

    return (
        <ExportButton
            data={owners}
            columns={LandOwnerColumns}
            filename="data-pemilik-lahan"
            title="Data Pemilik Lahan"
            sheetName="LandOwners"
        />
    );
}

export default async function LandOwnersPage({
    searchParams,
}: {
    searchParams?: {
        q?: string;
    };
}) {
    const userRole = await getCurrentUserRole();
    const canCreate = userRole === 'Asset' || userRole === 'SuperAdmin';
    const searchQuery = searchParams?.q || '';

    return (
        <div>
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-bold leading-6 text-gray-900">Data Pemilik Lahan</h1>
                    <p className="mt-2 text-sm text-gray-700">Kelola semua data pemilik lahan yang bekerja sama.</p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    {canCreate && (
                        <Link href="/dashboard/land-owners/new" className="inline-flex items-center gap-x-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500">
                            <PlusCircle size={20} />
                            Tambah Pemilik Lahan
                        </Link>
                    )}
                </div>
            </div>
            
            {/* Search Box and Export Button */}
            <div className="mt-6 flex items-center justify-between">
                <div className="w-full max-w-md">
                    <Search placeholder="Cari pemilik lahan..." />
                </div>
                <div className="ml-4">
                    <ExportSection searchQuery={searchQuery} />
                </div>
            </div>
            
            <LandOwnersTable searchQuery={searchQuery} />
        </div>
    );
}