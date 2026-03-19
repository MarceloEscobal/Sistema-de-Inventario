"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "../lib/utils"
import { 
  LayoutDashboard, 
  Package, 
  History, 
  AlertTriangle, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Users,
  Warehouse
} from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "../lib/supabase"
import { useRouter } from "next/navigation"
import { useProfile } from "../hooks/useInventory"

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Inventario", icon: Package, href: "/inventory" },
  { name: "Historial", icon: History, href: "/audit" },
  { name: "Alertas", icon: AlertTriangle, href: "/alerts" },
  { name: "Configuración", icon: Settings, href: "/settings" },
  { name: "Personal", icon: Users, href: "/staff" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { profile, user, isAdmin, isSuperAdmin } = useProfile()
  
  const accessibleMenuItems = menuItems.filter(item => {
    if (item.name === "Personal") return isSuperAdmin
    if (isAdmin) return true
    return item.name === "Inventario" || item.name === "Alertas"
  })
  
  if (pathname === '/login') return null

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Get initials from email
  const getInitials = (email?: string) => {
    if (!email) return '?'
    const parts = email.split('@')[0].split(/[._-]/)
    return parts.slice(0, 2).map(p => p[0]?.toUpperCase()).join('')
  }

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col shrink-0"
      style={{
        background: 'rgba(10, 10, 22, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '4px 0 40px rgba(0,0,0,0.3)',
      }}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' }}>
              <Warehouse size={15} className="text-white" />
            </div>
            <span className="truncate text-sm font-800 tracking-tight text-white" style={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Inventarios
            </span>
          </div>
        )}
        {isCollapsed && (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mx-auto" style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' }}>
            <Warehouse size={15} className="text-white" />
          </div>
        )}
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#54516b' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(108,99,255,0.12)', e.currentTarget.style.color = '#a78bfa')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)', e.currentTarget.style.color = '#54516b')}
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {isCollapsed && (
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mt-3 mx-auto flex h-7 w-7 items-center justify-center rounded-lg transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#54516b' }}
        >
          <ChevronRight size={14} />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-0.5">
        {!isCollapsed && (
          <p className="px-3 mb-2 text-[10px] font-700 uppercase tracking-widest" style={{ color: '#54516b', fontWeight: 700 }}>
            Navegación
          </p>
        )}
        {accessibleMenuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-xl transition-all duration-200",
                isCollapsed ? "justify-center py-2.5 px-2" : "px-3 py-2.5 gap-3"
              )}
              style={isActive ? {
                background: 'rgba(108, 99, 255, 0.14)',
                boxShadow: 'inset 0 0 0 1px rgba(108, 99, 255, 0.3)',
              } : {}}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon 
                className="shrink-0 transition-colors duration-200"
                size={18}
                style={isActive ? { color: '#a78bfa' } : { color: '#54516b' }}
              />
              {!isCollapsed && (
                <span className="text-sm font-600 truncate transition-colors duration-200" style={{ 
                  fontWeight: 600,
                  color: isActive ? '#f1f0ff' : '#9b98c0' 
                }}>
                  {item.name}
                </span>
              )}
              {!isCollapsed && isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#6c63ff' }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User & Sign out */}
      <div className="shrink-0 p-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {!isCollapsed && profile && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-700" 
              style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', color: '#fff', fontWeight: 700 }}>
              {getInitials(user?.email)}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="truncate text-xs font-600" style={{ fontWeight: 600, color: '#f1f0ff' }}>{user?.email?.split('@')[0]}</p>
              <p className="truncate text-[10px]" style={{ color: '#54516b' }}>{profile?.role}</p>
            </div>
          </div>
        )}
        
        <button 
          onClick={handleSignOut}
          className={cn(
            "flex w-full items-center rounded-xl py-2.5 text-sm font-600 transition-all",
            isCollapsed ? "justify-center px-2" : "gap-3 px-3"
          )}
          style={{ color: '#54516b', fontWeight: 600 }}
          onMouseEnter={e => { 
            e.currentTarget.style.background = 'rgba(244,63,112,0.1)'
            e.currentTarget.style.color = '#f43f70'
          }}
          onMouseLeave={e => { 
            e.currentTarget.style.background = ''
            e.currentTarget.style.color = '#54516b'
          }}
          title={isCollapsed ? "Cerrar Sesión" : undefined}
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </motion.div>
  )
}
