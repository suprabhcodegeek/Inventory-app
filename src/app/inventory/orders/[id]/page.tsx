// 'use client'
// import { useState, useEffect } from 'react'
// import { useParams, useRouter } from 'next/navigation'
// import Link from 'next/link'
// import {
//   ArrowLeft, Truck, Package, CheckCircle, Clock,
//   XCircle, ShoppingCart, Calendar, FileText, Save
// } from 'lucide-react'
// import { formatCurrency } from '../../../../lib/utils'
// import { format } from 'date-fns'

// interface OrderItem {
//   id: string; quantity: number; receivedQty: number; unitPrice: string
//   product: { id: string; name: string; sku: string; unit: string; category: { name: string } }
// }
// interface Order {
//   id: string; orderNo: string; status: string; totalAmount: string
//   createdAt: string; expectedDate?: string; receivedDate?: string; notes?: string
//   supplier: { id: string; name: string; phone?: string; email?: string }
//   items: OrderItem[]
// }

// const STATUS_COLORS: Record<string, string> = {
//   PENDING:   'bg-amber-50 text-amber-700 border-amber-200',
//   CONFIRMED: 'bg-sky-50 text-sky-700 border-sky-200',
//   PARTIAL:   'bg-violet-50 text-violet-700 border-violet-200',
//   RECEIVED:  'bg-emerald-50 text-emerald-700 border-emerald-200',
//   CANCELLED: 'bg-red-50 text-red-600 border-red-200',
// }

// export default function OrderDetailPage() {
//   const { id }    = useParams<{ id: string }>()
//   const router    = useRouter()
//   const [order, setOrder]       = useState<Order | null>(null)
//   const [loading, setLoading]   = useState(true)
//   const [saving, setSaving]     = useState(false)
//   const [receiving, setReceiving] = useState(false)
//   // Track how many units are being received per item
//   const [receiveQty, setReceiveQty] = useState<Record<string, number>>({})

//   const fetchOrder = async () => {
//     setLoading(true)
//     const res  = await fetch(`/api/orders/${id}`)
//     const data = await res.json()
//     setOrder(data)
//     // Pre-fill receive quantities with remaining amounts
//     const qty: Record<string, number> = {}
//     for (const item of data.items || []) {
//       qty[item.id] = Math.max(0, item.quantity - item.receivedQty)
//     }
//     setReceiveQty(qty)
//     setLoading(false)
//   }

//   useEffect(() => { fetchOrder() }, [id])

//   const handleReceive = async () => {
//     setSaving(true)
//     const receivedItems = Object.entries(receiveQty)
//       .filter(([, qty]) => qty > 0)
//       .map(([itemId, qty]) => ({ itemId, receivedQty: qty }))

//     if (receivedItems.length === 0) { setSaving(false); return }

//     const res = await fetch(`/api/orders/${id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ _action: 'receive', receivedItems }),
//     })

//     if (res.ok) {
//       fetchOrder()
//       setReceiving(false)
//     }
//     setSaving(false)
//   }

//   const handleConfirm = async () => {
//     await fetch(`/api/orders/${id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ status: 'CONFIRMED' }),
//     })
//     fetchOrder()
//   }

//   const handleCancel = async () => {
//     if (!confirm('Cancel this order? This cannot be undone.')) return
//     await fetch(`/api/orders/${id}`, { method: 'DELETE' })
//     router.push('/inventory/orders')
//   }

//   if (loading) {
//     return (
//       <div className="max-w-3xl mx-auto space-y-4">
//         {Array.from({ length: 3 }).map((_, i) => (
//           <div key={i} className="card p-6 h-32 animate-pulse bg-slate-100" />
//         ))}
//       </div>
//     )
//   }

//   if (!order) {
//     return (
//       <div className="text-center py-20">
//         <p className="text-slate-500">Order not found</p>
//         <Link href="/inventory/orders" className="btn-secondary mt-4 inline-flex">Go back</Link>
//       </div>
//     )
//   }

