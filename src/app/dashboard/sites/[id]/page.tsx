// File: app/dashboard/sites/[id]/page.tsx
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";

type Contract = {
  id: string;
  contract_number: string;
  start_date: string;
  end_date: string;
};

type Permit = {
  id: string;
  permit_type: string;
  issued_date: string;
  valid_until: string;
};


export default async function SiteDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createClient();

  const { data: site, error } = await supabase
    .from("sites")
    .select(`
      *,
      land_owners (
        id,
        name,
        address,
        phone_number
      ),
      contracts (
        id,
        contract_number,
        start_date,
        end_date
      ),
      permits (
        id,
        permit_type,
        issued_date,
        valid_until
      )
    `)
    .eq("id", params.id)
    .single();

  if (error || !site) {
    console.error("Fetch error:", error);
    notFound(); // 404 page
  }

  return (
    <div className="p-6 space-y-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Detail Site</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><dt className="font-medium text-gray-500">Nama Site</dt><dd>{site.name}</dd></div>
          <div><dt className="font-medium text-gray-500">Tipe Site</dt><dd>{site.site_type}</dd></div>
          <div><dt className="font-medium text-gray-500">Site ID</dt><dd>{site.site_id}</dd></div>
          <div><dt className="font-medium text-gray-500">Alamat</dt><dd>{site.address ?? '-'}</dd></div>
          <div className="col-span-2"><dt className="font-medium text-gray-500">Koordinat</dt><dd>{site.coordinates ?? '-'}</dd></div>
        </dl>
      </div>

      {/* Section: Pemilik Lahan */}
      {site.land_owners && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold border-b pb-2 mb-4">Pemilik Lahan</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><dt className="font-medium text-gray-500">Nama</dt><dd>{site.land_owners.name}</dd></div>
            <div><dt className="font-medium text-gray-500">No. Telepon</dt><dd>{site.land_owners.phone_number}</dd></div>
            <div className="col-span-2"><dt className="font-medium text-gray-500">Alamat</dt><dd>{site.land_owners.address}</dd></div>
          </dl>
        </div>
      )}

      {/* Section: Kontrak */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Kontrak</h3>
        {Array.isArray(site.contracts) && site.contracts.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">No. Kontrak</th>
                <th className="py-2">Mulai</th>
                <th className="py-2">Berakhir</th>
              </tr>
            </thead>
            <tbody>
              {(site.contracts as Contract[]).map((contract) => (
                <tr key={contract.id}>
                  <td className="py-2">{contract.contract_number}</td>
                  <td>{format(new Date(contract.start_date), 'dd MMM yyyy')}</td>
                  <td>{format(new Date(contract.end_date), 'dd MMM yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">Tidak ada data kontrak.</p>
        )}
      </div>

      {/* Section: Izin */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Perizinan</h3>
        {Array.isArray(site.permits) && site.permits.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Jenis Izin</th>
                <th className="py-2">Tanggal Terbit</th>
                <th className="py-2">Berlaku Sampai</th>
              </tr>
            </thead>
            <tbody>
              {(site.permits as Permit[]).map((permit) => (
                <tr key={permit.id}>
                  <td className="py-2">{permit.permit_type}</td>
                  <td>{format(new Date(permit.issued_date), 'dd MMM yyyy')}</td>
                  <td>{format(new Date(permit.valid_until), 'dd MMM yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">Tidak ada data perizinan.</p>
        )}
      </div>
    </div>
  );
}
