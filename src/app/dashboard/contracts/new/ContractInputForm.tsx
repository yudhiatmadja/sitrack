'use client';

import { useState } from 'react';
import { type ContractData } from './page';
import type { Database } from '@/types/supabase';

// Tipe props baru
type Site = Database['public']['Tables']['sites']['Row'];
type LandOwner = Database['public']['Tables']['land_owners']['Row'];

interface Props {
  sites: Site[];
  landOwners: LandOwner[];
  onSubmit: (data: ContractData) => void;
}

export function ContractInputForm({ sites, landOwners, onSubmit }: Props) {
  // State untuk menyimpan ID yang dipilih
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');
  const [contractNumber, setContractNumber] = useState('');

  // State untuk input lainnya
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  // PERBAIKAN: Gunakan string untuk price input, dan state terpisah untuk value
  const [priceInput, setPriceInput] = useState('');
  const [companySignatory, setCompanySignatory] = useState('');
  const [companyPosition, setCompanyPosition] = useState('');
  
  // Fungsi sederhana untuk mengubah angka menjadi terbilang (bisa diganti dengan library)
  const numberToWords = (num: number): string => {
    // Implementasi sederhana, untuk produksi gunakan library seperti 'terbilang'
    if (num > 0) return `${num.toLocaleString('id-ID')} Rupiah`;
    return 'Nol Rupiah';
  }

  // PERBAIKAN: Handler untuk price input
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Hanya izinkan angka dan kosong
    if (value === '' || /^\d+$/.test(value)) {
      setPriceInput(value);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // PERBAIKAN: Validasi price input
    const priceValue = priceInput === '' ? 0 : parseInt(priceInput, 10);
    
    if (!selectedSiteId || !selectedOwnerId || !dates.startDate || !dates.endDate || !companySignatory || !companyPosition) {
      alert("Harap lengkapi semua data yang diperlukan.");
      return;
    }

    // PERBAIKAN: Validasi harga
    if (priceValue <= 0) {
      alert("Harga sewa harus lebih besar dari 0.");
      return;
    }

    const selectedSite = sites.find(s => s.id === selectedSiteId);
    const selectedOwner = landOwners.find(o => o.id === selectedOwnerId);

    if (!selectedSite || !selectedOwner) {
      alert("Data site atau pemilik tidak ditemukan.");
      return;
    }

    // Siapkan data lengkap untuk dikirim langsung ke preview
    const fullData: ContractData = {
      siteId: selectedSite.id,
      contractNumber: contractNumber,
      landOwnerId: selectedOwner.id,
      siteName: selectedSite.name,
      siteAddress: selectedSite.address,
      landOwnerName: selectedOwner.name,
      landOwnerAddress: selectedOwner.address,
      landOwnerIdCard: selectedOwner.id_card_number,
      startDate: dates.startDate,
      endDate: dates.endDate,
      rentalPrice: priceValue, // PERBAIKAN: Gunakan priceValue
      rentalPriceInWords: numberToWords(priceValue),
      // Data penandatangan dari form input
      companySignatory: companySignatory, 
      companyPosition: companyPosition,
    };
    
    onSubmit(fullData);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Buat Kontrak Sewa Baru</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="contract_number" className="label-style">Nomor Kontrak</label>
          <input 
            type="text"
            id="contract_number"
            name="contract_number"
            value={contractNumber}
            onChange={(e) => setContractNumber(e.target.value)}
            required
            className="input-style font-mono"
            placeholder=""
          />
        </div>

        {/* Pilihan Site */}
        <div>
          <label className="label-style">Pilih Site</label>
          <select 
            value={selectedSiteId} 
            onChange={(e) => setSelectedSiteId(e.target.value)} 
            required 
            className="input-style"
          >
            <option value="" disabled>-- Pilih Lokasi Site --</option>
            {sites.map(site => (
              <option key={site.id} value={site.id}>
                {site.site_id} - {site.name}
              </option>
            ))}
          </select>
        </div>

        {/* Pilihan Pemilik Lahan */}
        <div>
          <label className="label-style">Pilih Pemilik Lahan</label>
          <select 
            value={selectedOwnerId} 
            onChange={(e) => setSelectedOwnerId(e.target.value)} 
            required 
            className="input-style"
          >
            <option value="" disabled>-- Pilih Pemilik Lahan --</option>
            {landOwners.map(owner => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </select>
        </div>

        <h3 className="text-lg font-semibold border-t pt-6">Data Penandatangan Perusahaan</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-style">Nama Penandatangan</label>
            <input 
              type="text" 
              value={companySignatory} 
              onChange={(e) => setCompanySignatory(e.target.value)} 
              required 
              className="input-style"
              placeholder="Contoh: Bagus Dwi Sandi Putra"
            />
          </div>
          <div>
            <label className="label-style">Jabatan</label>
            <input 
              type="text" 
              value={companyPosition} 
              onChange={(e) => setCompanyPosition(e.target.value)} 
              required 
              className="input-style"
              placeholder="Contoh: TIF"
            />
          </div>
        </div>

        <h3 className="text-lg font-semibold border-t pt-6">Periode & Harga Sewa</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-style">Tanggal Mulai</label>
            <input 
              type="date" 
              value={dates.startDate} 
              onChange={(e) => setDates(d => ({ ...d, startDate: e.target.value }))} 
              required 
              className="input-style" 
            />
          </div>
          <div>
            <label className="label-style">Tanggal Berakhir</label>
            <input 
              type="date" 
              value={dates.endDate} 
              onChange={(e) => setDates(d => ({ ...d, endDate: e.target.value }))} 
              required 
              className="input-style" 
            />
          </div>
        </div>

        {/* PERBAIKAN: Input harga yang diperbaiki */}
        <div>
          <label className="label-style">Harga Sewa (Rp)</label>
          <input 
            type="text" 
            value={priceInput}
            onChange={handlePriceChange}
            required 
            className="input-style"
            placeholder="Masukkan harga sewa"
            inputMode="numeric"
          />
          {/* PERBAIKAN: Tampilkan preview harga dalam format rupiah */}
          {priceInput && (
            <p className="text-sm text-gray-600 mt-1">
              Preview: Rp {parseInt(priceInput).toLocaleString('id-ID')}
            </p>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>Catatan:</strong> Setelah submit, Anda akan langsung melihat preview kontrak yang siap untuk dicetak dan ditandatangani secara basah.
          </p>
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium"
          >
            Buat Kontrak & Lihat Preview
          </button>
        </div>
      </form>
    </div>
  );
}