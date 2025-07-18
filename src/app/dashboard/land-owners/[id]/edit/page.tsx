import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { LandOwnerForm } from "../../LandOwnerForm" // Naik dua level
import { updateLandOwner } from "../../actions"     // Naik dua level
import Link from 'next/link'
import { ArrowLeft } from "lucide-react"

export const dynamic = 'force-dynamic'; // Penting untuk halaman dinamis

export default async function EditLandOwnerPage({ params }: { params: { id: string } }) {
  const { id } = params
  const supabase = createClient()
  
  // Ambil data spesifik untuk pemilik lahan ini
  const { data: owner } = await supabase
    .from('land_owners')
    .select('*')
    .eq('id', id)
    .single()

  if (!owner) {
    notFound()
  }

  // Gunakan .bind untuk meneruskan 'id' ke server action
  const updateActionWithId = updateLandOwner.bind(null, id)

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/land-owners" className="p-2 rounded-md hover:bg-gray-200">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Edit Data: {owner.name}</h1>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        {/* Render ulang form yang sama, tapi sekarang dengan data awal dan action 'update' */}
        <LandOwnerForm owner={owner} action={updateActionWithId} />
      </div>
    </div>
  )
}