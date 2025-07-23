import { type ProfileWithRole } from "@/app/dashboard/layout"
import { LogoutButton } from "./LogoutButton"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import Image from "next/image"
import { NotificationBell } from "./NotificationBell"

export function Header({ 
  userProfile, 
  onMenuToggle, 
  isSidebarOpen 
}: { 
  userProfile: ProfileWithRole
  onMenuToggle?: () => void
  isSidebarOpen?: boolean
}) {
  const initial = userProfile.full_name?.charAt(0).toUpperCase() || 'U';

  const pathname = usePathname()

function getCurrentPageName(path: string): string {
  if (path === "/dashboard" || path === "/dashboard/") {
    return "Home"
  }

  if (path.startsWith("/dashboard/master-data")) {
    return "Master Data"
  }

  const parts = path.split('/').filter(Boolean)
  const last = parts[parts.length - 1] || 'home'
  return last.charAt(0).toUpperCase() + last.slice(1)
}


  return (
    <header className="bg-white shadow-lg border-b-4 border-red-500 sticky top-0 z-40">
      <div className="flex items-center justify-between p-3 lg:p-4">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
              id="menu-button"
            >
              {isSidebarOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          )}

          {/* Logo/Brand for mobile */}
          <div className="lg:hidden">
            <div className="text-xl font-bold text-red-600">SITRACK</div>
          </div>

          {/* Breadcrumbs - hidden on mobile */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Dashboard</span>
              <span className="text-red-500">•</span>
              <span>{getCurrentPageName(pathname)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4">
        <NotificationBell userId={userProfile.id} />

          {/* User info card - mobile & desktop */}
          <Link href="/dashboard/profile" className="block">
            <div className="bg-gradient-to-r from-red-50 to-white p-2 lg:p-3 rounded-lg border border-red-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 lg:gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {userProfile.avatar_url ? (
                    <Image
                      src={userProfile.avatar_url}
                      alt="Avatar"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xs lg:text-sm">
                        {initial}
                      </span>
                    </div>
                  )}
                </div>

                {/* User details */}
                <div className="text-right hidden sm:block">
                  <div className="font-semibold text-gray-800 text-sm lg:text-base truncate max-w-32 lg:max-w-none">
                    {userProfile.full_name}
                  </div>
                  <div className="text-xs lg:text-sm text-red-600 font-medium truncate">
                    {userProfile.roles?.name}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}