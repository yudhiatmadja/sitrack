import React from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import {
  BarChart, Building, FileText, Landmark, Activity, Plus, Edit, Trash2
} from "lucide-react"

// =================================================================
// 1. SATU TIPE YANG BENAR UNTUK DATA LOG DARI RPC
// =================================================================
interface LogDetail {
  id: number;
  action: string;
  details: any;
  created_at: string | null;
  user_full_name: string | null;
}

// =================================================================
// 2. KOMPONEN-KOMPONEN HELPER 
// =================================================================
function StatCard({ title, value, icon, href }: { title: string, value: number, icon: React.ElementType, href: string }) {
  return (
    <Link href={href} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 group">
      <div className="flex items-center">
        <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg">
          {React.createElement(icon, { className: "h-6 w-6 text-white" })}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </Link>
  )
}

function QuickActionCard({ title, description, icon, href, color = "red" }: { title: string, description: string, icon: React.ElementType, href: string, color?: string }) {
    const colorClasses: { [key: string]: string } = {
        red: 'from-red-500 to-red-600',
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
    };
    const bgColor = colorClasses[color] || colorClasses.red;
    return (
        <Link href={href} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 group">
            <div className="flex items-start gap-4">
                <div className={`p-3 bg-gradient-to-r ${bgColor} rounded-lg shadow-lg`}>
                    {React.createElement(icon, { className: "h-6 w-6 text-white" })}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800">{title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{description}</p>
                </div>
            </div>
        </Link>
    )
}

function timeAgo(date: string | null): string {
  if (!date) return 'beberapa saat lalu';
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds} detik lalu`;
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " tahun lalu";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " bulan lalu";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " hari lalu";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " jam lalu";
  interval = seconds / 60;
  return Math.floor(interval) + " menit lalu";
}

function ActivityItem({ log }: { log: LogDetail }) {
  const actionParts = log.action.split('_');
  const actionType = actionParts[0] || 'UNKNOWN';
  const tableName = actionParts[1] || 'table';

  let Icon = Activity;
  let color = 'bg-gray-500';
  let message = `Aksi '${log.action}' dilakukan`;
  let description = `oleh ${log.user_full_name || 'Sistem'}`;

  try {
    switch (tableName) {
      case 'sites':
        if (actionType === 'INSERT') {
          Icon = Building;
          color = 'bg-blue-500';
          // Ambil nama site dari data JSON di kolom 'details'
          const siteName = log.details?.new_data?.name || 'baru';
          message = `Site ${siteName} berhasil ditambahkan`;
        }
        break;
      
      case 'contracts':
        if (actionType === 'INSERT') {
          Icon = FileText;
          color = 'bg-green-500';
          const contractNumber = log.details?.new_data?.contract_number || 'baru';
          message = `Kontrak ${contractNumber} berhasil dibuat`;
        } else if (actionType === 'UPDATE') {
          Icon = Edit;
          color = 'bg-yellow-500';
          const oldStatus = log.details?.old_data?.status;
          const newStatus = log.details?.new_data?.status;
          // Cek apakah ada perubahan status
          if (oldStatus !== newStatus) {
            message = `Status kontrak ${log.details?.new_data?.contract_number || ''} diubah menjadi ${newStatus}`;
          } else {
            message = `Kontrak ${log.details?.new_data?.contract_number || ''} diperbarui`;
          }
        }
        break;

      case 'land_owners':
        if (actionType === 'INSERT') {
          Icon = Plus; // Bisa diganti dengan ikon User
          color = 'bg-indigo-500';
          const ownerName = log.details?.new_data?.name || 'baru';
          message = `Pemilik lahan ${ownerName} berhasil ditambahkan`;
        }
        break;
        
      // Anda bisa menambahkan case lain untuk 'permits', 'users', dll.
      default:
        // Biarkan default untuk aksi yang belum di-handle
        message = `Aksi '${log.action}' dilakukan pada data`;
    }
  } catch (e) {
    console.error("Gagal mem-parsing detail log:", e);
    // Fallback jika JSON tidak bisa di-parse
    message = `Aksi log dengan ID ${log.id} tercatat`;
  }

   return (
    <div className="flex items-start gap-3">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{message}</p>
        <p className="text-xs text-gray-500">{description} - {timeAgo(log.created_at)}</p>
      </div>
    </div>
  )
}

export default async function DashboardHomePage() {
  const supabase = createClient()

  // Ambil semua data secara paralel
  const [
    siteCountRes,
    contractCountRes,
    logsRes
  ] = await Promise.all([
    supabase.from('sites').select('*', { count: 'exact', head: true }),
    supabase.from('contracts').select('*', { count: 'exact', head: true }),
    supabase.rpc('get_latest_logs', { log_limit: 5 })
  ]);
  
  // Ekstrak data
  const siteCount = siteCountRes.count ?? 0;
  const contractCount = contractCountRes.count ?? 0;
  const latestLogs = logsRes.data as LogDetail[] | null;

  if (logsRes.error) {
    console.error("Error fetching latest logs:", logsRes.error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b-4 border-red-500 mb-8">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Ringkasan</h1>
          <p className="text-gray-600">Sistem Informasi Tracking dan Monitoring</p>
        </div>
      </div>
      
      <div className="px-6 space-y-8">
        {/* Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Sites" value={siteCount} icon={Building} href="/dashboard/sites" />
          <StatCard title="Total Kontrak" value={contractCount} icon={FileText} href="/dashboard/contracts" />
          {/* Anda bisa menambahkan permitCount di sini jika mau */}
        </div>

        {/* Aksi Cepat */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickActionCard title="Tambah Site Baru" description="Daftarkan site baru" icon={Building} href="/dashboard/sites/new" color="red"/>
            <QuickActionCard title="Buat Kontrak" description="Buat kontrak sewa baru" icon={FileText} href="/dashboard/contracts/new" color="blue" />
          </div>
        </div>

        {/* Konten Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        

          {/* Aktivitas Terbaru */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-6 rounded-t-xl">
              <h2 className="text-xl font-semibold flex items-center gap-3"><Activity /> Aktivitas Terbaru</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {latestLogs && latestLogs.length > 0 ? (
          latestLogs.map((log) => <ActivityItem key={log.id} log={log} />)
        ) : (
          <p className="text-sm text-gray-500">Belum ada aktivitas terbaru.</p>
        )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-16"></div>
    </div>
  )
}