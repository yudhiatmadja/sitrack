// File: src/app/dashboard/sites/page.tsx

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { PlusCircle, Building } from "lucide-react";
import { SitesTable } from "./SitesTable";
import { type Database } from "@/types/supabase";
import { getCurrentUserRole } from "@/lib/auth-helper";
import { Search } from "@/components/ui/Search";
import { ExportButton, type ExportColumn } from "@/components/ui/ExportButton";

// Define the columns for sites export
const sitesColumns: ExportColumn[] = [
  { header: 'ID', key: 'id', width: 15 },
  { header: 'Nama Site', key: 'name', width: 25 },
  { header: 'Alamat', key: 'address', width: 40 },
  { header: 'Kota', key: 'city', width: 20 },
  { header: 'Provinsi', key: 'province', width: 20 },
  { header: 'Kode Pos', key: 'postal_code', width: 15 },
  { header: 'Latitude', key: 'latitude', width: 15 },
  { header: 'Longitude', key: 'longitude', width: 15 },
  { header: 'Tanggal Dibuat', key: 'created_at', width: 20, render: 'datetime' },
  { header: 'Tanggal Diupdate', key: 'updated_at', width: 20, render: 'datetime' },
];

export default async function SitesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
  }>;
}) {
  try {
    const supabase = createClient();
    const userRole = await getCurrentUserRole();
    
    // Await searchParams before using it
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams?.q || '';

    console.log('Search query:', query); // Debug log

    const canCreate = userRole === "Asset" || userRole === "Optima" || userRole === "SuperAdmin";

    // 1. Mulai membangun query
    let queryBuilder = supabase
        .from('sites')
        // PERBARUI SELECT DI SINI
        .select(`
            *,
            regionals (name),
            witels (name),
            stos (name)
        `)
        .order('created_at', { ascending: false });

    // 2. Tambahkan filter pencarian jika ada
    if (query) {
      // Hanya cari berdasarkan nama
      // queryBuilder = queryBuilder.ilike('name', `%${query}%`);

      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,site_id.ilike.%${query}%`);
    }

    // 3. Eksekusi query yang sudah dibangun
    const { data: sites, error } = await queryBuilder;

    if (error) {
      console.error('Supabase error:', error);
      return (
        <p className="p-8 text-red-500">Error loading sites: {error.message}</p>
      );
    }

    console.log('Sites loaded:', sites?.length || 0); // Debug log
    
    return (
      <div>
        <div className="sm:flex sm:items-center mb-8">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold leading-6 text-gray-900">
              Manajemen Sites
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Daftar semua lokasi site yang terdaftar dalam sistem.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex items-center gap-3">
            {canCreate && (
              <Link
                href="/dashboard/sites/new"
                className="inline-flex items-center gap-x-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
              >
                <PlusCircle size={20} className="mr-2" />
                Tambah Site Baru
              </Link>
            )}
            <ExportButton
              data={sites || []} // Use sites data instead of contracts
              columns={sitesColumns} // Use sitesColumns instead of contractColumns
              filename="data-sites"
              title="Data Sites"
              sheetName="Sites"
            />
          </div>
        </div>

        {/* Komponen Search */}
        <div className="mb-6 w-full max-w-md">
          <Search placeholder="Cari berdasarkan nama site..." />
        </div>

        {/* Tampilan Data atau Empty State */}
        <div>
          {!sites || sites.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg shadow">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                {query ? 'Site Tidak Ditemukan' : 'Belum ada Site'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                  {query ? 'Coba kata kunci lain.' : 'Mulai dengan menambahkan data site baru.'}
              </p>
            </div>
          ) : (
            <SitesTable sites={sites} userRole={userRole} />
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Page error:', error);
    return (
      <div className="p-8 text-red-500">
        <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
        <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
}