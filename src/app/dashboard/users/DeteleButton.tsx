'use client' // This marks it as a Client Component

import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { deleteUser } from './actions';

export function DeleteButton({ userId, currentUserId }: { userId: string, currentUserId: string | undefined }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    // Prevent self-delete
    if (currentUserId === userId) {
      toast.error("Anda tidak dapat menghapus akun Anda sendiri.");
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini? Aksi ini tidak dapat dibatalkan.')) {
      startTransition(async () => {
        try {
          // await deleteUser(userId);
          await deleteUser(userId); 
          toast.success('Pengguna berhasil dihapus.');
          // Refresh router to reload data without full page reload
          router.refresh(); 
        } catch (error: any) {
          toast.error(`Gagal menghapus pengguna: ${error.message}`);
        }
      });
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={isPending}
      className="p-1 text-gray-500 hover:text-red-600 disabled:opacity-50" 
      title="Hapus Pengguna"
    >
      {isPending ? (
        <div className="animate-spin h-4 w-4 border-2 rounded-full border-t-transparent"></div>
      ) : (
        <Trash2 size={18} />
      )}
    </button>
  );
}