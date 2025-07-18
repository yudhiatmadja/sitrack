// File: src/app/dashboard/contracts/ContractsTable.tsx
'use client'

import Link from 'next/link'
import { Trash2, Edit, FileDown } from "lucide-react"
import { deleteContract } from "./actions"
import type { Database } from '@/types/supabase'
import { toast } from 'sonner'

// Tipe untuk kontrak dengan relasi ke site
type ContractWithSite = {
    id: string;
    contract_number: string | null;
    start_date: string | null;
    end_date: string | null;
    status: Database['public']['Enums']['contract_status_enum'] | null;
    document_url: string | null;
    sites_name: string | null;
}

// Komponen tombol hapus
function DeleteButton({ id }: { id: string }) {
    const deleteContractWithId = async () => {
        if (confirm('Apakah Anda yakin ingin menghapus kontrak ini? Aksi ini tidak dapat dibatalkan.')) {
            try {
                await deleteContract(id);
                toast.success('Kontrak berhasil dihapus.');
            } catch (error: any) {
                toast.error(`Gagal menghapus kontrak: ${error.message}`);
            }
        }
    };

    return (
        <button
            type="button"
            onClick={deleteContractWithId}
            className="p-1 text-gray-500 hover:text-red-600"
            title="Hapus Kontrak"
        >
            <Trash2 size={18} />
        </button>
    );
}

interface ContractsTableProps {
    contracts: ContractWithSite[];
    canEdit?: boolean;
    canDelete?: boolean;
    canDownload?: boolean;
}

export function ContractsTable({ contracts, canEdit = false, canDelete = false, canDownload = false }: ContractsTableProps) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
        });
    }

    const statusColor: { [key: string]: string } = {
        'Draft': 'bg-gray-100 text-gray-800',
        'Waiting Approval': 'bg-yellow-100 text-yellow-800',
        'Approved': 'bg-green-100 text-green-800',
        'Rejected': 'bg-red-100 text-red-800',
        'Expired': 'bg-purple-100 text-purple-800',
    }

    return (
        <div className="flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">No. Kontrak</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nama Site</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Masa Berlaku</th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {contracts.map((contract) => (
                                    <tr key={contract.id}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-blue-600 hover:underline sm:pl-6">
                                            <Link href={`/dashboard/contracts/${contract.id}`}>{contract.contract_number}</Link>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {contract.sites_name ?? 'N/A'}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            {formatDate(contract.start_date)} - {formatDate(contract.end_date)}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusColor[contract.status || ''] || 'bg-gray-100 text-gray-800'}`}>
                                                {contract.status}
                                            </span>
                                        </td>
                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                            <div className="flex items-center justify-end gap-x-4">
                                                {/* Tombol Download hanya jika allowed dan ada file */}
                                                {canDownload && contract.document_url && (
                                                    <a
                                                        href={contract.document_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download
                                                        className="text-gray-500 hover:text-blue-600"
                                                        title="Unduh Dokumen"
                                                    >
                                                        <FileDown size={18} />
                                                    </a>
                                                )}
                                                {canEdit && (
                                                    <Link href={`/dashboard/contracts/${contract.id}/edit`} className="text-blue-600 hover:text-blue-900" title="Edit Kontrak">
                                                        <Edit size={18} />
                                                    </Link>
                                                )}
                                                {canDelete && (
                                                    <DeleteButton id={contract.id} />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
