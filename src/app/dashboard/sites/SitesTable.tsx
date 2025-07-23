'use client'

import Link from 'next/link'
import { Trash2, Edit } from 'lucide-react'
import { deleteSite } from './actions'
import type { Database } from '@/types/supabase'

type Site = Database['public']['Tables']['sites']['Row'] & {
    regionals: { name: string } | null;
    witels: { name: string } | null;
    stos: { name: string } | null;
}

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
                    Nama Site
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Tipe
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Alamat
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Regional
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Witel
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    STO
                  </th>
                  {(canEdit || canDelete) && (
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Aksi</span>
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
                      {site.site_type_id}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {site.address}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {site.regionals?.name ?? '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {site.witels?.name ?? '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {site.stos?.name ?? '-'}
                    </td>
                    {(canEdit || canDelete) && (
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end gap-x-2">
                          {canEdit && (
                            <Link
                              href={`/dashboard/sites/${site.id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit Site"
                            >
                              <Edit size={16} />
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