//   const canReceive = ['CONFIRMED', 'PARTIAL'].includes(order.status)
//   const canConfirm = order.status === 'PENDING'
//   const canCancel  = !['RECEIVED', 'CANCELLED'].includes(order.status)
//   const totalReceived = order.items.reduce((s, i) => s + Number(i.unitPrice) * i.receivedQty, 0)

//   return (
//     <div className="max-w-3xl mx-auto space-y-6">
//       {/* Header */}
//       <div className="flex items-center gap-3">
//         <Link href="/inventory/orders" className="btn-secondary px-3 py-2">
//           <ArrowLeft className="w-4 h-4" />
//         </Link>
//         <div className="flex-1">
//           <div className="flex items-center gap-3">
//             <h2 className="text-xl font-bold text-slate-900 font-mono">{order.orderNo}</h2>
//             <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.status] || ''}`}>
//               {order.status}
//             </span>
//           </div>
//           <p className="text-sm text-slate-500 mt-0.5">
//             Created {format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}
//           </p>
//         </div>
//         <div className="flex gap-2">
//           {canConfirm && (
//             <button onClick={handleConfirm} className="btn-secondary text-sky-600 border-sky-200">
//               <CheckCircle className="w-4 h-4" /> Confirm
//             </button>
//           )}
//           {canReceive && !receiving && (
//             <button onClick={() => setReceiving(true)} className="btn-primary">
//               <Package className="w-4 h-4" /> Receive Stock
//             </button>
//           )}
//           {canCancel && (
//             <button onClick={handleCancel} className="btn-secondary text-red-500 border-red-200">
//               <XCircle className="w-4 h-4" /> Cancel
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Info Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <div className="card p-4 flex items-center gap-3">
//           <Truck className="w-5 h-5 text-sky-500 flex-shrink-0" />
//           <div>
//             <p className="text-xs text-slate-500">Supplier</p>
//             <p className="font-semibold text-slate-800">{order.supplier.name}</p>
//             {order.supplier.phone && <p className="text-xs text-slate-400">{order.supplier.phone}</p>}
//           </div>
//         </div>
//         <div className="card p-4 flex items-center gap-3">
//           <Calendar className="w-5 h-5 text-amber-500 flex-shrink-0" />
//           <div>
//             <p className="text-xs text-slate-500">Expected Date</p>
//             <p className="font-semibold text-slate-800">
//               {order.expectedDate ? format(new Date(order.expectedDate), 'dd MMM yyyy') : 'Not set'}
//             </p>
//             {order.receivedDate && <p className="text-xs text-emerald-600">Received {format(new Date(order.receivedDate), 'dd MMM')}</p>}
//           </div>
//         </div>
//         <div className="card p-4 flex items-center gap-3">
//           <ShoppingCart className="w-5 h-5 text-emerald-500 flex-shrink-0" />
//           <div>
//             <p className="text-xs text-slate-500">Order Value</p>
//             <p className="font-bold text-emerald-700">{formatCurrency(order.totalAmount)}</p>
//             {totalReceived > 0 && <p className="text-xs text-slate-400">{formatCurrency(totalReceived)} received</p>}
//           </div>
//         </div>
//       </div>

//       {order.notes && (
//         <div className="card p-4 flex items-start gap-3">
//           <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
//           <p className="text-sm text-slate-600">{order.notes}</p>
//         </div>
//       )}

