'use client'

import { Search as SearchIcon } from 'lucide-react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce';

export function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Gunakan debounce untuk mencegah pemanggilan berlebihan saat pengguna mengetik
  const handleSearch = useDebouncedCallback((term: string) => {
    console.log(`Searching... ${term}`);
    
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    // Ganti URL tanpa me-refresh halaman, Next.js akan memicu re-render Server Component
    replace(`${pathname}?${params.toString()}`);
  }, 300); // Tunggu 300ms setelah pengguna berhenti mengetik

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Cari
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        // Set nilai default dari URL agar input tetap terisi saat navigasi
        defaultValue={searchParams.get('q')?.toString()}
      />
      <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}