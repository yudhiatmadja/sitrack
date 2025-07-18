'use client';

import { useRef, useState } from 'react';
import { type ContractData } from './page';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import createClient from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Props {
  data: ContractData;
  onBack: () => void;
  contractId?: string;
}

export function ContractPreview({ data, onBack, contractId }: Props) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDownloadPdf = async () => {
    const input = previewRef.current;
    if (!input) return;

    try {
      setIsUploading(true);
      
      // Generate PDF
      const canvas = await html2canvas(input, { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / pdfWidth;
      const calculatedHeight = canvasHeight / ratio;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, calculatedHeight);
      
      // Convert PDF to Blob
      const pdfBlob = pdf.output('blob');
      
      // Download PDF untuk user
      pdf.save(`Kontrak-Sewa-${data.siteName}-${data.contractNumber}.pdf`);
      
      // Upload PDF ke Supabase Storage jika contractId tersedia
      if (contractId) {
        await uploadPdfToStorage(pdfBlob, contractId);
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Gagal generate PDF');
    } finally {
      setIsUploading(false);
    }
  };

  const uploadPdfToStorage = async (pdfBlob: Blob, contractId: string) => {
    const supabase = createClient();
    
    try {
      // Create File object from Blob
      const fileName = `${data.contractNumber}-${Date.now()}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
      // Upload to Supabase Storage
      const filePath = `public/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('contracts')
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error('Gagal mendapatkan URL publik');
      }

      // Update contract record dengan document_url
      const { error: updateError } = await supabase
        .from('contracts')
        .update({ 
          document_url: urlData.publicUrl,
          status: 'Waiting Approval' // Update status setelah PDF disimpan
        })
        .eq('id', contractId);

      if (updateError) {
        throw updateError;
      }

      toast.success('PDF berhasil disimpan ke database!');
      
    } catch (error: any) {
      let errorMessage = 'Terjadi kesalahan yang tidak diketahui.';

      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      console.error('Error uploading PDF:', errorMessage, error); 
      toast.error(`Gagal menyimpan PDF: ${errorMessage}`);
    }
  };

  const handleGenerateAndSave = async () => {
    if (!contractId) {
      toast.error('ID kontrak tidak ditemukan');
      return;
    }

    const input = previewRef.current;
    if (!input) return;

    try {
      setIsUploading(true);
      
      // Generate PDF
      const canvas = await html2canvas(input, { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / pdfWidth;
      const calculatedHeight = canvasHeight / ratio;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, calculatedHeight);
      
      // Convert PDF to Blob
      const pdfBlob = pdf.output('blob');
      
      // Upload PDF ke Supabase Storage
      await uploadPdfToStorage(pdfBlob, contractId);
      
    } catch (error: any) {
      let errorMessage = 'Gagal generate dan simpan PDF';
      if (error && error.message) {
        errorMessage += `: ${error.message}`;
      }
      console.error('PDF Save Error:', error);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  };

  // Format tanggal kontrak dari timestamp saat ini
  const formatContractDate = () => {
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    
    return `${dayName}, ${day} ${month} ${year}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Preview Kontrak</h2>
      </div>

      {/* Area yang akan di-print ke PDF */}
      <div ref={previewRef} className="p-8 border border-gray-300 bg-white text-black font-serif text-sm">
        <h2 className="text-center font-bold underline text-base mb-4">PERJANJIAN SEWA MENYEWA</h2>
        <p className="text-center mb-6">{data.contractNumber}</p>
        
        <p className="mb-4">
          Pada hari ini, {formatContractDate()}, kami yang bertanda tangan di bawah ini:
        </p>
        
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>
            <strong>{data.companySignatory}</strong>, dalam jabatannya sebagai {data.companyPosition}, selanjutnya disebut sebagai <strong>PIHAK PERTAMA (Penyewa)</strong>.
          </li>
          <li>
            <strong>{data.landOwnerName}</strong>, pemegang KTP nomor {data.landOwnerIdCard}, beralamat di {data.landOwnerAddress}, selanjutnya disebut sebagai <strong>PIHAK KEDUA (Pemilik Lahan)</strong>.
          </li>
        </ol>

        <p className="mb-4">
          PIHAK PERTAMA dengan ini setuju untuk menyewa dari PIHAK KEDUA sebidang tanah yang terletak di {data.siteAddress} untuk keperluan pembangunan perangkat telekomunikasi.
        </p>

        <p className="font-bold text-center my-4">Pasal 1: Jangka Waktu</p>
        <p className="mb-4">
          Perjanjian sewa menyewa ini berlaku untuk jangka waktu 5 (lima) tahun, terhitung sejak tanggal <strong>{formatDate(data.startDate)}</strong> sampai dengan tanggal <strong>{formatDate(data.endDate)}</strong>.
        </p>
        
        <p className="font-bold text-center my-4">Pasal 2: Harga Sewa</p>
        <p className="mb-4">
          Harga sewa yang disepakati oleh kedua belah pihak untuk seluruh jangka waktu sewa adalah sebesar <strong>Rp {data.rentalPrice.toLocaleString('id-ID')},- ({data.rentalPriceInWords})</strong>.
        </p>

        <p className="font-bold text-center my-4">Pasal 3: Kewajiban dan Hak</p>
        <p className="mb-3 font-bold">PIHAK PERTAMA berkewajiban:</p>
        <ul className="list-disc list-inside space-y-1 mb-4 ml-4">
          <li>Membayar biaya sewa sesuai dengan yang telah disepakati</li>
          <li>Menjaga dan merawat tanah yang disewa</li>
          <li>Tidak menggunakan tanah untuk keperluan lain selain yang telah disepakati</li>
        </ul>

        <p className="mb-3 font-bold">PIHAK KEDUA berkewajiban:</p>
        <ul className="list-disc list-inside space-y-1 mb-6 ml-4">
          <li>Menyediakan tanah dalam kondisi siap pakai</li>
          <li>Tidak mengganggu kegiatan PIHAK PERTAMA di atas tanah tersebut</li>
          <li>Memberikan akses yang memadai untuk kegiatan telekomunikasi</li>
        </ul>

        <p className="font-bold text-center my-4">Pasal 4: Ketentuan Penutup</p>
        <p className="mb-8">
          Perjanjian ini dibuat dalam rangkap dua, masing-masing bermeterai cukup dan mempunyai kekuatan hukum yang sama. 
          Apabila terjadi perselisihan, akan diselesaikan secara musyawarah untuk mufakat.
        </p>

        {/* Area Tanda Tangan Kosong untuk TTD Basah */}
        <div className="mt-16 grid grid-cols-2 gap-8 text-center">
          <div>
            <p>PIHAK PERTAMA,</p>
            <div className="h-24 flex items-center justify-center my-4">
              <div className="h-20 border-b border-gray-400 w-48 flex items-end justify-center">
                {/* <span className="text-gray-400 text-xs mb-1">Tanda Tangan</span> */}
              </div>
            </div>
            <p className="font-bold underline">{data.companySignatory}</p>
            <p>{data.companyPosition}</p>
          </div>
          
          <div>
            <p>PIHAK KEDUA,</p>
            <div className="h-24 flex items-center justify-center my-4">
              <div className="h-20 border-b border-gray-400 w-48 flex items-end justify-center">
                {/* <span className="text-gray-400 text-xs mb-1">Tanda Tangan</span> */}
              </div>
            </div>
            <p className="font-bold underline">{data.landOwnerName}</p>
            <p>Pemilik Lahan</p>
          </div>
        </div>
      </div>
      
      {/* Info untuk TTD Basah */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          <strong>Info:</strong> Dokumen ini siap untuk dicetak dan ditandatangani secara basah oleh kedua belah pihak.
        </p>
      </div>
      
      {/* Tombol Aksi */}
      <div className="mt-8 flex justify-between">
        <button 
          onClick={onBack} 
          className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
          disabled={isUploading}
        >
          ← Kembali
        </button>
        
        <div className="flex gap-2">
          <button 
            onClick={handleDownloadPdf} 
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center gap-2"
            disabled={isUploading}
          >
            {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
            Download PDF
          </button>
          
          {contractId && (
            <button 
              onClick={handleGenerateAndSave} 
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex items-center gap-2"
              disabled={isUploading}
            >
              {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan ke Database
            </button>
          )}
        </div>
      </div>
      
      <p className="text-xs text-center mt-4 text-gray-500">
        Dokumen ini sudah siap untuk didownload dan dicetak untuk tanda tangan basah.
      </p>
    </div>
  );
}