//       {/* Receive Mode Banner */}
//       {receiving && (
//         <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 flex items-center justify-between">
//           <div>
//             <p className="font-semibold text-emerald-800">Receiving Mode — Update quantities received</p>
//             <p className="text-sm text-emerald-600 mt-0.5">Enter how many units you physically received for each product</p>
//           </div>
//           <div className="flex gap-2">
//             <button onClick={() => setReceiving(false)} className="btn-secondary text-sm">Cancel</button>
//             <button onClick={handleReceive} disabled={saving} className="btn-primary text-sm">
//               <Save className="w-4 h-4" />
//               {saving ? 'Saving…' : 'Save Receipt'}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Items Table */}
//       <div className="card">
//         <div className="px-5 py-4 border-b border-slate-100 font-semibold text-slate-800">
//           Order Items ({order.items.length})
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="table-header">
//               <tr>
//                 <th>Product</th>
//                 <th>Ordered</th>
//                 <th>Received</th>
//                 <th>Remaining</th>
//                 <th>Unit Price</th>
//                 <th>Subtotal</th>
//                 {receiving && <th>Receive Now</th>}
//               </tr>
//             </thead>
//             <tbody>
//               {order.items.map(item => {
//                 const remaining = item.quantity - item.receivedQty
//                 const fullyReceived = remaining <= 0
//                 return (
//                   <tr key={item.id} className={`table-row ${fullyReceived ? 'opacity-60' : ''}`}>
//                     <td>
//                       <p className="font-medium text-slate-800">{item.product.name}</p>
//                       <p className="text-xs text-slate-400">{item.product.sku} · {item.product.unit}</p>
//                       <span className="badge-blue text-xs mt-0.5 inline-flex">{item.product.category.name}</span>
//                     </td>
//                     <td className="font-semibold text-slate-700">{item.quantity}</td>
//                     <td>
//                       <span className={`font-semibold ${item.receivedQty > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
//                         {item.receivedQty}
//                       </span>
//                     </td>
//                     <td>
//                       <span className={`font-semibold ${remaining > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
//                         {remaining > 0 ? remaining : '✓ Done'}
//                       </span>
//                     </td>
//                     <td>{formatCurrency(item.unitPrice)}</td>
//                     <td className="font-semibold text-emerald-700">
//                       {formatCurrency(Number(item.unitPrice) * item.quantity)}
//                     </td>
//                     {receiving && (
//                       <td>
//                         {fullyReceived ? (
//                           <span className="text-xs text-emerald-600">Fully received</span>
//                         ) : (
//                           <input
//                             type="number" min="0" max={remaining}
//                             className="input w-20 py-1.5 text-center"
//                             value={receiveQty[item.id] ?? remaining}
//                             onChange={e => setReceiveQty(prev => ({
//                               ...prev,
//                               [item.id]: Math.min(remaining, Math.max(0, parseInt(e.target.value) || 0))
//                             }))}
//                           />
//                         )}
//                       </td>
//                     )}
//                   </tr>
//                 )
//               })}
//             </tbody>
//             <tfoot>
//               <tr className="bg-slate-50 border-t-2 border-slate-200">
//                 <td colSpan={receiving ? 5 : 4} className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">
//                   Total:
//                 </td>
//                 <td className="px-4 py-3 font-bold text-emerald-700">
//                   {formatCurrency(order.totalAmount)}
//                 </td>
//                 {receiving && <td></td>}
//               </tr>
//             </tfoot>
//           </table>
//         </div>
//       </div>
//     </div>
//   )
// }
'use client'
// src/app/inventory/orders/[id]/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Truck, Package, CheckCircle, Clock,
  XCircle, ShoppingCart, Calendar, FileText, Save,
  RefreshCw, IndianRupee, Hash, User, Phone, Mail,
  AlertTriangle, ChevronRight
} from 'lucide-react'
import { formatCurrency } from '../../../../lib/utils'
import { format } from 'date-fns'

interface OrderItem {
  id: string
  quantity: number
  receivedQty: number
  unitPrice: string
  product: {
    id: string
    name: string
    sku: string
    unit: string
    quantity: number   // current stock level
    category: { name: string; color: string }
  }
}

