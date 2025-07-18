import { Loader2 } from 'lucide-react'

export default function Loading() {
  // UI ini akan ditampilkan secara otomatis saat data di dalam
  // segmen /dashboard sedang di-fetch dari server.
  return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
    </div>
  )
}