// // src/app/suppliers/page.tsx
// 'use client'
// import { useState, useEffect } from 'react'
// import { Plus, Truck, Edit2, Phone, Mail, Package } from 'lucide-react'
// import Link from 'next/link'

// interface Supplier {
//   id: string; name: string; contactPerson?: string; email?: string
//   phone?: string; gstin?: string; isActive: boolean
//   _count: { products: number }
// }

// export default function SuppliersPage() {
//   const [suppliers, setSuppliers] = useState<Supplier[]>([])
//   const [loading, setLoading]     = useState(true)
//   const [showForm, setShowForm]   = useState(false)
//   const [form, setForm]           = useState({ name: '', contactPerson: '', email: '', phone: '', address: '', gstin: '' })
//   const [saving, setSaving]       = useState(false)

//   const fetchSuppliers = async () => {
//     setLoading(true)
//     const res = await fetch('/api/suppliers')
//     const data = await res.json()
//     setSuppliers(data); setLoading(false)
//   }

//   useEffect(() => { fetchSuppliers() }, [])

//   const handleSave = async (e: React.FormEvent) => {
//     e.preventDefault(); setSaving(true)
//     await fetch('/api/suppliers', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(form),
//     })
//     setShowForm(false)
//     setForm({ name: '', contactPerson: '', email: '', phone: '', address: '', gstin: '' })
//     fetchSuppliers(); setSaving(false)
//   }

//   const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
//     setForm(f => ({ ...f, [k]: e.target.value }))

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <p className="text-slate-500 text-sm">{suppliers.length} active suppliers</p>
//         <button onClick={() => setShowForm(true)} className="btn-primary">
//           <Plus className="w-4 h-4" /> Add Supplier
//         </button>
//       </div>

//       {/* Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
//         {loading ? Array.from({ length: 6 }).map((_, i) => (
//           <div key={i} className="card p-5 h-36 animate-pulse bg-slate-100" />
//         )) : suppliers.map(s => (
//           <div key={s.id} className="card p-5 hover:shadow-md transition-shadow group">
//             <div className="flex items-start justify-between mb-3">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
//                   <Truck className="w-5 h-5 text-sky-600" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-slate-800">{s.name}</h3>
//                   {s.contactPerson && <p className="text-xs text-slate-500">{s.contactPerson}</p>}
//                 </div>
//               </div>
//               <span className="badge-blue flex items-center gap-1">
//                 <Package className="w-3 h-3" /> {s._count.products}
//               </span>
//             </div>

//             <div className="space-y-1.5 mb-4">
//               {s.email && (
//                 <div className="flex items-center gap-2 text-xs text-slate-500">
//                   <Mail className="w-3.5 h-3.5" /> {s.email}
//                 </div>
//               )}
//               {s.phone && (
//                 <div className="flex items-center gap-2 text-xs text-slate-500">
//                   <Phone className="w-3.5 h-3.5" /> {s.phone}
//                 </div>
//               )}
//               {s.gstin && (
//                 <div className="text-xs text-slate-400 font-mono">GSTIN: {s.gstin}</div>
//               )}
//             </div>

//             <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//               <Link href={`/suppliers/${s.id}`} className="btn-secondary text-xs px-3 py-1.5 flex-1 justify-center">
//                 View Products
//               </Link>
//               <button className="btn-secondary px-2 py-1.5">
//                 <Edit2 className="w-3.5 h-3.5" />
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Add Supplier Modal */}
//       {showForm && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-fade-in">
//             <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
//               <h3 className="font-semibold text-slate-900">Add New Supplier</h3>
//               <button onClick={() => setShowForm(false)} className="p-1.5 rounded hover:bg-slate-100 text-slate-500">✕</button>
//             </div>
//             <form onSubmit={handleSave} className="p-6 grid grid-cols-2 gap-4">
//               <div className="col-span-2">
//                 <label className="label">Company Name *</label>
//                 <input required className="input" value={form.name} onChange={set('name')} placeholder="e.g. Sharma Trading Co." />
//               </div>
//               <div>
//                 <label className="label">Contact Person</label>
//                 <input className="input" value={form.contactPerson} onChange={set('contactPerson')} placeholder="Full name" />
//               </div>
//               <div>
//                 <label className="label">Phone</label>
//                 <input className="input" value={form.phone} onChange={set('phone')} placeholder="10-digit mobile" />
//               </div>
//               <div>
//                 <label className="label">Email</label>
//                 <input type="email" className="input" value={form.email} onChange={set('email')} placeholder="contact@supplier.com" />
//               </div>
//               <div>
//                 <label className="label">GSTIN</label>
//                 <input className="input" value={form.gstin} onChange={set('gstin')} placeholder="27AAACS1234A1Z1" />
//               </div>
//               <div className="col-span-2">
//                 <label className="label">Address</label>
//                 <textarea className="input resize-none" rows={2} value={form.address} onChange={set('address')} placeholder="Full address…" />
//               </div>
//               <div className="col-span-2 flex gap-3 justify-end pt-2">
//                 <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
//                 <button type="submit" disabled={saving} className="btn-primary">
//                   {saving ? 'Saving…' : 'Add Supplier'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
'use client'
import { useState, useEffect } from 'react'
import { Plus, Truck, Edit2, Phone, Mail, Package } from 'lucide-react'
import Link from 'next/link'

