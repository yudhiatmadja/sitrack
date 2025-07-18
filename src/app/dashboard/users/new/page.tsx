import { createClient } from "@/lib/supabase/server"
import { UserForm } from "../UserForm"
import Link from 'next/link'
import { ArrowLeft } from "lucide-react"
import { getCurrentUserRole } from "@/lib/auth-helper"
import { redirect } from "next/navigation"

// Fungsi untuk mengambil daftar peran dari DB
async function getRoles() {
  const supabase = createClient();
  const { data, error } = await supabase.from('roles').select('id, name').order('name');
  if (error) {
    console.error("Gagal mengambil data roles:", error);
    return [];
  }
  return data;
}

export default async function NewUserPage() {
  // Proteksi Halaman (tetap sama dan penting)
  const userRole = await getCurrentUserRole();
  if (userRole !== 'SuperAdmin') {
    return redirect('/dashboard?error=unauthorized');
  }
  
  const roles = await getRoles();

  return (
    <div>
      {/* Header Halaman - PERBAIKI JUDUL */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/users" className="p-2 rounded-md hover:bg-gray-200">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Tambah Pengguna Baru</h1>
      </div>

      {/* Kontainer Form */}
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        {/* PERBAIKI DESKRIPSI */}
        <p className="text-sm text-gray-600 mb-6">
          Isi form di bawah ini untuk membuat akun baru secara langsung. 
        </p>
        
        {/* Render Form (sudah benar) */}
        <UserForm roles={roles} />
      </div>
    </div>
  );
}