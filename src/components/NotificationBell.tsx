'use client'

import { useState, useEffect, useRef } from 'react'
import createClient from '@/lib/supabase/client'
import { Bell, Plus, Edit, Trash2, Activity } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

type Notification = {
  id: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

type FeedItem = {
  id: string;
  type: 'notification' | 'log';
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

function timeAgo(date: string | null): string {
  if (!date) return '';
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 3600;
  if (interval > 24) return new Date(date).toLocaleDateString('id-ID');
  if (interval > 1) return Math.floor(interval) + " jam lalu";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " menit lalu";
  return "Baru saja";
}

function FeedItemDisplay({ item }: { item: FeedItem }) {
    let Icon = Bell;
    if (item.type === 'log') {
        if (item.message.includes('ditambahkan')) Icon = Plus;
        else if (item.message.includes('diperbarui')) Icon = Edit;
        else if (item.message.includes('dihapus')) Icon = Trash2;
        else Icon = Activity;
    }
return (
        <Link href={item.link || '#'} className={`block p-3 hover:bg-gray-50 border-b ${!item.is_read ? 'bg-blue-50' : ''}`}>
            <div className="flex items-start gap-3">
                <Icon className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                    <p className="text-sm text-gray-800">{item.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{timeAgo(item.created_at)}</p>
                </div>
            </div>
        </Link>
    );
}

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    // Ambil notifikasi awal saat komponen dimuat
    const fetchInitialNotifications = async () => {
      const { data, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_read', false); // Hanya hitung yang belum dibaca

      const { data: allNotifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10); // Ambil 10 notifikasi terbaru untuk ditampilkan
      
      if (allNotifications) setNotifications(allNotifications);
      setUnreadCount(count ?? 0);
    };

    fetchInitialNotifications();

    const fetchInitialFeed = async () => {
      // Panggil RPC untuk mendapatkan feed gabungan
      const { data: initialFeed } = await supabase
        .rpc('get_user_feed', { p_user_id: userId, p_limit: 10 });

      if (initialFeed) {
        setFeedItems(initialFeed);
      }
      
      // Hitung notifikasi yang belum dibaca secara terpisah
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      
      setUnreadCount(count ?? 0);
    };

    fetchInitialFeed();

   const channel = supabase.channel(`notifications:${userId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, 
        (payload) => {
          const newNotification = payload.new as FeedItem;
          toast.info(newNotification.message);
          // Tambahkan notifikasi baru ke atas feed
          setFeedItems(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  // Efek untuk menutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);


  const handleBellClick = async () => {
    setIsOpen(!isOpen);
    if (unreadCount > 0) {
      setUnreadCount(0);
      // Update UI untuk notifikasi yang sudah dibaca
      setFeedItems(prev => prev.map(item => item.type === 'notification' ? { ...item, is_read: true } : item));
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
    }
  };
  

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={handleBellClick} className="relative p-2 rounded-full hover:bg-gray-100">
        <Bell className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600 ring-2 ring-white"></span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
          <div className="p-3 font-semibold border-b">Notifikasi</div>
          <div className="max-h-96 overflow-y-auto">
            {feedItems.length > 0 ? (
              feedItems.map(item => <FeedItemDisplay key={`${item.type}-${item.id}`} item={item} />)
            ) : (
              <p className="p-4 text-sm text-gray-500 text-center">Tidak ada aktivitas.</p>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notif => (
                <Link key={notif.id} href={notif.link || '#'} className="block p-3 hover:bg-gray-50 border-b">
                  <p className="text-sm text-gray-800">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{timeAgo(notif.created_at)}</p>
                </Link>
              ))
            ) : (
              <p className="p-4 text-sm text-gray-500 text-center">Tidak ada notifikasi.</p>
            )}
          </div>
          <div className="p-2 text-center border-t">
            <Link href="/dashboard/notifications" className="text-sm text-blue-600 hover:underline">
                Lihat semua notifikasi
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}