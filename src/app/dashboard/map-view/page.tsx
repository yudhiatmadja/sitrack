// File: src/app/dashboard/map-view/page.tsx
import { createClient } from "@/lib/supabase/server"
import { getCurrentUserRole } from "@/lib/auth-helper"  
import { redirect } from "next/navigation"
import { MapViewClient } from "./MapViewClient"
import type { Database } from "@/types/supabase"
import { MapLoader } from "./MapLoader"

// Definisikan tipe Site dengan koordinat yang kita butuhkan
export type SiteForMap = {
  id: string;
  name: string;
  site_id: string | null;
  site_type: Database['public']['Enums']['site_type_enum'];
  coordinates: string; // Kita akan pastikan ini tidak null
}

async function getSitesWithCoordinates(): Promise<SiteForMap[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('sites')
        .select('id, name, site_type, coordinates')
        .not('coordinates', 'is', null)
        .neq('coordinates', '');

    if (error) {
        console.error("Error fetching sites for map:", error);
        return [];
    }

    return data.map(d => ({ ...d, site_id: d.id })) as SiteForMap[];
}

export default async function MapViewPage() {
    const userRole = await getCurrentUserRole();
    const allowedRoles: (typeof userRole)[] = ['Optima', 'Asset', 'SuperAdmin'];

    if (!userRole || !allowedRoles.includes(userRole)) {
        return redirect('/dashboard?error=unauthorized');
    }

    const sites = await getSitesWithCoordinates();

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Tampilan Peta Site</h1>
                <p className="text-gray-600">Visualisasi lokasi semua site yang terdaftar.</p>
            </div>
            <div className="h-[75vh] w-full rounded-lg shadow-lg overflow-hidden border">
                {/* Render komponen loader, bukan komponen peta secara langsung */}
                <MapLoader sites={sites} />
            </div>
        </div>
    );
}