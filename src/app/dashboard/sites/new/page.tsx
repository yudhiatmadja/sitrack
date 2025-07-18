import { SiteForm } from '../SiteForm'
import { createSite } from '../actions'
import { createClient } from "@/lib/supabase/server"
import Link from 'next/link'
import { ArrowLeft } from "lucide-react"
import { redirect } from 'next/navigation'
import type { Database } from "@/types/supabase"
import { cookies } from 'next/headers'

async function getCurrentUserRole(): Promise<Database['public']['Enums']['role_name'] | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase.from('users').select('roles(name)').eq('id', user.id).single<{ roles: { name: Database['public']['Enums']['role_name'] } | null }>();
    return profile?.roles?.name ?? null;
}

export default async function NewSitePage() {
   const userRole = await getCurrentUserRole();

   if (userRole !== 'Asset' && userRole !== 'SuperAdmin') {
        // Redirect ke halaman sites dengan pesan error
        return redirect('/dashboard/sites?error=unauthorized');
    }
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold mb-6">Tambah Site Baru</h1>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <SiteForm action={createSite} />
        </div>
      </div>
    </div>
  )
}