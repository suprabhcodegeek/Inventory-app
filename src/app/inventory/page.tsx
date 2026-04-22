// src/app/inventory/page.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Filter, Download, Plus, Package, Edit2, Trash2, ArrowUpDown, RefreshCw } from 'lucide-react'
import { formatCurrency, getStockStatus } from '../../lib/utils'
import { StockAdjustModal } from '../../components/inventory/stock-adjust-modal'
import { DeleteModal } from '../../components/inventory/delete-modal'

interface Product {
  id: string; name: string; sku: string; unit: string
  costPrice: string; sellingPrice: string; quantity: number
  minStock: number; location?: string; isActive: boolean
  category: { id: string; name: string; color: string }
  supplier?: { id: string; name: string } | null
}

const FILTERS = [
  { value: '',    label: 'All Products' },
  { value: 'low', label: 'Low Stock' },
  { value: 'out', label: 'Out of Stock' },
]

export default function InventoryPage() {
  const [products, setProducts]     = useState<Product[]>([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState('')
  const [page, setPage]             = useState(1)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [selCategory, setSelCat]    = useState('')
  const [adjustProduct, setAdjust]  = useState<Product | null>(null)
  const [deleteProduct, setDelete]  = useState<Product | null>(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), search, filter })
    if (selCategory) params.set('category', selCategory)
    const res = await fetch(`/api/products?${params}`)
    const data = await res.json()
    setProducts(data.products || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [page, search, filter, selCategory])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories)
  }, [])

  const exportCSV = async () => {
    const res = await fetch('/api/products?limit=9999')
    const data = await res.json()
    const headers = ['SKU','Name','Category','Supplier','Qty','Unit','Cost Price','Selling Price','Min Stock','Location']
    const rows = data.products.map((p: Product) => [
      p.sku, p.name, p.category.name, p.supplier?.name || '',
      p.quantity, p.unit, p.costPrice, p.sellingPrice, p.minStock, p.location || ''
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`; a.click()
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search name, SKU, barcode…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <select className="input w-40" value={filter} onChange={e => { setFilter(e.target.value); setPage(1) }}>
          {FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        <select className="input w-44" value={selCategory} onChange={e => { setSelCat(e.target.value); setPage(1) }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <button onClick={fetchProducts} className="btn-secondary px-3 py-2">
          <RefreshCw className="w-4 h-4" />
        </button>
        <button onClick={exportCSV} className="btn-secondary">
          <Download className="w-4 h-4" /> Export CSV
        </button>
        <Link href="/inventory/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Summary chips */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span>{total} products</span>
        <span>·</span>
        <span className="text-amber-600 font-medium">{products.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length} low stock</span>
        <span>·</span>
        <span className="text-red-600 font-medium">{products.filter(p => p.quantity === 0).length} out of stock</span>
      </div>

      {/* Table */}
      <div className="table-wrapper bg-white">
        <table className="w-full">
          <thead className="table-header">
            <tr>
              <th>Product / SKU</th>
              <th>Category</th>
              <th>Supplier</th>
              <th>Stock</th>
              <th>Cost Price</th>
              <th>Sell Price</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="table-row">
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j}><div className="h-4 bg-slate-100 rounded animate-pulse w-full" /></td>
                  ))}
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No products found</p>
                  <p className="text-slate-400 text-xs mt-1">Try adjusting your search or filters</p>
                </td>
              </tr>
            ) : products.map(p => {
              const status = getStockStatus(p.quantity, p.minStock)
              return (
                <tr key={p.id} className="table-row">
                  <td>
                    <Link href={`/inventory/${p.id}`} className="font-medium text-slate-800 hover:text-sky-600">
                      {p.name}
                    </Link>
                    <p className="text-xs text-slate-400 mt-0.5">
                      <code>{p.sku}</code> · {p.unit}
                    </p>
                  </td>
                  <td>
                    <span className="badge-blue">{p.category.name}</span>
                  </td>
                  <td className="text-slate-500">{p.supplier?.name || '—'}</td>
                  <td>
                    <span className={`font-bold text-base ${p.quantity === 0 ? 'text-red-600' : p.quantity <= p.minStock ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {p.quantity}
                    </span>
                    <span className="text-slate-400 text-xs ml-1">/ {p.minStock} min</span>
                  </td>
                  <td>{formatCurrency(p.costPrice)}</td>
                  <td className="font-medium text-emerald-700">{formatCurrency(p.sellingPrice)}</td>
                  <td className="text-slate-500">{p.location || '—'}</td>
                  <td>
                    {status.color === 'green'  && <span className="badge-green">In Stock</span>}
                    {status.color === 'yellow' && <span className="badge-yellow">Medium</span>}
                    {status.color === 'orange' && <span className="badge-yellow">Low Stock</span>}
                    {status.color === 'red'    && <span className="badge-red">{status.label}</span>}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setAdjust(p)}
                        className="p-1.5 rounded hover:bg-sky-50 text-sky-600 transition-colors"
                        title="Adjust Stock"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href={`/inventory/${p.id}/edit`}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-500 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => setDelete(p)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="btn-secondary px-3 py-1.5 disabled:opacity-40"
            >Previous</button>
            <button
              disabled={page * 20 >= total}
              onClick={() => setPage(p => p + 1)}
              className="btn-secondary px-3 py-1.5 disabled:opacity-40"
            >Next</button>
          </div>
        </div>
      )}

      {/* Modals */}
      {adjustProduct && (
        <StockAdjustModal
          product={adjustProduct}
          onClose={() => setAdjust(null)}
          onSuccess={() => { setAdjust(null); fetchProducts() }}
        />
      )}
      {deleteProduct && (
        <DeleteModal
          name={deleteProduct.name}
          onClose={() => setDelete(null)}
          onConfirm={async () => {
            await fetch(`/api/products/${deleteProduct.id}`, { method: 'DELETE' })
            setDelete(null); fetchProducts()
          }}
        />
      )}
    </div>
  )
}
