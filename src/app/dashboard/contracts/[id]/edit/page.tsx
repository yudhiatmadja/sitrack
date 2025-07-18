import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { ContractForm } from "./ContractForm"
import { updateContract } from "../../actions"
import Link from 'next/link'
import { ArrowLeft } from "lucide-react"
import { getCurrentUserRole } from "@/lib/auth-helper"

export const dynamic = 'force-dynamic';

// Fungsi untuk mengambil data yang dibutuhkan oleh form
async function getDataForEdit(contractId: string) {
    const supabase = createClient();
    
    // Ambil detail kontrak dan daftar semua site secara bersamaan
    const contractPromise = supabase.from('contracts').select('*').eq('id', contractId).single();
    const sitesPromise = supabase.from('sites').select('id, name').order('name');

    const [{ data: contract, error: contractError }, { data: sites, error: sitesError }] = await Promise.all([contractPromise, sitesPromise]);

    if (contractError) {
        console.error("Error fetching contract details:", contractError);
        notFound();
    }
    if (sitesError) {
        console.error("Error fetching sites:", sitesError);
    }

    return { contract, sites: sites || [] };
}


export default async function EditContractPage({ params }: { params: { id: string } }) {
    const userRole = await getCurrentUserRole();
    // Proteksi halaman
    if (userRole !== 'Asset' && userRole !== 'SuperAdmin' && userRole !== 'Legal') {
        return redirect('/dashboard/contracts?error=unauthorized');
    }

    const { id } = params;
    const { contract, sites } = await getDataForEdit(id);

    // Bind 'id' kontrak ke server action update
    const updateActionWithId = updateContract.bind(null, id);

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard/contracts" className="p-2 rounded-md hover:bg-gray-200">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Edit Kontrak: {contract.contract_number}</h1>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <ContractForm
                    contract={contract}
                    sites={sites}
                    action={updateActionWithId}
                />
            </div>
        </div>
    );
}