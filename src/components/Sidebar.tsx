// @/components/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Landmark, Users, FileText, Building, LogOut, BarChart3, User, Map, MapPin, Database } from 'lucide-react'
import { type ProfileWithRole } from "@/app/dashboard/layout"
import { useEffect, useState } from 'react'
import { LogoutButton } from './LogoutButton'

type RoleName = "SuperAdmin" | "Optima" | "Legal" | "Asset"

type NavItem = {
  href: string
  icon: React.ElementType
  label: string
  allowedRoles: (RoleName | undefined)[]
}

type StatisticsData = {
  siteCount: number
  contractCount: number
  permitCount: number
}

const navItems: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Dashboard', allowedRoles: ['SuperAdmin', 'Legal', 'Optima', 'Asset'] },
  { href: '/dashboard/sites', icon: Building, label: 'Manajemen Site', allowedRoles: ['SuperAdmin', 'Optima', 'Asset'] },
  { href: '/dashboard/contracts', icon: FileText, label: 'Kontrak', allowedRoles: ['SuperAdmin', 'Legal'] },
  { href: '/dashboard/land-owners', icon: Map, label: 'Pemilik Lahan', allowedRoles: ['SuperAdmin'] },
  { href: '/dashboard/map-view', icon: MapPin, label: 'Tampilan Peta', allowedRoles: ['SuperAdmin', 'Optima', 'Asset'] },
  { href: '/dashboard/master-data', icon: Database, label: 'Data Master', allowedRoles: ['SuperAdmin'] },
  { href: '/dashboard/users', icon: Users, label: 'Manajemen User', allowedRoles: ['SuperAdmin'] },
]

export function Sidebar({ 
  roleName, 
  userProfile, 
  isOpen, 
  onClose 
}: { 
  roleName: RoleName | undefined
  userProfile: ProfileWithRole
  isOpen?: boolean
  onClose?: () => void
}) {
  const pathname = usePathname()
  const [stats, setStats] = useState<StatisticsData>({ siteCount: 0, contractCount: 0, permitCount: 0 })
  const [isLoading, setIsLoading] = useState(true)

  const filteredNavItems = navItems.filter(item => item.allowedRoles.includes(roleName))

  // Close sidebar when clicking on a link (mobile)
  const handleLinkClick = () => {
    if (onClose) {
      onClose()
    }
  }

  // Fetch statistics data
  useEffect(() => {
    // const fetchStats = async () => {
    //   try {
    //     const response = await fetch('/api/dashboard/stats')
    //     if (response.ok) {
    //       const data = await response.json()
    //       setStats(data)
    //     }
    //   } catch (error) {
    //     console.error('Error fetching stats:', error)
    //   } finally {
    //     setIsLoading(false)
    //   }
    // }

    // fetchStats()
  }, [])

  // For backward compatibility, if no mobile props provided, show as desktop
  const isMobileMode = isOpen !== undefined && onClose !== undefined

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMode && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div 
        id="sidebar"
        className={`
          ${isMobileMode ? 'fixed lg:static' : 'static'} 
          inset-y-0 left-0 z-50 lg:z-auto
          w-64 bg-gradient-to-b from-red-600 to-red-700 text-white 
          flex-shrink-0 shadow-xl flex flex-col h-full
          ${isMobileMode ? 'transform transition-transform duration-300 ease-in-out' : ''}
          ${isMobileMode && isOpen ? 'translate-x-0' : isMobileMode ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        `}
      >
        
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-red-500">
          <div className="text-xl lg:text-2xl font-bold text-white mb-1">SITRACK</div>
          <div className="text-red-100 text-xs lg:text-sm">PT Telkom Infrastruktur Indonesia</div>
        </div>
        
        {/* Mobile user info - only visible on mobile */}
        {isMobileMode && (
          <div className="lg:hidden p-4 border-b border-red-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center border-2 border-red-400">
                <span className="text-white font-semibold text-sm">
                  {userProfile.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <div className="font-semibold text-white text-sm">
                  {userProfile.full_name}
                </div>
                <div className="text-xs text-red-100">
                  {userProfile.roles?.name}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-2 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {filteredNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center p-3 lg:p-4 mx-1 lg:mx-3 rounded-lg transition-all duration-200 hover:bg-red-500 hover:shadow-lg ${
                    pathname === item.href 
                      ? 'bg-white text-red-600 shadow-lg font-semibold' 
                      : 'text-red-100 hover:text-white'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${pathname === item.href ? 'text-red-600' : ''}`} />
                  <span className="text-sm lg:text-base">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout - always visible */}
        <div className="p-3 lg:p-4 border-t border-red-500">
          <LogoutButton />
        </div>

        {/* Footer */}
        <div className="p-3 lg:p-4 border-t border-red-500">
          <div className="text-xs text-red-100 text-center">
            {/* Footer content can be added here */}
          </div>
        </div>
      </div>
    </>
  )
}