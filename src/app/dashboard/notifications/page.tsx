import { createClient } from "@/lib/supabase/server"
import { Bell, FileText, Plus, Edit, Trash2, Activity } from "lucide-react";
import Link from 'next/link';

// =================================================================
// TIPE DAN KOMPONEN HELPER
// =================================================================

// Tipe yang cocok dengan hasil RPC `get_user_feed`
type FeedItem = {
  id: string;
  type: 'notification' | 'log';
  message: string;
  link: string | null;
  created_at: string;
  is_read: boolean;
}

// Fungsi helper untuk waktu relatif
function timeAgo(date: string | null): string {
    if (!date) return 'beberapa saat lalu';
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds} detik lalu`;
    let interval = Math.floor(seconds / 60);
    if (interval < 60) return `${interval} menit lalu`;
    interval = Math.floor(seconds / 3600);
    if (interval < 24) return `${interval} jam lalu`;
    return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Komponen untuk me-render satu item di daftar
function FeedListItem({ item }: { item: FeedItem }) {
    let Icon = Bell;
    if (item.type === 'log') {
        if (item.message.includes('ditambahkan')) Icon = Plus;
        else if (item.message.includes('diperbarui')) Icon = Edit;
        else if (item.message.includes('dihapus')) Icon = Trash2;
        else Icon = Activity;
    }

    return (
        <li>
            <Link href={item.link || '#'} className={`block p-4 hover:bg-gray-50 ${!item.is_read ? 'bg-blue-50 hover:bg-blue-100' : ''}`}>
                <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${!item.is_read ? 'bg-blue-500' : 'bg-gray-400'}`}>
                        <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-800">{item.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{timeAgo(item.created_at)}</p>
                    </div>
                </div>
            </Link>
        </li>
    );
}

// =================================================================
// KOMPONEN UTAMA HALAMAN
// =================================================================
export default async function NotificationsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Seharusnya tidak akan terjadi karena ada middleware, tapi sebagai fallback
        return <p>Silakan login untuk melihat notifikasi.</p>;
    }
    
    // Panggil RPC function untuk mendapatkan feed gabungan
    // Kita set limit yang lebih tinggi, misal 50, atau implementasi paginasi nanti
    const { data: feedItems, error } = await supabase
        .rpc('get_user_feed', { p_user_id: user.id, p_limit: 50 });

    if (error) {
        return <p className="p-8 text-red-500">Gagal memuat feed: {error.message}</p>
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Aktivitas & Notifikasi</h1>
            <div className="bg-white rounded-lg shadow-md">
                <ul className="divide-y divide-gray-200">
                    {feedItems && feedItems.length > 0 ? (
                        (feedItems as FeedItem[]).map((item) => (
    <FeedListItem key={`${item.type}-${item.id}`} item={item} />
))

                    ) : (
                        <li className="p-6 text-center text-gray-500">
                            Anda belum memiliki aktivitas atau notifikasi.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}