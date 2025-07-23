import { createClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/auth-helper";
import { redirect } from "next/navigation";
import { MasterDataClient } from "./MasterDataClient"; 

async function getMasterData() {
    const supabase = createClient();
    const regionalsPromise = supabase.from('regionals').select('*').order('name');
    const witelsPromise = supabase.from('witels').select('*, regionals(name)').order('name');
    const stosPromise = supabase.from('stos').select('*, witels(name)').order('name');

    const [
        { data: regionals },
        { data: witels },
        { data: stos }
    ] = await Promise.all([regionalsPromise, witelsPromise, stosPromise]);

    return { 
        regionals: regionals || [],
        witels: witels || [],
        stos: stos || []
    };
}


export default async function MasterDataPage() {
    const userRole = await getCurrentUserRole();
    if (userRole !== 'SuperAdmin') {
        return redirect('/dashboard?error=unauthorized');
    }

    const { regionals, witels, stos } = await getMasterData();

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Manajemen Data Master Lokasi</h1>
            <p className="text-gray-600 mb-8">Kelola data Tipe Site, Regional, Witel, dan STO dari halaman ini.</p>
            
            <MasterDataClient 
                initialRegionals={regionals}
                initialWitels={witels}
                initialStos={stos} 
                initialSiteTypes={[]}            />
        </div>
    );
}