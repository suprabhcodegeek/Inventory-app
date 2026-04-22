'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Truck, Package, CheckCircle, Clock,
  XCircle, ShoppingCart, Calendar, FileText, Save
} from 'lucide-react'
import { formatCurrency } from '../../../../lib/utils'
import { format } from 'date-fns'

interface OrderItem {
  id: string; quantity: number; receivedQty: number; unitPrice: string
  product: { id: string; name: string; sku: string; unit: string; category: { name: string } }
}
interface Order {
  id: string; orderNo: string; status: string; totalAmount: string
  createdAt: string; expectedDate?: string; receivedDate?: string; notes?: string
  supplier: { id: string; name: string; phone?: string; email?: string }
  items: OrderItem[]
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-sky-50 text-sky-700 border-sky-200',
  PARTIAL:   'bg-violet-50 text-violet-700 border-violet-200',
  RECEIVED:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-600 border-red-200',
}

export default function OrderDetailPage() {
  const { id }    = useParams<{ id: string }>()
  const router    = useRouter()
  const [order, setOrder]       = useState<Order | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [receiving, setReceiving] = useState(false)
  // Track how many units are being received per item
  const [receiveQty, setReceiveQty] = useState<Record<string, number>>({})

  const fetchOrder = async () => {
    setLoading(true)
    const res  = await fetch(`/api/orders/${id}`)
    const data = await res.json()
    setOrder(data)
    // Pre-fill receive quantities with remaining amounts
    const qty: Record<string, number> = {}
    for (const item of data.items || []) {
      qty[item.id] = Math.max(0, item.quantity - item.receivedQty)
    }
    setReceiveQty(qty)
    setLoading(false)
  }

  useEffect(() => { fetchOrder() }, [id])

  const handleReceive = async () => {
    setSaving(true)
    const receivedItems = Object.entries(receiveQty)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, qty]) => ({ itemId, receivedQty: qty }))

    if (receivedItems.length === 0) { setSaving(false); return }

    const res = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _action: 'receive', receivedItems }),
    })

    if (res.ok) {
      fetchOrder()
      setReceiving(false)
    }
    setSaving(false)
  }

  const handleConfirm = async () => {
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CONFIRMED' }),
    })
    fetchOrder()
  }

  const handleCancel = async () => {
    if (!confirm('Cancel this order? This cannot be undone.')) return
    await fetch(`/api/orders/${id}`, { method: 'DELETE' })
    router.push('/inventory/orders')
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-6 h-32 animate-pulse bg-slate-100" />
        ))}
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Order not found</p>
        <Link href="/inventory/orders" className="btn-secondary mt-4 inline-flex">Go back</Link>
      </div>
    )
  }

  const canReceive = ['CONFIRMED', 'PARTIAL'].includes(order.status)
  const canConfirm = order.status === 'PENDING'
  const canCancel  = !['RECEIVED', 'CANCELLED'].includes(order.status)
  const totalReceived = order.items.reduce((s, i) => s + Number(i.unitPrice) * i.receivedQty, 0)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/inventory/orders" className="btn-secondary px-3 py-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900 font-mono">{order.orderNo}</h2>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.status] || ''}`}>
              {order.status}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Created {format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}
          </p>
        </div>
        <div className="flex gap-2">
          {canConfirm && (
            <button onClick={handleConfirm} className="btn-secondary text-sky-600 border-sky-200">
              <CheckCircle className="w-4 h-4" /> Confirm
            </button>
          )}
          {canReceive && !receiving && (
            <button onClick={() => setReceiving(true)} className="btn-primary">
              <Package className="w-4 h-4" /> Receive Stock
            </button>
          )}
          {canCancel && (
            <button onClick={handleCancel} className="btn-secondary text-red-500 border-red-200">
              <XCircle className="w-4 h-4" /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center gap-3">
          <Truck className="w-5 h-5 text-sky-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-500">Supplier</p>
            <p className="font-semibold text-slate-800">{order.supplier.name}</p>
            {order.supplier.phone && <p className="text-xs text-slate-400">{order.supplier.phone}</p>}
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-500">Expected Date</p>
            <p className="font-semibold text-slate-800">
              {order.expectedDate ? format(new Date(order.expectedDate), 'dd MMM yyyy') : 'Not set'}
            </p>
            {order.receivedDate && <p className="text-xs text-emerald-600">Received {format(new Date(order.receivedDate), 'dd MMM')}</p>}
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <ShoppingCart className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-500">Order Value</p>
            <p className="font-bold text-emerald-700">{formatCurrency(order.totalAmount)}</p>
            {totalReceived > 0 && <p className="text-xs text-slate-400">{formatCurrency(totalReceived)} received</p>}
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="card p-4 flex items-start gap-3">
          <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-slate-600">{order.notes}</p>
        </div>
      )}

      {/* Receive Mode Banner */}
      {receiving && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-emerald-800">Receiving Mode — Update quantities received</p>
            <p className="text-sm text-emerald-600 mt-0.5">Enter how many units you physically received for each product</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setReceiving(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleReceive} disabled={saving} className="btn-primary text-sm">
              <Save className="w-4 h-4" />
              {saving ? 'Saving…' : 'Save Receipt'}
            </button>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="card">
        <div className="px-5 py-4 border-b border-slate-100 font-semibold text-slate-800">
          Order Items ({order.items.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th>Product</th>
                <th>Ordered</th>
                <th>Received</th>
                <th>Remaining</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
                {receiving && <th>Receive Now</th>}
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => {
                const remaining = item.quantity - item.receivedQty
                const fullyReceived = remaining <= 0
                return (
                  <tr key={item.id} className={`table-row ${fullyReceived ? 'opacity-60' : ''}`}>
                    <td>
                      <p className="font-medium text-slate-800">{item.product.name}</p>
                      <p className="text-xs text-slate-400">{item.product.sku} · {item.product.unit}</p>
                      <span className="badge-blue text-xs mt-0.5 inline-flex">{item.product.category.name}</span>
                    </td>
                    <td className="font-semibold text-slate-700">{item.quantity}</td>
                    <td>
                      <span className={`font-semibold ${item.receivedQty > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {item.receivedQty}
                      </span>
                    </td>
                    <td>
                      <span className={`font-semibold ${remaining > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {remaining > 0 ? remaining : '✓ Done'}
                      </span>
                    </td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td className="font-semibold text-emerald-700">
                      {formatCurrency(Number(item.unitPrice) * item.quantity)}
                    </td>
                    {receiving && (
                      <td>
                        {fullyReceived ? (
                          <span className="text-xs text-emerald-600">Fully received</span>
                        ) : (
                          <input
                            type="number" min="0" max={remaining}
                            className="input w-20 py-1.5 text-center"
                            value={receiveQty[item.id] ?? remaining}
                            onChange={e => setReceiveQty(prev => ({
                              ...prev,
                              [item.id]: Math.min(remaining, Math.max(0, parseInt(e.target.value) || 0))
                            }))}
                          />
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td colSpan={receiving ? 5 : 4} className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">
                  Total:
                </td>
                <td className="px-4 py-3 font-bold text-emerald-700">
                  {formatCurrency(order.totalAmount)}
                </td>
                {receiving && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
