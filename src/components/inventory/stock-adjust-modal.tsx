// // src/components/inventory/stock-adjust-modal.tsx
// 'use client'
// import { useState } from 'react'
// import { X, ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react'

// interface Props {
//   product: { id: string; name: string; sku: string; quantity: number; unit: string }
//   onClose: () => void
//   onSuccess: () => void
// }

// const TYPES = [
//   { value: 'IN',         label: 'Stock In',    icon: ArrowDownCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
//   { value: 'OUT',        label: 'Stock Out',   icon: ArrowUpCircle,   color: 'text-red-600 bg-red-50 border-red-200' },
//   { value: 'ADJUSTMENT', label: 'Adjust',      icon: RefreshCw,       color: 'text-sky-600 bg-sky-50 border-sky-200' },
//   { value: 'RETURN',     label: 'Return',      icon: ArrowDownCircle, color: 'text-violet-600 bg-violet-50 border-violet-200' },
// ]

// export function StockAdjustModal({ product, onClose, onSuccess }: Props) {
//   const [type, setType]       = useState('IN')
//   const [quantity, setQty]    = useState('')
//   const [reason, setReason]   = useState('')
//   const [ref, setRef]         = useState('')
//   const [loading, setLoading] = useState(false)
//   const [error, setError]     = useState('')

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError('')
//     const qty = parseInt(quantity)
//     if (!qty || qty <= 0) { setError('Enter a valid quantity'); return }

//     setLoading(true)
//     const res = await fetch(`/api/products/${product.id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ _action: 'stock_adjust', type, quantity: qty, reason, reference: ref }),
//     })
//     const data = await res.json()
//     if (!res.ok) { setError(data.error || 'Failed'); setLoading(false); return }
//     onSuccess()
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-fade-in">
//         <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
//           <div>
//             <h3 className="font-semibold text-slate-900">Adjust Stock</h3>
//             <p className="text-xs text-slate-500">{product.name} · Current: <strong>{product.quantity} {product.unit}</strong></p>
//           </div>
//           <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-4 h-4" /></button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-4">
//           {/* Type selector */}
//           <div className="grid grid-cols-4 gap-2">
//             {TYPES.map(t => (
//               <button
//                 key={t.value}
//                 type="button"
//                 onClick={() => setType(t.value)}
//                 className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 text-xs font-medium transition-all ${
//                   type === t.value ? t.color + ' border-current' : 'border-slate-200 text-slate-500 hover:border-slate-300'
//                 }`}
//               >
//                 <t.icon className="w-4 h-4" />
//                 {t.label}
//               </button>
//             ))}
//           </div>

//           <div>
//             <label className="label">Quantity {type === 'ADJUSTMENT' ? '(Set to)' : ''}</label>
//             <input
//               type="number" min="1" className="input" required
//               placeholder={type === 'ADJUSTMENT' ? 'New total quantity' : 'Enter quantity'}
//               value={quantity} onChange={e => setQty(e.target.value)}
//             />
//           </div>

//           <div>
//             <label className="label">Reason <span className="text-slate-400">(optional)</span></label>
//             <input className="input" placeholder="e.g. Purchase order, Damaged goods…" value={reason} onChange={e => setReason(e.target.value)} />
//           </div>

//           <div>
//             <label className="label">Reference No. <span className="text-slate-400">(optional)</span></label>
//             <input className="input" placeholder="Invoice / PO number" value={ref} onChange={e => setRef(e.target.value)} />
//           </div>

//           {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

//           <div className="flex gap-3 pt-2">
//             <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
//             <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
//               {loading ? 'Saving…' : 'Confirm'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }
'use client'
import { useState } from 'react'
import { X, ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react'

interface Props {
  product: { id: string; name: string; sku: string; quantity: number; unit: string }
  onClose: () => void
  onSuccess: () => void
}

const TYPES = [
  { value: 'IN',         label: 'Stock In',  icon: ArrowDownCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { value: 'OUT',        label: 'Stock Out', icon: ArrowUpCircle,   color: 'text-red-600 bg-red-50 border-red-200' },
  { value: 'ADJUSTMENT', label: 'Adjust',    icon: RefreshCw,       color: 'text-sky-600 bg-sky-50 border-sky-200' },
  { value: 'RETURN',     label: 'Return',    icon: ArrowDownCircle, color: 'text-violet-600 bg-violet-50 border-violet-200' },
]

export function StockAdjustModal({ product, onClose, onSuccess }: Props) {
  const [type, setType]       = useState('IN')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // ✅ FIX: Plain state — not using inline function helpers that cause re-mount
  const [quantity, setQuantity] = useState('')
  const [reason, setReason]     = useState('')
  const [reference, setRef]     = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const qty = parseInt(quantity)
    if (!qty || qty <= 0) { setError('Enter a valid quantity'); return }

    setLoading(true)
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _action: 'stock_adjust', type, quantity: qty, reason, reference }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Something went wrong'); setLoading(false); return }
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-900">Adjust Stock</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {product.name} · Current: <strong>{product.quantity} {product.unit}</strong>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type selector */}
          <div className="grid grid-cols-4 gap-2">
            {TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 text-xs font-medium transition-all ${
                  type === t.value
                    ? t.color + ' border-current'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          <div>
            <label className="label">
              Quantity {type === 'ADJUSTMENT' ? '(set total to)' : ''}
            </label>
            {/* ✅ FIX: Direct value/onChange — no wrapper component */}
            <input
              type="number" min="1" required className="input"
              placeholder={type === 'ADJUSTMENT' ? 'New total quantity' : 'How many units?'}
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Reason <span className="text-slate-400">(optional)</span></label>
            <input
              className="input"
              placeholder="e.g. Purchase order received, Damaged goods…"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Reference No. <span className="text-slate-400">(optional)</span></label>
            <input
              className="input"
              placeholder="Invoice / PO number"
              value={reference}
              onChange={e => setRef(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? 'Saving…' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
