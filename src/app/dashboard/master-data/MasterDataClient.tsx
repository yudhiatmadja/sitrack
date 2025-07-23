"use client";

import { useState, useEffect } from "react";
import createClient from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { Database } from "@/types/supabase";

// Definisikan tipe data yang diterima
type Regional = Database["public"]["Tables"]["regionals"]["Row"];
type Witel = { id: number; name: string; regionals: { name: string } | null };
type Sto = { id: number; name: string; witels: { name: string } | null };
type SiteType = Database['public']['Tables']['site_types']['Row'];

interface Props {
  initialRegionals: Regional[];
  initialWitels: Witel[];
  initialStos: Sto[];
  initialSiteTypes: SiteType[];
}

// Mapping untuk label yang user-friendly
const tabLabels = {
  regionals: "Regional",
  witels: "Witel", 
  stos: "STO",
  site_types: "Tipe Site"
};

export function MasterDataClient({
  initialRegionals,
  initialWitels,
  initialStos,
  initialSiteTypes
}: Props) {
  type TabType = "regionals" | "witels" | "stos" | "site_types";
  const [activeTab, setActiveTab] = useState<TabType>("regionals");

  // State untuk data (akan di-update setelah insert)
  const [regionals, setRegionals] = useState(initialRegionals);
  const [witels, setWitels] = useState(initialWitels);
  const [stos, setStos] = useState(initialStos);
  const [siteTypes, setSiteTypes] = useState(initialSiteTypes);
  const [isLoading, setIsLoading] = useState(false);

  // State untuk input form
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState('');
  const [parentId, setParentId] = useState(""); // Untuk Witel -> Regional, STO -> Witel
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  // Tambahkan function untuk fetch data terbaru dari database
  const fetchLatestData = async () => {
    setIsLoading(true);
    try {
      const [regionalsRes, witelsRes, stosRes, siteTypesRes] = await Promise.all([
        supabase.from('regionals').select('*').order('name'),
        supabase.from('witels').select('*, regionals(name)').order('name'),
        supabase.from('stos').select('*, witels(name)').order('name'),
        supabase.from('site_types').select('*').order('name')
      ]);

      if (regionalsRes.data) setRegionals(regionalsRes.data);
      if (witelsRes.data) setWitels(witelsRes.data as Witel[]);
      if (stosRes.data) setStos(stosRes.data as Sto[]);
      if (siteTypesRes.data) setSiteTypes(siteTypesRes.data);
    } catch (error) {
      console.error('Error fetching latest data:', error);
      toast.error('Gagal memuat data terbaru');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data terbaru saat component mount (untuk handle refresh)
  useEffect(() => {
    fetchLatestData();
  }, []);

  // Setup real-time subscriptions
  useEffect(() => {
    const regionsChannel = supabase
      .channel('regionals_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'regionals' },
        () => {
          // Re-fetch regionals data
          supabase.from('regionals').select('*').order('name')
            .then(({ data }) => data && setRegionals(data));
        }
      )
      .subscribe();

    const witelsChannel = supabase
      .channel('witels_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'witels' },
        () => {
          // Re-fetch witels data
          supabase.from('witels').select('*, regionals(name)').order('name')
            .then(({ data }) => data && setWitels(data as Witel[]));
        }
      )
      .subscribe();

    const stosChannel = supabase
      .channel('stos_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stos' },
        () => {
          // Re-fetch stos data
          supabase.from('stos').select('*, witels(name)').order('name')
            .then(({ data }) => data && setStos(data as Sto[]));
        }
      )
      .subscribe();

    const siteTypesChannel = supabase
      .channel('site_types_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_types' },
        () => {
          // Re-fetch site_types data
          supabase.from('site_types').select('*').order('name')
            .then(({ data }) => data && setSiteTypes(data));
        }
      )
      .subscribe();

    return () => {
      regionsChannel.unsubscribe();
      witelsChannel.unsubscribe();
      stosChannel.unsubscribe();
      siteTypesChannel.unsubscribe();
    };
  }, [supabase]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) {
        toast.error("Nama tidak boleh kosong.");
        return;
    }
    setIsSubmitting(true);

    const supabase = createClient();
    let errorMessage: string | null = null;

    // Logika untuk setiap tab
    if (activeTab === 'regionals') {
        const { data: newRegional, error } = await supabase.from('regionals')
            .insert({ name: newName }).select().single();
        if (error) errorMessage = error.message;

    } else if (activeTab === 'witels') {
        if (!parentId) { 
          toast.error("Regional harus dipilih."); 
          setIsSubmitting(false); 
          return; 
        }
        const { data: newWitel, error } = await supabase.from('witels')
            .insert({ name: newName, regional_id: Number(parentId) })
            .select('*, regionals(name)').single();
        if (error) errorMessage = error.message;
        
    } else if (activeTab === 'stos') {
        if (!parentId) { 
          toast.error("Witel harus dipilih."); 
          setIsSubmitting(false); 
          return; 
        }
        const { data: newSto, error } = await supabase.from('stos')
            .insert({ name: newName, witel_id: Number(parentId) })
            .select('*, witels(name)').single();
        if (error) errorMessage = error.message;

    } else if (activeTab === 'site_types') {
        const { data: newSiteType, error } = await supabase.from('site_types')
            .insert({ name: newName, description: newDescription })
            .select().single();
        if (error) errorMessage = error.message;
    }

    // Tampilkan notifikasi berdasarkan hasil
    if (errorMessage) {
        toast.error(`Gagal menambahkan: ${errorMessage}`);
    } else {
        toast.success(`Data ${tabLabels[activeTab]} baru berhasil ditambahkan!`);
        
        // Fetch ulang data terbaru dari database
        await fetchLatestData();
        
        // Reset form
        setNewName('');
        setNewDescription('');
        setParentId('');
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Kolom Kiri: Form Tambah */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
          <h3 className="text-lg font-semibold mb-4">Tambah Data Baru</h3>
          <form onSubmit={handleAddItem} className="space-y-4">
            {activeTab === "witels" && (
              <div>
                <label className="label-style">Pilih Regional</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  required
                  className="input-style"
                >
                  <option value="">-- Induk Regional --</option>
                  {regionals.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {activeTab === "stos" && (
              <div>
                <label className="label-style">Pilih Witel</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  required
                  className="input-style"
                >
                  <option value="">-- Induk Witel --</option>
                  {witels.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="label-style">Nama Baru</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="input-style"
                placeholder={`Nama ${tabLabels[activeTab]} baru...`}
              />
            </div>
            {activeTab === 'site_types' && (
              <div>
                <label htmlFor="description" className="label-style">Deskripsi (Opsional)</label>
                <textarea
                  id="description"
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  rows={3}
                  className="input-style"
                  placeholder="Deskripsi singkat tentang tipe site..."
                />
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-x-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
              >
                {isSubmitting ? "Menyimpan..." : `Tambah ${tabLabels[activeTab]}`}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Kolom Kanan: Tabel Data */}
      <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("regionals")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "regionals"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Regional
            </button>
            <button
              onClick={() => setActiveTab("witels")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "witels"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Witel
            </button>
            <button
              onClick={() => setActiveTab("stos")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "stos"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              STO
            </button>
            <button
              onClick={() => setActiveTab("site_types")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "site_types"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Tipe Site
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === "regionals" && (
            <div>
              {regionals.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Belum ada data regional</p>
              ) : (
                <ul className="divide-y">
                  {regionals.map((r) => (
                    <li key={r.id} className="py-2">
                      {r.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {activeTab === "witels" && (
            <div>
              {witels.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Belum ada data witel</p>
              ) : (
                <ul className="divide-y">
                  {witels.map((w) => (
                    <li key={w.id} className="py-2">
                      {w.name}{" "}
                      <span className="text-xs text-gray-500">
                        ({w.regionals?.name})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {activeTab === "stos" && (
            <div>
              {stos.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Belum ada data STO</p>
              ) : (
                <ul className="divide-y">
                  {stos.map((s) => (
                    <li key={s.id} className="py-2">
                      {s.name}{" "}
                      <span className="text-xs text-gray-500">
                        ({s.witels?.name})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {activeTab === "site_types" && (
            <div>
              {siteTypes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Belum ada data tipe site</p>
              ) : (
                <ul className="divide-y">
                  {siteTypes.map((st) => (
                    <li key={st.id} className="py-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{st.name}</span>
                        {st.description && (
                          <span className="text-sm text-gray-600 mt-1">{st.description}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}