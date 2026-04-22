'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Plus, RefreshCw, ShoppingCart, Truck, Clock,
  CheckCircle, XCircle, Package, ChevronRight
} from 'lucide-react'
import { formatCurrency } from '../../../lib/utils'
import { format } from 'date-fns'

interface OrderItem {
  id: string; quantity: number; receivedQty: number; unitPrice: string
  product: { id: string; name: string; sku: string; unit: string }
}
interface Order {
  id: string; orderNo: string; status: string; totalAmount: string
  createdAt: string; expectedDate?: string; notes?: string
  supplier: { id: string; name: string }
  items: OrderItem[]
}

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'badge-yellow',
  CONFIRMED: 'badge-blue',
  PARTIAL:   'badge-blue',
  RECEIVED:  'badge-green',
  CANCELLED: 'badge-red',
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING:   <Clock className="w-3 h-3" />,
  CONFIRMED: <ShoppingCart className="w-3 h-3" />,
  PARTIAL:   <Package className="w-3 h-3" />,
  RECEIVED:  <CheckCircle className="w-3 h-3" />,
  CANCELLED: <XCircle className="w-3 h-3" />,
}

const STATUS_FILTERS = [
  { value: '', label: 'All Orders' },
  { value: 'PENDING',   label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PARTIAL',   label: 'Partial' },
  { value: 'RECEIVED',  label: 'Received' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

export default function OrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [status, setStatus]   = useState('')
  const [page, setPage]       = useState(1)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (status) params.set('status', status)
    const res  = await fetch(`/api/orders?${params}`)
    const data = await res.json()
    setOrders(data.orders || [])
    setTotal(data.total   || 0)
    setLoading(false)
  }, [page, status])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const cancelOrder = async (id: string) => {
    if (!confirm('Cancel this order?')) return
    await fetch(`/api/orders/${id}`, { method: 'DELETE' })
    fetchOrders()
  }

  const confirmOrder = async (id: string) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CONFIRMED' }),
    })
    fetchOrders()
  }

  // Totals for summary bar
  const pending   = orders.filter(o => o.status === 'PENDING').length
  const confirmed = orders.filter(o => o.status === 'CONFIRMED').length
  const partial   = orders.filter(o => o.status === 'PARTIAL').length

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Orders', value: total, color: 'text-slate-800' },
          { label: 'Pending',      value: pending,   color: 'text-amber-600' },
          { label: 'Confirmed',    value: confirmed, color: 'text-sky-600' },
          { label: 'Partial',      value: partial,   color: 'text-violet-600' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => { setStatus(f.value); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                status === f.value
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={fetchOrders} className="btn-secondary px-3 py-2">
          <RefreshCw className="w-4 h-4" />
        </button>
        <Link href="/inventory/orders/new" className="btn-primary ml-auto">
          <Plus className="w-4 h-4" /> New Order
        </Link>
      </div>

      {/* Orders Table */}
      <div className="table-wrapper bg-white">
        <table className="w-full">
          <thead className="table-header">
            <tr>
              <th>Order No.</th>
              <th>Supplier</th>
              <th>Items</th>
              <th>Total</th>
              <th>Expected</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="table-row">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j}><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              : orders.length === 0
              ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No orders found</p>
                    <p className="text-slate-400 text-xs mt-1">Create your first purchase order</p>
                  </td>
                </tr>
              )
              : orders.map(order => {
                const received = order.items.every(i => i.receivedQty >= i.quantity)
                return (
                  <tr key={order.id} className="table-row">
                    <td>
                      <Link href={`/inventory/orders/${order.id}`} className="font-mono text-sm font-medium text-sky-600 hover:underline">
                        {order.orderNo}
                      </Link>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {format(new Date(order.createdAt), 'dd MMM yyyy')}
                      </p>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">{order.supplier.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-slate-600">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                    </td>
                    <td className="font-semibold text-emerald-700">{formatCurrency(order.totalAmount)}</td>
                    <td className="text-slate-500">
                      {order.expectedDate ? format(new Date(order.expectedDate), 'dd MMM yyyy') : '—'}
                    </td>
                    <td>
                      <span className={STATUS_STYLES[order.status] || 'badge-gray'}>
                        {STATUS_ICONS[order.status]}
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => confirmOrder(order.id)}
                            className="text-xs px-2.5 py-1 bg-sky-50 text-sky-600 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors"
                          >Confirm</button>
                        )}
                        {(order.status === 'CONFIRMED' || order.status === 'PARTIAL') && (
                          <Link
                            href={`/inventory/orders/${order.id}`}
                            className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                          >Receive</Link>
                        )}
                        {!['RECEIVED', 'CANCELLED'].includes(order.status) && (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            className="text-xs px-2.5 py-1 bg-red-50 text-red-500 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                          >Cancel</button>
                        )}
                        <Link href={`/inventory/orders/${order.id}`} className="p-1.5 rounded hover:bg-slate-100 text-slate-400">
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary px-3 py-1.5 disabled:opacity-40">Previous</button>
            <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="btn-secondary px-3 py-1.5 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
