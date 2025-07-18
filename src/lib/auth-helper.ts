import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import { cookies } from "next/headers";

type ProfileWithRole = {
  roles: { name: Database['public']['Enums']['role_name'] } | null
}

export async function getCurrentUserRole(): Promise<Database['public']['Enums']['role_name'] | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from('users')
        .select('roles(name)')
        .eq('id', user.id)
        .single<ProfileWithRole>();
    
    return profile?.roles?.name ?? null;
}