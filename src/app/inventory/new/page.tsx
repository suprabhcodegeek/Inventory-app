// // src/app/inventory/new/page.tsx  (also used for /inventory/[id]/edit via shared component)
// 'use client'
// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { ArrowLeft, Save, Sparkles } from 'lucide-react'
// import { generateSKU } from '../../../lib/utils'

// const UNITS = ['pcs', 'kg', 'g', 'ltr', 'ml', 'box', 'bag', 'roll', 'set', 'pair', 'dozen', 'meter']

// export default function NewProductPage() {
//   const router = useRouter()
//   const [saving, setSaving] = useState(false)
//   const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
//   const [suppliers, setSuppliers]   = useState<{ id: string; name: string }[]>([])
//   const [errors, setErrors]         = useState<Record<string, string>>({})

//   const [form, setForm] = useState({
//     name: '', description: '', categoryId: '', supplierId: '',
//     unit: 'pcs', costPrice: '', sellingPrice: '',
//     quantity: '', minStock: '10', maxStock: '1000',
//     location: '', barcode: '', sku: '',
//   })

//   useEffect(() => {
//     Promise.all([
//       fetch('/api/categories').then(r => r.json()),
//       fetch('/api/suppliers').then(r => r.json()),
//     ]).then(([cats, sups]) => {
//       setCategories(cats); setSuppliers(sups)
//     })
//   }, [])

//   const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
//     setForm(f => ({ ...f, [k]: e.target.value }))

//   const autoSKU = () => {
//     const cat = categories.find(c => c.id === form.categoryId)
//     if (form.name && cat) setForm(f => ({ ...f, sku: generateSKU(form.name, cat.name) }))
//   }

//   const validate = () => {
//     const e: Record<string, string> = {}
//     if (!form.name)        e.name = 'Product name is required'
//     if (!form.categoryId)  e.categoryId = 'Category is required'
//     if (!form.costPrice)   e.costPrice = 'Cost price is required'
//     if (!form.quantity)    e.quantity = 'Initial quantity is required'
//     setErrors(e)
//     return Object.keys(e).length === 0
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!validate()) return
//     setSaving(true)

//     const payload = {
//       ...form,
//       costPrice:    parseFloat(form.costPrice || '0'),
//       sellingPrice: parseFloat(form.sellingPrice || '0'),
//       quantity:     parseInt(form.quantity || '0'),
//       minStock:     parseInt(form.minStock || '10'),
//       maxStock:     parseInt(form.maxStock || '1000'),
//       supplierId:   form.supplierId || null,
//     }

//     const res = await fetch('/api/products', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload),
//     })

//     if (res.ok) {
//       router.push('/inventory')
//       router.refresh()
//     } else {
//       const data = await res.json()
//       console.error(data)
//     }
//     setSaving(false)
//   }

//   const F = ({ label, name, children, required }: any) => (
//     <div>
//       <label className="label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
//       {children}
//       {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
//     </div>
//   )

//   return (
//     <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
//       <div className="flex items-center gap-3">
//         <Link href="/inventory" className="btn-secondary px-3 py-2">
//           <ArrowLeft className="w-4 h-4" />
//         </Link>
//         <div>
//           <h2 className="text-xl font-bold text-slate-900">Add New Product</h2>
//           <p className="text-sm text-slate-500">Fill in the details below to add to inventory</p>
//         </div>
//       </div>

//       {/* Basic Info */}
//       <div className="card p-6 space-y-4">
//         <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Basic Information</h3>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <F label="Product Name" name="name" required>
//             <input className="input" value={form.name} onChange={set('name')} placeholder="e.g. Basmati Rice 1kg" />
//           </F>
//           <F label="Category" name="categoryId" required>
//             <select className="input" value={form.categoryId} onChange={set('categoryId')}>
//               <option value="">Select category…</option>
//               {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
//             </select>
//           </F>
//           <F label="SKU / Product Code" name="sku">
//             <div className="flex gap-2">
//               <input className="input flex-1" value={form.sku} onChange={set('sku')} placeholder="Auto-generated" />
//               <button type="button" onClick={autoSKU} className="btn-secondary px-3 py-2" title="Auto-generate SKU">
//                 <Sparkles className="w-4 h-4" />
//               </button>
//             </div>
//           </F>
//           <F label="Supplier" name="supplierId">
//             <select className="input" value={form.supplierId} onChange={set('supplierId')}>
//               <option value="">No supplier</option>
//               {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
//             </select>
//           </F>
//           <div className="sm:col-span-2">
//             <F label="Description" name="description">
//               <textarea className="input resize-none" rows={2} value={form.description} onChange={set('description')} placeholder="Optional description…" />
//             </F>
//           </div>
//         </div>
//       </div>