interface Supplier {
  id: string; name: string; contactPerson?: string; email?: string
  phone?: string; gstin?: string; isActive: boolean
  _count: { products: number }
}

// ✅ FIX: FormField defined outside — stops React unmounting input on every keystroke
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

const EMPTY_FORM = { name: '', contactPerson: '', email: '', phone: '', address: '', gstin: '' }

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)

  const fetchSuppliers = async () => {
    setLoading(true)
    const res = await fetch('/api/suppliers')
    const data = await res.json()
    setSuppliers(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchSuppliers() }, [])

  // ✅ FIX: Single generic handler using input name attribute
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowForm(false)
      setForm(EMPTY_FORM)
      fetchSuppliers()
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-500 text-sm">{suppliers.length} active suppliers</p>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-5 h-36 animate-pulse bg-slate-100" />
            ))
          : suppliers.map(s => (
              <div key={s.id} className="card p-5 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{s.name}</h3>
                      {s.contactPerson && <p className="text-xs text-slate-500">{s.contactPerson}</p>}
                    </div>
                  </div>
                  <span className="badge-blue flex items-center gap-1">
                    <Package className="w-3 h-3" /> {s._count.products}
                  </span>
                </div>

                <div className="space-y-1.5 mb-4">
                  {s.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Mail className="w-3.5 h-3.5" /> {s.email}
                    </div>
                  )}
                  {s.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone className="w-3.5 h-3.5" /> {s.phone}
                    </div>
                  )}
                  {s.gstin && (
                    <div className="text-xs text-slate-400 font-mono">GSTIN: {s.gstin}</div>
                  )}
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/suppliers/${s.id}`} className="btn-secondary text-xs px-3 py-1.5 flex-1 justify-center">
                    View Products
                  </Link>
                  <button className="btn-secondary px-2 py-1.5">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
      </div>

      {/* Add Supplier Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Add New Supplier</h3>
              <button
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
                className="p-1.5 rounded hover:bg-slate-100 text-slate-500 text-lg leading-none"
              >✕</button>
            </div>

            {/* ✅ FIX: All inputs use name= + single handleChange — no focus loss */}
            <form onSubmit={handleSave} className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <FormField label="Company Name *">
                  <input
                    required name="name" className="input"
                    value={form.name} onChange={handleChange}
                    placeholder="e.g. Sharma Trading Co."
                  />
                </FormField>
              </div>

              <FormField label="Contact Person">
                <input
                  name="contactPerson" className="input"
                  value={form.contactPerson} onChange={handleChange}
                  placeholder="Full name"
                />
              </FormField>

              <FormField label="Phone">
                <input
                  name="phone" className="input"
                  value={form.phone} onChange={handleChange}
                  placeholder="10-digit mobile"
                />
              </FormField>

              <FormField label="Email">
                <input
                  type="email" name="email" className="input"
                  value={form.email} onChange={handleChange}
                  placeholder="contact@supplier.com"
                />
              </FormField>

              <FormField label="GSTIN">
                <input
                  name="gstin" className="input"
                  value={form.gstin} onChange={handleChange}
                  placeholder="27AAACS1234A1Z1"
                />
              </FormField>

              <div className="col-span-2">
                <FormField label="Address">
                  <textarea
                    name="address" className="input resize-none" rows={2}
                    value={form.address} onChange={handleChange}
                    placeholder="Full address…"
                  />
                </FormField>
              </div>

              <div className="col-span-2 flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
                  className="btn-secondary"
                >Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving…' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
