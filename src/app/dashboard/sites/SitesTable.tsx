'use client'

import Link from 'next/link'
import { Trash2, Edit } from 'lucide-react'
import { deleteSite } from './actions'
import type { Database } from '@/types/supabase'

type Site = Database['public']['Tables']['sites']['Row']
type RoleName = Database['public']['Enums']['role_name']

// Tombol Delete yang pakai bind(id)
function DeleteButton({ id }: { id: string }) {
  return (
    <form action={deleteSite}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="p-1 text-gray-500 hover:text-red-600" title="Hapus Site">
        <Trash2 size={18} />
      </button>
    </form>
  )
}

// Komponen utama tabel
export function SitesTable({
  sites,
  userRole,
}: {
  sites: Site[]
  userRole: RoleName | null
}) {
  const canEdit = userRole === 'Asset' || userRole === 'SuperAdmin'
  const canDelete = userRole === 'SuperAdmin'

  return (
    <div className="flow-root">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Nama
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Tipe
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Alamat
                  </th>
                  {(canEdit || canDelete) && (
                    <th className="py-3.5 pr-6 text-right text-sm font-semibold text-gray-900">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {sites.map((site) => (
                  <tr key={site.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {site.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {site.site_type}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {site.address}
                    </td>
                    {(canEdit || canDelete) && (
                      <td className="whitespace-nowrap py-4 pr-6 text-sm font-medium text-right">
                        <div className="flex items-center justify-end gap-x-4">
                          {canEdit && (
                            <Link
                              href={`/dashboard/sites/${site.id}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Site"
                            >
                              <Edit size={18} />
                            </Link>
                          )}
                          {canDelete && <DeleteButton id={site.id} />}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
