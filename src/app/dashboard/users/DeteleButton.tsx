'use client';

import { Trash2, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';
import { deleteUser, softDeleteUser } from './actions';

interface DeleteButtonProps {
  userId: string;
  currentUserId?: string;
  userEmail?: string;
  userName?: string;
  useSoftDelete?: boolean;
}

export function DeleteButton({
  userId,
  currentUserId,
  userEmail,
  userName,
  useSoftDelete = false,
}: DeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const isSelfDelete = currentUserId === userId;

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showConfirmDialog) {
        setShowConfirmDialog(false);
      }
    };

    if (showConfirmDialog) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [showConfirmDialog]);

  const handleDelete = () => {
    if (isSelfDelete) {
      toast.error('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    setShowConfirmDialog(false);

    startTransition(async () => {
      try {
        if (useSoftDelete) {
          await softDeleteUser(userId);
          toast.success('Pengguna berhasil dinonaktifkan.');
        } else {
          await deleteUser(userId);
          toast.success('Pengguna berhasil dihapus dari sistem.');
        }
        router.refresh();
      } catch (error: any) {
        console.error('Delete error:', error);
        toast.error(`Gagal menghapus pengguna: ${error.message}`);
      }
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isPending) {
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDelete}
        disabled={isPending || isSelfDelete}
        className={`p-1 rounded-md transition-all duration-200 ${
          isSelfDelete
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
        } disabled:opacity-50`}
        title={isSelfDelete ? 'Tidak dapat menghapus akun sendiri' : 'Hapus Pengguna'}
      >
        {isPending ? (
          <div className="animate-spin h-4 w-4 border-2 rounded-full border-t-transparent border-red-500"></div>
        ) : (
          <Trash2 size={18} />
        )}
      </button>

      {showConfirmDialog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={handleBackdropClick}
        >
          <div className="w-full max-w-md transform rounded-2xl bg-white shadow-2xl transition-all animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setShowConfirmDialog(false)}
              disabled={isPending}
              className="absolute right-4 top-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start space-x-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full flex-shrink-0 ${
                  useSoftDelete ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <AlertTriangle className={`h-6 w-6 ${
                    useSoftDelete ? 'text-yellow-600' : 'text-red-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {useSoftDelete ? 'Nonaktifkan Pengguna' : 'Hapus Pengguna'}
                  </h3>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{userName || 'Nama tidak tersedia'}</p>
                    <p className="text-gray-500">{userEmail}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  {useSoftDelete
                    ? 'Pengguna akan dinonaktifkan dan tidak dapat mengakses sistem. Data tetap tersimpan dan dapat dikembalikan nanti.'
                    : 'Aksi ini tidak dapat dibatalkan dan akan menghapus semua data pengguna secara permanen dari sistem.'}
                </p>

                {!useSoftDelete && (
                  <div className="rounded-lg border-l-4 border-red-400 bg-red-50 p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-red-800 mb-2">
                          Data yang akan dihapus permanen:
                        </h4>
                        <ul className="space-y-1 text-sm text-red-700">
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></div>
                            Akun autentikasi dan kredensial
                          </li>
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></div>
                            Profil dan informasi personal
                          </li>
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></div>
                            Semua aktivitas dan riwayat
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={isPending}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isPending}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    useSoftDelete
                      ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 hover:shadow-lg hover:shadow-yellow-500/25'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500 hover:shadow-lg hover:shadow-red-500/25'
                  }`}
                >
                  {isPending ? (
                    <div className="flex items-center justify-center">
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      {useSoftDelete ? 'Menonaktifkan...' : 'Menghapus...'}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <AlertTriangle size={16} className="mr-2" />
                      {useSoftDelete ? 'Nonaktifkan' : 'Hapus Sekarang'}
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}