'use client'

import { useState, useEffect } from 'react';
import type { Database } from '@/types/supabase';
import { ContractInputForm } from './ContractInputForm';
import { ContractPreview } from './ContractPreview';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import createClient from '@/lib/supabase/client';

// Definisikan tipe untuk data yang akan digenerate
export type ContractData = {
  contractNumber: string;
  siteId: string; // Menyimpan ID, bukan hanya nama
  landOwnerId: string; // Menyimpan ID
  siteName: string;
  siteAddress: string | null;
  landOwnerName: string;
  landOwnerAddress: string | null;
  landOwnerIdCard: string | null;
  startDate: string;
  endDate: string;
  rentalPrice: number;
  rentalPriceInWords: string;
  companySignatory: string;
  companyPosition: string;
};

// Definisikan tipe untuk data yang di-fetch
type Site = Database['public']['Tables']['sites']['Row'];
type LandOwner = Database['public']['Tables']['land_owners']['Row'];

export default function NewContractPage() {
  const [step, setStep] = useState(1);
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [contractId, setContractId] = useState<string | null>(null);
  
  const [sites, setSites] = useState<Site[]>([]);
  const [landOwners, setLandOwners] = useState<LandOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data awal untuk dropdown
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      setIsLoading(true);
      const { data: sitesData, error: sitesError } = await supabase.from('sites').select('*');
      const { data: ownersData, error: ownersError } = await supabase.from('land_owners').select('*');

      if (sitesError || ownersError) {
        toast.error("Gagal memuat data site atau pemilik lahan.");
      } else {
        setSites(sitesData || []);
        setLandOwners(ownersData || []);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleFormSubmit = async (data: ContractData) => {
    // SIMPAN DRAF KE DATABASE DI SINI
    const supabase = createClient();
    const { data: insertedData, error } = await supabase
      .from('contracts')
      .insert({
        site_id: data.siteId,
        contract_number: data.contractNumber,
        start_date: data.startDate,
        end_date: data.endDate,
        rental_price: data.rentalPrice,
        status: 'Draft', // Set status awal sebagai Draft
      })
      .select('id') // Ambil ID yang baru saja di-insert
      .single();
    
    if (error) {
      toast.error(`Gagal menyimpan draf kontrak: ${error.message}`);
    } else {
      toast.success("Draf kontrak berhasil disimpan!");
      setContractData(data);
      setContractId(insertedData.id); // Simpan ID kontrak
      setStep(2); // Pindah langsung ke step preview
    }
  };

  const handleBackToForm = () => setStep(1);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="ml-4 text-gray-600">Memuat data...</p>
      </div>
    );
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Langkah 1: Isi Data Kontrak';
      case 2:
        return 'Langkah 2: Preview dan Generate Dokumen';
      default:
        return 'Buat Kontrak Baru';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {getStepTitle()}
      </h1>
      
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
              1
            </div>
            <span className="ml-2 hidden sm:inline">Input Data</span>
          </div>
          <div className={`w-8 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
              2
            </div>
            <span className="ml-2 hidden sm:inline">Preview</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md max-w-6xl mx-auto">
        {step === 1 && (
          <ContractInputForm
            sites={sites}
            landOwners={landOwners}
            onSubmit={handleFormSubmit}
          />
        )}
        
        {step === 2 && contractData && (
          <ContractPreview 
            data={contractData}
            onBack={handleBackToForm}
            contractId={contractId || undefined}
          />
        )}
      </div>
    </div>
  );
}