interface Order {
  id: string
  orderNo: string
  status: string
  totalAmount: string
  createdAt: string
  updatedAt: string
  expectedDate?: string
  receivedDate?: string
  notes?: string
  supplier: {
    id: string
    name: string
    contactPerson?: string
    phone?: string
    email?: string
    gstin?: string
  }
  items: OrderItem[]
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
  PENDING:   { label: 'Pending',   bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200',  icon: <Clock      className="w-4 h-4" /> },
  CONFIRMED: { label: 'Confirmed', bg: 'bg-sky-50',     text: 'text-sky-700',    border: 'border-sky-200',    icon: <CheckCircle className="w-4 h-4" /> },
  PARTIAL:   { label: 'Partial',   bg: 'bg-violet-50',  text: 'text-violet-700', border: 'border-violet-200', icon: <Package    className="w-4 h-4" /> },
  RECEIVED:  { label: 'Received',  bg: 'bg-emerald-50', text: 'text-emerald-700',border: 'border-emerald-200',icon: <CheckCircle className="w-4 h-4" /> },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-50',     text: 'text-red-600',    border: 'border-red-200',    icon: <XCircle    className="w-4 h-4" /> },
}

// Progress bar for order fulfilment
function ProgressBar({ received, total }: { received: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((received / total) * 100)
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-sky-500' : 'bg-slate-200'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-slate-600 w-10 text-right">{pct}%</span>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id }    = useParams<{ id: string }>()
  const router    = useRouter()
  const [order, setOrder]       = useState<Order | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [receiving, setReceiving] = useState(false)
  const [receiveQty, setReceiveQty] = useState<Record<string, number>>({})

  const fetchOrder = useCallback(async () => {
    setLoading(true)
    const res  = await fetch(`/api/orders/${id}`)
    const data = await res.json()
    setOrder(data)
    // Default receive qty = remaining for each item
    const qty: Record<string, number> = {}
    for (const item of data.items ?? []) {
      qty[item.id] = Math.max(0, item.quantity - item.receivedQty)
    }
    setReceiveQty(qty)
    setLoading(false)
  }, [id])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  const handleConfirm = async () => {
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CONFIRMED' }),
    })
    fetchOrder()
  }

