// src/components/layout/sidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard, Package, Truck, BarChart3, Settings,
  LogOut, ChevronDown, Bell, Search, Menu, X, ShoppingCart,
  AlertTriangle, Tag
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useState } from 'react'

const NAV = [
  { href: '/dashboard',           label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/inventory',           label: 'Inventory',    icon: Package },
  { href: '/inventory/orders',    label: 'Orders',       icon: ShoppingCart },
  { href: '/suppliers',           label: 'Suppliers',    icon: Truck },
  { href: '/inventory/categories',label: 'Categories',   icon: Tag },
  { href: '/reports',             label: 'Reports',      icon: BarChart3 },
  { href: '/settings',            label: 'Settings',     icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={cn(
      'flex flex-col h-full bg-slate-900 text-white transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700/50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">InventoryPro</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors ml-auto"
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Low Stock Alert Badge */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Alerts</span>
          </div>
          <p className="text-slate-400 text-xs mt-1">Check inventory levels</p>
        </div>
      )}

      {/* User */}
      <div className={cn(
        'flex items-center gap-3 px-3 py-4 border-t border-slate-700/50',
        collapsed && 'justify-center'
      )}>
        <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {session?.user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{session?.user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-400 truncate">{session?.user?.role || 'Admin'}</p>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  )
}
