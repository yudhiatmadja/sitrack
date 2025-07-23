import { createClient } from "@/lib/supabase/server"
import { getCurrentUserRole } from "@/lib/auth-helper"
import { redirect } from "next/navigation"
import { MapLoader } from "./MapLoader"

// Definisikan SATU tipe yang jelas untuk data yang dibutuhkan oleh peta
export type SiteForMap = {
  id: string;
  name: string;
  site_id: string | null; // Kita akan buat manual dari 'id'
  site_type_name: string | null;
  coordinates: string;
}

// Fungsi untuk mengambil data site dari server
async function getSitesWithCoordinates(): Promise<SiteForMap[]> {
    const supabase = createClient();
    
    // Kita gunakan query yang mengembalikan site_types sebagai array
    const { data, error } = await supabase
        .from('sites')
        .select(`
            id,
            name,
            coordinates,
            site_types ( 
                name 
            )
        `)
        .not('coordinates', 'is', null)
        .neq('coordinates', '');

    if (error) {
        console.error("Server Error fetching sites for map:", error);
        return [];
    }
    
    if (!data) {
        return [];
    }
    
    // Transformasi data dengan aman
    const formattedData: SiteForMap[] = data.map(site => {
        // PERBAIKAN UTAMA ADA DI SINI:
        // 1. Cek apakah site.site_types adalah array dan tidak kosong
        // 2. Jika ya, ambil nama dari elemen pertama (site.site_types[0].name)
        // 3. Jika tidak, kembalikan null
        const siteTypeName = (site.site_types && Array.isArray(site.site_types) && site.site_types.length > 0)
            ? site.site_types[0].name
            : null;

        return {
            id: site.id,
            name: site.name || 'Site Tanpa Nama',
            site_id: site.id,
            site_type_name: siteTypeName, // Gunakan nama yang sudah diekstrak
            coordinates: site.coordinates || '',
        };
    });

    return formattedData;
}

export default async function MapViewPage() {
    // ... (sisa kode halaman ini tidak perlu diubah, sudah benar) ...
    const userRole = await getCurrentUserRole();
    const allowedRoles = ['Optima', 'Asset', 'SuperAdmin'];

    if (!userRole || !allowedRoles.includes(userRole)) {
        return redirect('/dashboard?error=unauthorized');
    }

    const sites = await getSitesWithCoordinates();

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Tampilan Peta Site</h1>
                <p className="text-gray-600">
                    Visualisasi lokasi semua site yang terdaftar. 
                    {sites.length > 0 && ` Menampilkan ${sites.length} site.`}
                </p>
            </div>
            <div className="h-[75vh] w-full rounded-lg shadow-lg overflow-hidden border">
                <MapLoader sites={sites} />
            </div>
        </div>
    );
}