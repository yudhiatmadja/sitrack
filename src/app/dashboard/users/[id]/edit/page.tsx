import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from 'next/link'
import { ArrowLeft } from "lucide-react"
import { getCurrentUserRole } from "@/lib/auth-helper"
import type { Database } from "@/types/supabase"
import { EditUserRoleForm } from "./EditUserRoleForm"

// Types
type UserDetail = {
    id: string;
    full_name: string | null;
    email: string | null;
    role_name: string | null;
}
type Role = Database['public']['Tables']['roles']['Row'];

// Function to fetch user details and all roles
async function getData(userId: string) {
    const supabase = createClient();
    
    // Run queries in parallel for efficiency
    const [userResult, rolesResult] = await Promise.all([
        supabase.rpc('get_all_users_with_details').eq('id', userId).single<UserDetail>(),
        supabase.from('roles').select('*')
    ]);
    
    // Handle user fetch error
    if (userResult.error) {
        console.error("Error fetching user details:", userResult.error);
        notFound();
    }
    
    // Handle roles fetch error
    if (rolesResult.error) {
        console.error("Error fetching roles:", rolesResult.error);
        // You might want to throw an error or handle this differently
        // For now, we'll continue with empty roles array
    }
    
    return { 
        user: userResult.data, 
        roles: rolesResult.data || [] 
    };
}

export default async function EditUserPage({ params }: { params: { id: string } }) {
    // 1. Page Protection
    const loggedInUserRole = await getCurrentUserRole();
    if (loggedInUserRole !== 'SuperAdmin') {
        return redirect('/dashboard?error=unauthorized');
    }
    
    // 2. Get current user session for self-edit prevention
    const supabase = createClient();
    const { data: { session }} = await supabase.auth.getSession();
    
    // 3. Fetch data
    const { user, roles } = await getData(params.id);

    if (!user) {
        notFound();
    }

    // 4. Prevent SuperAdmin from editing their own role
    if (session?.user.id === user.id) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-600 font-semibold">Aksi tidak diizinkan.</p>
                <p className="text-gray-700 mt-2">
                    Anda tidak dapat mengedit peran akun Anda sendiri dari panel ini.
                </p>
                <Link href="/dashboard/users" className="mt-4 inline-block text-blue-600 hover:underline">
                    ← Kembali ke Manajemen Pengguna
                </Link>
            </div>
        )
    }

    return (
        <div>
            {/* Page Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard/users" className="p-2 rounded-md hover:bg-gray-200">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">
                    Edit Pengguna: {user.full_name}
                </h1>
            </div>

            {/* Form Container */}
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
                <div className="space-y-2 mb-6 border-b pb-4">
                    <p>
                        <span className="font-semibold text-gray-600">Email:</span> {user.email}
                    </p>
                    <p>
                        <span className="font-semibold text-gray-600">Peran Saat Ini:</span> 
                        <span className="font-bold ml-2">{user.role_name}</span>
                    </p>
                </div>
                
                <EditUserRoleForm user={user} roles={roles} />
            </div>
        </div>
    );
}