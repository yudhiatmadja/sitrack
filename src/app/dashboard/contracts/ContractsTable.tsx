// File: src/app/dashboard/contracts/ContractsTable.tsx
'use client'

import Link from 'next/link'
import { Trash2, Edit, FileDown, Eye, X, Check } from "lucide-react"
import { deleteContract, approveContract } from "./actions"
import type { Database } from '@/types/supabase'
import { toast } from 'sonner'
import { useState } from 'react'

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

// Komponen Modal Preview
function ContractPreviewModal({ 
    contract, 
    isOpen, 
    onClose,
    canApprove = false 
}: { 
    contract: ContractWithSite;
    isOpen: boolean;
    onClose: () => void;
    canApprove?: boolean;
}) {
    if (!isOpen) return null;

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
        });
    };

    const statusColor: { [key: string]: string } = {
        'Draft': 'bg-gray-100 text-gray-800',
        'Waiting Approval': 'bg-yellow-100 text-yellow-800',
        'Approved': 'bg-green-100 text-green-800',
        'Rejected': 'bg-red-100 text-red-800',
        'Expired': 'bg-purple-100 text-purple-800',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            ></div>
            
            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Preview Kontrak
                            </h2>
                            <p className="text-sm text-gray-500">
                                {contract.contract_number || 'No. Kontrak tidak tersedia'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
                        {/* Contract Details */}
                        <div className="lg:w-1/3 p-6 border-r bg-gray-50 overflow-y-auto">
                            <h3 className="font-medium text-gray-900 mb-4">Detail Kontrak</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Nomor Kontrak</label>
                                    <p className="text-sm text-gray-900 mt-1">
                                        {contract.contract_number || '-'}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Nama Site</label>
                                    <p className="text-sm text-gray-900 mt-1">
                                        {contract.sites_name || 'N/A'}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Tanggal Mulai</label>
                                    <p className="text-sm text-gray-900 mt-1">
                                        {formatDate(contract.start_date)}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Tanggal Berakhir</label>
                                    <p className="text-sm text-gray-900 mt-1">
                                        {formatDate(contract.end_date)}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    <div className="mt-1">
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusColor[contract.status || ''] || 'bg-gray-100 text-gray-800'}`}>
                                            {contract.status || '-'}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-4 space-y-2">
                                    {/* Button Approve - hanya tampil jika status Waiting Approval dan user punya akses */}
                                    {canApprove && contract.status === 'Waiting Approval' && (
                                        <button
                                            onClick={async () => {
                                                if (confirm('Apakah Anda yakin ingin menyetujui kontrak ini?')) {
                                                    try {
                                                        await approveContract(contract.id);
                                                        toast.success('Kontrak berhasil disetujui.');
                                                        onClose();
                                                    } catch (error: any) {
                                                        toast.error(`Gagal menyetujui kontrak: ${error.message}`);
                                                    }
                                                }
                                            }}
                                            className="w-full inline-flex items-center justify-center gap-x-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                                        >
                                            <Check size={16} />
                                            Setujui Kontrak
                                        </button>
                                    )}

                                   

                                    {contract.document_url && (
                                        <a
                                            href={contract.document_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="w-full inline-flex items-center justify-center gap-x-2 rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500"
                                        >
                                            <FileDown size={16} />
                                            Unduh Dokumen
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Document Preview */}
                        <div className="lg:w-2/3 p-6 overflow-y-auto">
                            <h3 className="font-medium text-gray-900 mb-4">Preview Dokumen</h3>
                            
                            {contract.document_url ? (
                                <div className="border rounded-lg overflow-hidden bg-white h-full min-h-[400px]">
                                    {contract.document_url.toLowerCase().endsWith('.pdf') ? (
                                        <iframe
                                            src={`${contract.document_url}#toolbar=1&navpanes=0&scrollbar=1`}
                                            className="w-full h-full min-h-[500px]"
                                            title={`Preview ${contract.contract_number}`}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-64 text-gray-500">
                                            <div className="text-center">
                                                <FileDown size={48} className="mx-auto mb-4 text-gray-400" />
                                                <p className="text-sm">
                                                    Preview tidak tersedia untuk jenis file ini.
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Silakan unduh untuk melihat dokumen.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                                    <div className="text-center">
                                        <FileDown size={48} className="mx-auto mb-4 text-gray-400" />
                                        <p className="text-sm">Dokumen kontrak tidak tersedia</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
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
    canApprove?: boolean;
}

export function ContractsTable({ contracts, canEdit = false, canDelete = false, canDownload = false, canApprove = false }: ContractsTableProps) {
    const [selectedContract, setSelectedContract] = useState<ContractWithSite | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleContractClick = (contract: ContractWithSite) => {
        setSelectedContract(contract);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedContract(null);
    };

    return (
        <>
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
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6">
                                                <button
                                                    onClick={() => handleContractClick(contract)}
                                                    className="text-blue-600 hover:text-blue-900 hover:underline text-left"
                                                    title="Klik untuk preview kontrak"
                                                >
                                                    {contract.contract_number}
                                                </button>
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

            {/* Modal Preview */}
            {selectedContract && (
                <ContractPreviewModal
                    contract={selectedContract}
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    canApprove={canApprove}
                />
            )}
        </>
    );
}