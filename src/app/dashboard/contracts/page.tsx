// File: src/app/dashboard/contracts/page.tsx
import { createClient } from "@/lib/supabase/server";
import Link from 'next/link';
import { PlusCircle, FileText, Search, Filter, X } from "lucide-react";
import { ContractsTable } from "./ContractsTable";
import { getCurrentUserRole } from "@/lib/auth-helper";
import { ExportButton } from "@/components/ui/ExportButton";

export const dynamic = 'force-dynamic';

const contractColumns = [
  { header: 'No. Kontrak', key: 'contract_number', width: 15 },
  { header: 'Nama Site', key: 'sites.name', width: 20 }, // nested property
  { header: 'Tanggal Mulai', key: 'start_date', width: 15, render: 'date' },
  { header: 'Tanggal Berakhir', key: 'end_date', width: 15, render: 'date' },
  { header: 'Status', key: 'status', width: 12, render: 'status' },
];

// Define types for the query response
type ContractQueryResponse = {
    id: string;
    contract_number: string | null;
    start_date: string | null;
    end_date: string | null;
    status: string | null;
    document_url: string | null;
    sites: { name: string } | { name: string }[] | null;
};

// Search Component
function SearchAndFilter({ 
    query, 
    selectedStatuses, 
    availableStatuses 
}: {
    query: string;
    selectedStatuses: string[];
    availableStatuses: string[];
}) {
    return (
        <div className="mb-4 space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    name="q"
                    defaultValue={query}
                    placeholder="Cari berdasarkan nomor kontrak, nama site, atau status..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500 flex items-center">Filter Status:</span>
                {availableStatuses.map((status) => (
                    <label key={status} className="inline-flex items-center">
                        <input
                            type="checkbox"
                            name="status"
                            value={status}
                            defaultChecked={selectedStatuses.includes(status)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                            {status.replace('_', ' ')}
                        </span>
                    </label>
                ))}
            </div>

            {/* Active Filters */}
            {(query || selectedStatuses.length > 0) && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-gray-500">Active filters:</span>
                    
                    {query && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                            Search: "{query}"
                        </span>
                    )}
                    
                    {selectedStatuses.map((status) => (
                        <span key={status} className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                            {status.replace('_', ' ')}
                        </span>
                    ))}
                    
                    <Link
                        href="/dashboard/contracts"
                        className="text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                        Clear all
                    </Link>
                </div>
            )}
        </div>
    );
}