//       {/* Pricing & Stock */}
//       <div className="card p-6 space-y-4">
//         <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Pricing & Stock</h3>
//         <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
//           <F label="Unit" name="unit">
//             <select className="input" value={form.unit} onChange={set('unit')}>
//               {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
//             </select>
//           </F>
//           <F label="Cost Price (₹)" name="costPrice" required>
//             <input type="number" step="0.01" min="0" className="input" value={form.costPrice} onChange={set('costPrice')} placeholder="0.00" />
//           </F>
//           <F label="Selling Price (₹)" name="sellingPrice">
//             <input type="number" step="0.01" min="0" className="input" value={form.sellingPrice} onChange={set('sellingPrice')} placeholder="0.00" />
//           </F>
//           <F label="Initial Quantity" name="quantity" required>
//             <input type="number" min="0" className="input" value={form.quantity} onChange={set('quantity')} placeholder="0" />
//           </F>
//           <F label="Min Stock Alert" name="minStock">
//             <input type="number" min="0" className="input" value={form.minStock} onChange={set('minStock')} />
//           </F>
//           <F label="Max Stock" name="maxStock">
//             <input type="number" min="0" className="input" value={form.maxStock} onChange={set('maxStock')} />
//           </F>
//         </div>
//       </div>

//       {/* Location */}
//       <div className="card p-6 space-y-4">
//         <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Storage Details</h3>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <F label="Storage Location" name="location">
//             <input className="input" value={form.location} onChange={set('location')} placeholder="e.g. Rack A - Shelf 3" />
//           </F>
//           <F label="Barcode" name="barcode">
//             <input className="input" value={form.barcode} onChange={set('barcode')} placeholder="Scan or type barcode" />
//           </F>
//         </div>
//       </div>

//       <div className="flex gap-3 justify-end">
//         <Link href="/inventory" className="btn-secondary">Cancel</Link>
//         <button type="submit" disabled={saving} className="btn-primary">
//           <Save className="w-4 h-4" />
//           {saving ? 'Saving…' : 'Save Product'}
//         </button>
//       </div>
//     </form>
//   )
// }
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Sparkles } from 'lucide-react'
import { generateSKU } from '../../../lib/utils'

