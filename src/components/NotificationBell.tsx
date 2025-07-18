'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell } from 'lucide-react'
import { toast } from 'sonner'

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    // 1. Ambil notifikasi awal
    const fetchNotifications = async () => {
        const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if(data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        }
    }
    fetchNotifications();

    // 2. Dengarkan perubahan real-time
    const channel = supabase.channel('realtime-notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, 
        (payload) => {
          toast.info(payload.new.message); // Tampilkan toast
          setNotifications(prev => [payload.new, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, [supabase, userId]);

  return (
    <div className="relative">
      <Bell className="cursor-pointer" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
          {unreadCount}
        </span>
      )}
      {/* Di sini Anda bisa membuat dropdown untuk menampilkan daftar notifikasi */}
    </div>
  )
}