export default async function ContractsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    status?: string;
  }>;
}) {
    const supabase = createClient();
    const userRole = await getCurrentUserRole();
    
    // Sesuaikan hak akses sesuai spesifikasi
    const canCreate = userRole === 'Asset' || userRole === 'SuperAdmin';
    const canEdit = userRole === 'Asset' || userRole === 'SuperAdmin' || userRole === 'Legal';
    const canDelete = userRole === 'SuperAdmin';
    const canDownload = userRole === 'Asset' || userRole === 'Legal' || userRole === 'SuperAdmin';

    // Await searchParams before using its properties
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams?.q || '';
    const statusFilter = resolvedSearchParams?.status || '';
    const selectedStatuses = statusFilter ? statusFilter.split(',') : [];

    // Get all contracts from database
    const { data: contracts, error } = await supabase
        .from('contracts')
        .select(`
            id,
            contract_number,
            start_date,
            end_date,
            status,
            document_url,
            sites (
                name
            )
        `)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Database error:', error);
        if (error.code === '42501') {
             return <p className="p-8 text-red-500">Error: Anda tidak memiliki izin untuk melihat data ini. (RLS Denied)</p>
        }
        return <p className="p-8 text-red-500">Error loading contracts: {error.message}</p>
    }

    // Helper function to extract site name
    const getSiteName = (sites: ContractQueryResponse['sites']): string | null => {
        if (!sites) return null;
        if (Array.isArray(sites)) {
            return sites.length > 0 ? sites[0]?.name || null : null;
        }
        return sites.name || null;
    };

    // Transform the data
    const transformedContracts = contracts?.map(contract => ({
        id: contract.id,
        contract_number: contract.contract_number,
        start_date: contract.start_date,
        end_date: contract.end_date,
        status: contract.status,
        document_url: contract.document_url,
        sites_name: getSiteName(contract.sites)
    })) || [];

    // Get unique statuses from actual data
    const availableStatuses = [...new Set(contracts?.map(c => c.status).filter(Boolean) || [])];

    // Apply filtering
    const filteredContracts = transformedContracts.filter(contract => {
        // Text search filter
        let textMatch = true;
        if (query) {
            const searchTerm = query.toLowerCase();
            const contractMatch = contract.contract_number?.toLowerCase().includes(searchTerm) || false;
            const siteMatch = contract.sites_name?.toLowerCase().includes(searchTerm) || false;
            const statusMatch = contract.status?.toLowerCase().includes(searchTerm) || false;
            
            textMatch = contractMatch || siteMatch || statusMatch;
        }
        
        // Status filter
        let statusMatch = true;
        if (selectedStatuses.length > 0) {
            statusMatch = contract.status ? selectedStatuses.includes(contract.status) : false;
        }
        
        return textMatch && statusMatch;
    });

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
        console.log('=== CONTRACTS DEBUG ===');
        console.log('Query:', query);
        console.log('Selected statuses:', selectedStatuses);
        console.log('Available statuses:', availableStatuses);
        console.log('Total contracts:', transformedContracts.length);
        console.log('Filtered contracts:', filteredContracts.length);
    }

    return (
        <div>
            {/* Header */}
            <div className="sm:flex sm:items-center mb-8">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-bold leading-6 text-gray-900">
                        Manajemen Kontrak
                    </h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Daftar semua kontrak sewa yang terdaftar dalam sistem.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    {canCreate && (
                        <Link
                            href="/dashboard/contracts/new"
                            className="inline-flex items-center gap-x-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                        >
                            <PlusCircle size={20} />
                            Tambah Kontrak Baru
                        </Link>
                    )}
                </div>
            </div>


            
          

<div className="flex justify-between">
  {/* Search and Filter Form */}
            <form method="GET" className="mb-6">
                <SearchAndFilter 
                    query={query}
                    selectedStatuses={selectedStatuses}
                    availableStatuses={availableStatuses}
                />
                <button
                    type="submit"
                    className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                    <Filter size={16} />
                    Apply Filters
                </button>
            </form>
                        <ExportButton
  data={contracts} // data array yang ingin di-export
  columns={contractColumns}
  filename="kontrak-data"
  title="Data Kontrak"
  sheetName="Kontrak"
/>
</div>




            {/* Results */}
            {filteredContracts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                        {(query || selectedStatuses.length > 0) ? 'Kontrak Tidak Ditemukan' : 'Belum ada Kontrak'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {(query || selectedStatuses.length > 0)
                            ? 'Tidak ada kontrak yang sesuai dengan filter yang dipilih.'
                            : 'Mulai dengan menambahkan data kontrak baru.'
                        }
                    </p>
                    {/* Debug info */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 p-4 bg-gray-100 rounded text-xs text-left max-w-md mx-auto">
                            <p><strong>Debug Info:</strong></p>
                            <p>Query: "{query}"</p>
                            <p>Status Filter: {selectedStatuses.join(', ') || 'None'}</p>
                            <p>Available Statuses: {availableStatuses.join(', ')}</p>
                            <p>Total contracts: {transformedContracts.length}</p>
                            <p>After filter: {filteredContracts.length}</p>
                        </div>
                    )}
                </div>
            ) : (
                <ContractsTable 
                    contracts={filteredContracts} 
                    canEdit={canEdit}
                    canDelete={canDelete}
                    canDownload={canDownload}
                />
            )}
        </div>
    );
}