'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react' // Menggunakan ikon spinner dari lucide-react

// Definisikan props untuk kustomisasi
interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string; // Teks saat tombol tidak loading
  loadingText?: string; // Teks saat tombol sedang loading (opsional)
}

export function SubmitButton({ text, loadingText = "Menyimpan...", className, ...props }: SubmitButtonProps) {
  // Gunakan hook useFormStatus untuk mendapatkan status 'pending' dari form induk
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending} // Nonaktifkan tombol saat form sedang diproses
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        text
      )}
    </button>
  )
}