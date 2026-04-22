// src/components/layout/header.tsx
'use client'
import { Bell, Search, Plus } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':             { title: 'Dashboard',   subtitle: 'Overview of your inventory' },
  '/inventory':             { title: 'Inventory',   subtitle: 'Manage all products & stock' },
  '/inventory/orders':      { title: 'Orders',      subtitle: 'Purchase orders & receiving' },
  '/inventory/categories':  { title: 'Categories',  subtitle: 'Organize your products' },
  '/suppliers':             { title: 'Suppliers',   subtitle: 'Manage vendor relationships' },
  '/reports':               { title: 'Reports',     subtitle: 'Analytics & insights' },
  '/settings':              { title: 'Settings',    subtitle: 'Configure your workspace' },
}

const ADD_BUTTONS: Record<string, { label: string; href: string }> = {
  '/inventory': { label: 'Add Product',  href: '/inventory/new' },
  '/suppliers':  { label: 'Add Supplier', href: '/suppliers/new' },
  '/inventory/orders': { label: 'New Order', href: '/inventory/orders/new' },
}

export function Header() {
  const pathname = usePathname()
  const [query, setQuery] = useState('')
  const page = PAGE_TITLES[pathname] || { title: 'InventoryPro', subtitle: '' }
  const addBtn = ADD_BUTTONS[pathname]

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-10">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">{page.title}</h1>
        {page.subtitle && <p className="text-xs text-slate-500 mt-0.5">{page.subtitle}</p>}
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search products, SKU, suppliers…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        {addBtn && (
          <Link href={addBtn.href} className="btn-primary">
            <Plus className="w-4 h-4" />
            {addBtn.label}
          </Link>
        )}
      </div>
    </header>
  )
}
