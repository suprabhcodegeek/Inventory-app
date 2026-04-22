// src/app/reports/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { Download, TrendingUp, Package, AlertTriangle, IndianRupee, FileSpreadsheet } from 'lucide-react'
import { formatCurrency, formatNumber } from '../../lib/utils'
import * as XLSX from 'xlsx'

interface StockItem {
  id: string; name: string; sku: string; category: string
  quantity: number; costPrice: number; sellingPrice: number
  stockValue: number; potentialRevenue: number
}

export default function ReportsPage() {
  const [tab, setTab]           = useState<'stock_value' | 'low_stock' | 'movement'>('stock_value')
  const [data, setData]         = useState<StockItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [days, setDays]         = useState(30)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/reports?type=${tab}&days=${days}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [tab, days])

  const totalValue    = data.reduce((s, d) => s + (d.stockValue || 0), 0)
  const totalRevenue  = data.reduce((s, d) => s + (d.potentialRevenue || 0), 0)
  const totalQty      = data.reduce((s, d) => s + (d.quantity || 0), 0)

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Report')
    XLSX.writeFile(wb, `report_${tab}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportCSV = () => {
    if (!data.length) return
    const headers = Object.keys(data[0])
    const rows = data.map(d => headers.map(h => (d as any)[h]))
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `report_${tab}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Total Units</p>
            <p className="text-2xl font-bold text-slate-900">{formatNumber(totalQty)}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Stock Value (Cost)</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalValue)}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Potential Revenue</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Tabs + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(['stock_value', 'low_stock', 'movement'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                tab === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {tab === 'movement' && (
            <select className="input w-36" value={days} onChange={e => setDays(Number(e.target.value))}>
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          )}
          <button onClick={exportCSV} className="btn-secondary">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button onClick={exportExcel} className="btn-secondary">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper bg-white">
        <table className="w-full">
          <thead className="table-header">
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Quantity</th>
              {tab === 'stock_value' && <>
                <th>Cost Price</th>
                <th>Sell Price</th>
                <th>Stock Value</th>
                <th>Pot. Revenue</th>
              </>}
              {tab === 'low_stock' && <>
                <th>Min Stock</th>
                <th>Shortage</th>
                <th>Status</th>
              </>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="table-row">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j}><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : (data as any[]).map((item, i) => (
              <tr key={item.id || i} className="table-row">
                <td className="font-medium text-slate-800">{item.name || item.product?.name || '—'}</td>
                <td><code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{item.sku || '—'}</code></td>
                <td><span className="badge-blue">{item.category || item.product?.category?.name || '—'}</span></td>
                <td className="font-semibold text-slate-700">{item.quantity ?? item.qty ?? '—'}</td>
                {tab === 'stock_value' && <>
                  <td>{formatCurrency(item.costPrice)}</td>
                  <td>{formatCurrency(item.sellingPrice)}</td>
                  <td className="font-semibold text-emerald-700">{formatCurrency(item.stockValue)}</td>
                  <td className="text-violet-700">{formatCurrency(item.potentialRevenue)}</td>
                </>}
                {tab === 'low_stock' && <>
                  <td>{item.minStock}</td>
                  <td className="text-red-600 font-semibold">{Math.max(0, item.minStock - item.quantity)}</td>
                  <td>{item.quantity === 0 ? <span className="badge-red">Out of Stock</span> : <span className="badge-yellow">Low Stock</span>}</td>
                </>}
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && data.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No data for this report</p>
          </div>
        )}
      </div>
    </div>
  )
}