  const handleReceive = async () => {
    setSaving(true)
    const receivedItems = Object.entries(receiveQty)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, qty]) => ({ itemId, receivedQty: qty }))

    if (receivedItems.length === 0) { setSaving(false); return }

    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _action: 'receive', receivedItems }),
    })
    setReceiving(false)
    fetchOrder()
    setSaving(false)
  }

  const handleCancel = async () => {
    if (!confirm('Cancel this purchase order? This cannot be undone.')) return
    await fetch(`/api/orders/${id}`, { method: 'DELETE' })
    router.push('/inventory/orders')
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-4">
      {[120, 80, 200].map((h, i) => (
        <div key={i} className="card animate-pulse" style={{ height: h }} />
      ))}
    </div>
  )

  if (!order) return (
    <div className="text-center py-24">
      <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
      <p className="text-slate-500 font-medium">Order not found</p>
      <Link href="/inventory/orders" className="btn-secondary mt-4 inline-flex">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>
    </div>
  )

  const status    = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING
  const canConfirm = order.status === 'PENDING'
  const canReceive = ['CONFIRMED', 'PARTIAL'].includes(order.status)
  const canCancel  = !['RECEIVED', 'CANCELLED'].includes(order.status)

  const totalItems    = order.items.reduce((s, i) => s + i.quantity,    0)
  const totalReceived = order.items.reduce((s, i) => s + i.receivedQty, 0)
  const valueReceived = order.items.reduce((s, i) => s + Number(i.unitPrice) * i.receivedQty, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/inventory/orders" className="btn-secondary px-3 py-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-mono">{order.orderNo}</h2>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${status.bg} ${status.text} ${status.border}`}>
              {status.icon} {status.label}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Created {format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}
            {order.updatedAt !== order.createdAt && (
              <span> · Updated {format(new Date(order.updatedAt), 'dd MMM yyyy')}</span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canConfirm && (
            <button onClick={handleConfirm} className="btn-primary bg-sky-600 hover:bg-sky-700">
              <CheckCircle className="w-4 h-4" /> Confirm Order
            </button>
          )}
          {canReceive && !receiving && (
            <button onClick={() => setReceiving(true)} className="btn-primary">
              <Package className="w-4 h-4" /> Receive Stock
            </button>
          )}
          {canCancel && (
            <button onClick={handleCancel} className="btn-secondary text-red-500 border-red-200 hover:bg-red-50">
              <XCircle className="w-4 h-4" /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* ── Status Timeline ──────────────────────────────────────────────── */}
      <div className="card p-4">
        <div className="flex items-center gap-0">
          {(['PENDING', 'CONFIRMED', 'PARTIAL', 'RECEIVED'] as const).map((s, i, arr) => {
            const cfg       = STATUS_CONFIG[s]
            const statuses  = ['PENDING', 'CONFIRMED', 'PARTIAL', 'RECEIVED', 'CANCELLED']
            const curIdx    = statuses.indexOf(order.status)
            const thisIdx   = statuses.indexOf(s)
            const isDone    = order.status === 'RECEIVED' ? true : curIdx > thisIdx
            const isCurrent = order.status === s
            const isCancelled = order.status === 'CANCELLED'

            return (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-semibold transition-all ${
                    isCancelled ? 'border-slate-200 text-slate-300'
                    : isCurrent ? `${cfg.border} ${cfg.text} ${cfg.bg}`
                    : isDone    ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                    :             'border-slate-200 text-slate-400'
                  }`}>
                    {isDone && !isCurrent ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-xs whitespace-nowrap font-medium ${isCurrent ? cfg.text : 'text-slate-400'}`}>
                    {cfg.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-4 ${isDone ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                )}
              </div>
            )
          })}
          {/* Cancelled node */}
          {order.status === 'CANCELLED' && (
            <div className="flex flex-col items-center gap-1 ml-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-red-300 bg-red-50 text-red-500">
                <XCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-red-500">Cancelled</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Info Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Supplier */}
        <div className="card p-4 sm:col-span-2">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">Supplier</p>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5 text-sky-600" />
            </div>
            <div className="flex-1 space-y-0.5">
              <p className="font-semibold text-slate-800">{order.supplier.name}</p>
              {order.supplier.contactPerson && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <User className="w-3 h-3" /> {order.supplier.contactPerson}
                </div>
              )}
              {order.supplier.phone && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Phone className="w-3 h-3" /> {order.supplier.phone}
                </div>
              )}
              {order.supplier.email && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Mail className="w-3 h-3" /> {order.supplier.email}
                </div>
              )}
              {order.supplier.gstin && (
                <p className="text-xs text-slate-400 font-mono">GSTIN: {order.supplier.gstin}</p>
              )}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="card p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">Dates</p>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-slate-400">Created</p>
              <p className="text-sm font-medium text-slate-700">{format(new Date(order.createdAt), 'dd MMM yyyy')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Expected</p>
              <p className="text-sm font-medium text-slate-700">
                {order.expectedDate ? format(new Date(order.expectedDate), 'dd MMM yyyy') : '—'}
              </p>
            </div>
            {order.receivedDate && (
              <div>
                <p className="text-xs text-slate-400">Received</p>
                <p className="text-sm font-semibold text-emerald-600">{format(new Date(order.receivedDate), 'dd MMM yyyy')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Value */}
        <div className="card p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">Value</p>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-slate-400">Order total</p>
              <p className="text-lg font-bold text-slate-800">{formatCurrency(order.totalAmount)}</p>
            </div>
            {valueReceived > 0 && (
              <div>
                <p className="text-xs text-slate-400">Received value</p>
                <p className="text-sm font-semibold text-emerald-600">{formatCurrency(valueReceived)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-400">Items progress</p>
              <ProgressBar received={totalReceived} total={totalItems} />
              <p className="text-xs text-slate-500 mt-1">{totalReceived} / {totalItems} units</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="card p-4 flex items-start gap-3">
          <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-slate-600 leading-relaxed">{order.notes}</p>
        </div>
      )}

      {/* ── Receive Mode Banner ──────────────────────────────────────────── */}
      {receiving && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-emerald-800 flex items-center gap-2">
                <Package className="w-4 h-4" /> Receiving Mode Active
              </p>
              <p className="text-sm text-emerald-600 mt-0.5">
                Update how many units you physically received. Leave 0 for items not yet arrived.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setReceiving(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleReceive} disabled={saving} className="btn-primary">
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : 'Confirm Receipt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Items Table ──────────────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">
            Order Items
            <span className="ml-2 text-sm font-normal text-slate-400">{order.items.length} product{order.items.length !== 1 ? 's' : ''}</span>
          </h3>
          <button onClick={fetchOrder} className="p-1.5 rounded hover:bg-slate-100 text-slate-400">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th>Product</th>
                <th>Ordered</th>
                <th>Received</th>
                <th>Pending</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
                <th>Current Stock</th>
                {receiving && <th>Receive Now</th>}
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => {
                const pending       = item.quantity - item.receivedQty
                const fullyReceived = pending <= 0
                const subtotal      = Number(item.unitPrice) * item.quantity

                return (
                  <tr key={item.id} className={`table-row ${fullyReceived && order.status !== 'RECEIVED' ? 'opacity-60' : ''}`}>
                    <td>
                      <p className="font-medium text-slate-800">{item.product.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{item.product.sku}</code>
                        <span className="badge-blue text-xs">{item.product.category.name}</span>
                      </div>
                    </td>

                    <td className="font-semibold text-slate-700">
                      {item.quantity}
                      <span className="text-xs text-slate-400 font-normal ml-1">{item.product.unit}</span>
                    </td>

                    <td>
                      <span className={`font-semibold ${item.receivedQty > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {item.receivedQty}
                      </span>
                    </td>

                    <td>
                      {fullyReceived
                        ? <span className="badge-green">Done</span>
                        : <span className="font-semibold text-amber-600">{pending}</span>
                      }
                    </td>

                    <td>{formatCurrency(item.unitPrice)}</td>

                    <td className="font-semibold text-emerald-700">{formatCurrency(subtotal)}</td>

                    <td>
                      <span className={`font-semibold text-sm ${
                        item.product.quantity === 0 ? 'text-red-600'
                        : item.product.quantity <= 10 ? 'text-amber-600'
                        : 'text-slate-700'
                      }`}>
                        {item.product.quantity}
                        <span className="text-xs font-normal text-slate-400 ml-1">{item.product.unit}</span>
                      </span>
                    </td>

                    {receiving && (
                      <td>
                        {fullyReceived
                          ? <span className="text-xs text-emerald-600 font-medium">✓ Complete</span>
                          : (
                            <input
                              type="number"
                              min="0"
                              max={pending}
                              className="input w-24 py-1.5 px-2 text-center"
                              value={receiveQty[item.id] ?? pending}
                              onChange={e => setReceiveQty(prev => ({
                                ...prev,
                                [item.id]: Math.min(pending, Math.max(0, parseInt(e.target.value) || 0)),
                              }))}
                            />
                          )
                        }
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>

            {/* Totals footer */}
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td className="px-4 py-3 font-semibold text-slate-700">Totals</td>
                <td className="px-4 py-3 font-semibold text-slate-700">{totalItems}</td>
                <td className="px-4 py-3 font-semibold text-emerald-600">{totalReceived}</td>
                <td className="px-4 py-3 font-semibold text-amber-600">{totalItems - totalReceived}</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 font-bold text-emerald-700">{formatCurrency(order.totalAmount)}</td>
                <td className="px-4 py-3"></td>
                {receiving && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Confirmed notice ─────────────────────────────────────────────── */}
      {order.status === 'CONFIRMED' && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sky-800">Order Confirmed</p>
            <p className="text-sm text-sky-600 mt-0.5">
              This order is confirmed with <strong>{order.supplier.name}</strong>.
              Click <strong>"Receive Stock"</strong> above when the goods arrive to update your inventory automatically.
            </p>
          </div>
        </div>
      )}

      {/* ── Received notice ──────────────────────────────────────────────── */}
      {order.status === 'RECEIVED' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-800">
              All stock received{order.receivedDate ? ` on ${format(new Date(order.receivedDate), 'dd MMM yyyy')}` : ''}
            </p>
            <p className="text-sm text-emerald-600 mt-0.5">
              Inventory quantities have been updated automatically for all {order.items.length} products.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}