// ✅ FIX: FormField is defined OUTSIDE the page component.
// When it was inside, React saw it as a new component on every
// keystroke → unmounted the input → you lost focus after 1 letter.
interface FormFieldProps {
  label: string
  name: string
  required?: boolean
  error?: string
  children: React.ReactNode
}
function FormField({ label, name, required, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

const UNITS = ['pcs', 'kg', 'g', 'ltr', 'ml', 'box', 'bag', 'roll', 'set', 'pair', 'dozen', 'meter']

export default function NewProductPage() {
  const router = useRouter()
  const [saving, setSaving]       = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [suppliers, setSuppliers]   = useState<{ id: string; name: string }[]>([])
  const [errors, setErrors]         = useState<Record<string, string>>({})

  // ✅ FIX: All form fields in a single state object — no scattered useState calls
  const [form, setForm] = useState({
    name: '', description: '', categoryId: '', supplierId: '',
    unit: 'pcs', costPrice: '', sellingPrice: '',
    quantity: '', minStock: '10', maxStock: '1000',
    location: '', barcode: '', sku: '',
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/suppliers').then(r => r.json()),
    ]).then(([cats, sups]) => {
      setCategories(Array.isArray(cats) ? cats : [])
      setSuppliers(Array.isArray(sups) ? sups : [])
    })
  }, [])

  // ✅ FIX: Single generic change handler — stable reference, no re-render issues
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear error on change
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const autoSKU = () => {
    const cat = categories.find(c => c.id === form.categoryId)
    if (form.name && cat) {
      setForm(prev => ({ ...prev, sku: generateSKU(form.name, cat.name) }))
    }
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name)       e.name       = 'Product name is required'
    if (!form.categoryId) e.categoryId = 'Category is required'
    if (!form.costPrice)  e.costPrice  = 'Cost price is required'
    if (!form.quantity)   e.quantity   = 'Initial quantity is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)

    const payload = {
      ...form,
      costPrice:    parseFloat(form.costPrice   || '0'),
      sellingPrice: parseFloat(form.sellingPrice || '0'),
      quantity:     parseInt(form.quantity   || '0'),
      minStock:     parseInt(form.minStock   || '10'),
      maxStock:     parseInt(form.maxStock   || '1000'),
      supplierId:   form.supplierId || null,
    }

    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      router.push('/inventory')
      router.refresh()
    } else {
      const data = await res.json()
      console.error(data)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/inventory" className="btn-secondary px-3 py-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Add New Product</h2>
          <p className="text-sm text-slate-500">Fill in the details to add to inventory</p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <FormField label="Product Name" name="name" required error={errors.name}>
            <input
              id="name" name="name" className="input"
              value={form.name} onChange={handleChange}
              placeholder="e.g. Basmati Rice 1kg"
            />
          </FormField>

          <FormField label="Category" name="categoryId" required error={errors.categoryId}>
            <select id="categoryId" name="categoryId" className="input" value={form.categoryId} onChange={handleChange}>
              <option value="">Select category…</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>

          <FormField label="SKU / Product Code" name="sku" error={errors.sku}>
            <div className="flex gap-2">
              <input
                id="sku" name="sku" className="input flex-1"
                value={form.sku} onChange={handleChange}
                placeholder="Auto-generated if empty"
              />
              <button type="button" onClick={autoSKU} className="btn-secondary px-3 py-2" title="Auto-generate SKU">
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </FormField>

          <FormField label="Supplier" name="supplierId" error={errors.supplierId}>
            <select id="supplierId" name="supplierId" className="input" value={form.supplierId} onChange={handleChange}>
              <option value="">No supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </FormField>

          <div className="sm:col-span-2">
            <FormField label="Description" name="description">
              <textarea
                id="description" name="description"
                className="input resize-none" rows={2}
                value={form.description} onChange={handleChange}
                placeholder="Optional product description…"
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Pricing & Stock</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

          <FormField label="Unit" name="unit">
            <select id="unit" name="unit" className="input" value={form.unit} onChange={handleChange}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </FormField>

          <FormField label="Cost Price (₹)" name="costPrice" required error={errors.costPrice}>
            <input
              id="costPrice" name="costPrice" type="number"
              step="0.01" min="0" className="input"
              value={form.costPrice} onChange={handleChange}
              placeholder="0.00"
            />
          </FormField>

          <FormField label="Selling Price (₹)" name="sellingPrice" error={errors.sellingPrice}>
            <input
              id="sellingPrice" name="sellingPrice" type="number"
              step="0.01" min="0" className="input"
              value={form.sellingPrice} onChange={handleChange}
              placeholder="0.00"
            />
          </FormField>

          <FormField label="Initial Quantity" name="quantity" required error={errors.quantity}>
            <input
              id="quantity" name="quantity" type="number"
              min="0" className="input"
              value={form.quantity} onChange={handleChange}
              placeholder="0"
            />
          </FormField>

          <FormField label="Min Stock Alert" name="minStock">
            <input
              id="minStock" name="minStock" type="number"
              min="0" className="input"
              value={form.minStock} onChange={handleChange}
            />
          </FormField>

          <FormField label="Max Stock" name="maxStock">
            <input
              id="maxStock" name="maxStock" type="number"
              min="0" className="input"
              value={form.maxStock} onChange={handleChange}
            />
          </FormField>
        </div>
      </div>

      {/* Storage */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Storage Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <FormField label="Storage Location" name="location">
            <input
              id="location" name="location" className="input"
              value={form.location} onChange={handleChange}
              placeholder="e.g. Rack A - Shelf 3"
            />
          </FormField>

          <FormField label="Barcode" name="barcode">
            <input
              id="barcode" name="barcode" className="input"
              value={form.barcode} onChange={handleChange}
              placeholder="Scan or type barcode"
            />
          </FormField>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Link href="/inventory" className="btn-secondary">Cancel</Link>
        <button type="submit" disabled={saving} className="btn-primary">
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Product'}
        </button>
      </div>
    </form>
  )
}
