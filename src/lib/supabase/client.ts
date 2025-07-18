import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase' 

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;



// export function createClient() {
//   return createBrowserClient<Database>(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   )
// }

function getSupabaseBrowserClient() {
  // Jika client belum pernah dibuat, buat sekarang
  if (client === undefined) {
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  
  // Kembalikan instance yang sudah ada atau yang baru dibuat
  return client;
}

// Export fungsi get-nya
export default getSupabaseBrowserClient;