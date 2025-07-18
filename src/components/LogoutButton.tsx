'use client'

import  createClient  from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export function LogoutButton() {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-all duration-300 ease-in-out"
            title="Logout"
        >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
        </button>
    )
}