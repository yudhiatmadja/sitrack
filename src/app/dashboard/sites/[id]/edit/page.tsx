import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { SiteForm } from '../../SiteForm'
import { updateSite } from '../../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Edit Site',
}

export default async function EditSitePage({ params }: { params: { id: string } }) {
  const { id } = params
  const cookieStore = cookies()
  const supabase = createClient()
  
  const { data: site } = await supabase
    .from('sites')
    .select('*')
    .eq('id', id)
    .single()

  if (!site) {
    notFound()
  }

  // Bind 'id' ke server action, sehingga kita tidak perlu hidden input
  const updateSiteWithId = updateSite.bind(null, id)

  return (
    <div>
        <div className="flex items-center gap-4 mb-6">
            <Link href={`/dashboard/sites/${id}`} className="p-2 rounded-md hover:bg-gray-200">
                <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Edit Site: {site.name}</h1>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
            <SiteForm site={site} action={updateSiteWithId} />
        </div>
    </div>
  )
}