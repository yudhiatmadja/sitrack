import { LandOwnerForm } from "../LandOwnerForm"
import { createLandOwner } from "../actions"
import Link from 'next/link'
import { ArrowLeft } from "lucide-react"

export default function NewLandOwnerPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/land-owners" className="p-2 rounded-md hover:bg-gray-200">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Tambah Data Pemilik Lahan</h1>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <LandOwnerForm action={createLandOwner} />
      </div>
    </div>
  )
}