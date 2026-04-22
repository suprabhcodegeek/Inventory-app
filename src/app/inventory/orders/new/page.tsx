'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Save, Search } from 'lucide-react'
import { formatCurrency } from '../../../../lib/utils'

interface Product { id: string; name: string; sku: string; unit: string; costPrice: string }
interface Supplier { id: string; name: string }
interface OrderItem { productId: string; productName: string; sku: string; unit: string; quantity: number; unitPrice: number }

// ✅ FIX: All helper UI outside main component — no focus loss
function FormField({ label, required, children, error }: { label: string; required?: boolean; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

export default function NewOrderPage() {
  const router  = useRouter()
  const [saving, setSaving]         = useState(false)
  const [suppliers, setSuppliers]   = useState<Supplier[]>([])
  const [products, setProducts]     = useState<Product[]>([])
  const [search, setSearch]         = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [items, setItems]           = useState<OrderItem[]>([])
  const [errors, setErrors]         = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    supplierId:   '',
    expectedDate: '',
    notes:        '',
  })

  useEffect(() => {
    fetch('/api/suppliers').then(r => r.json()).then(d => setSuppliers(Array.isArray(d) ? d : []))
  }, [])

  useEffect(() => {
    if (!search) { setProducts([]); return }
    const timer = setTimeout(async () => {
      const res  = await fetch(`/api/products?search=${encodeURIComponent(search)}&limit=8`)
      const data = await res.json()
      setProducts(data.products || [])
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const addProduct = (product: Product) => {
    const exists = items.find(i => i.productId === product.id)
    if (exists) {
      setItems(prev => prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i))
    } else {
      setItems(prev => [...prev, {
        productId:   product.id,
        productName: product.name,
        sku:         product.sku,
        unit:        product.unit,
        quantity:    1,
        unitPrice:   parseFloat(product.costPrice) || 0,
      }])
    }
    setSearch('')
    setProducts([])
    setShowSearch(false)
  }

  const updateItem = (productId: string, field: 'quantity' | 'unitPrice', value: number) => {
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, [field]: value } : i))
  }

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }

  const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.supplierId) e.supplierId = 'Supplier is required'
    if (items.length === 0) e.items = 'Add at least one product'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)

    const payload = {
      ...form,
      items: items.map(i => ({
        productId: i.productId,
        quantity:  i.quantity,
        unitPrice: i.unitPrice,
      })),
    }

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      router.push('/inventory/orders')
      router.refresh()
    } else {
      const data = await res.json()
      console.error(data)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/inventory/orders" className="btn-secondary px-3 py-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">New Purchase Order</h2>
          <p className="text-sm text-slate-500">Create an order for restocking products</p>
        </div>
      </div>

      {/* Order Details */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Order Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <FormField label="Supplier" required error={errors.supplierId}>
            <select name="supplierId" className="input" value={form.supplierId} onChange={handleChange}>
              <option value="">Select supplier…</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </FormField>

          <FormField label="Expected Delivery Date">
            <input
              type="date" name="expectedDate" className="input"
              value={form.expectedDate} onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </FormField>

          <div className="sm:col-span-2">
            <FormField label="Notes">
              <textarea
                name="notes" className="input resize-none" rows={2}
                value={form.notes} onChange={handleChange}
                placeholder="Any special instructions for this order…"
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">Products to Order</h3>

        {/* Product Search */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="input pl-9"
                placeholder="Search product name or SKU to add…"
                value={search}
                onChange={e => { setSearch(e.target.value); setShowSearch(true) }}
                onFocus={() => setShowSearch(true)}
              />
            </div>
          </div>

          {/* Search Results Dropdown */}
          {showSearch && products.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden">
              {products.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addProduct(p)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 text-left transition-colors border-b border-slate-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.sku} · {p.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-emerald-600">{formatCurrency(p.costPrice)}</p>
                    <p className="text-xs text-slate-400">cost price</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {errors.items && <p className="text-red-500 text-xs">{errors.items}</p>}

        {/* Items Table */}
        {items.length > 0 ? (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th>Product</th>
                  <th className="w-28">Qty</th>
                  <th className="w-32">Unit Price (₹)</th>
                  <th className="w-28">Subtotal</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.productId} className="table-row">
                    <td>
                      <p className="font-medium text-slate-800">{item.productName}</p>
                      <p className="text-xs text-slate-400">{item.sku} · {item.unit}</p>
                    </td>
                    <td>
                      {/* ✅ FIX: Direct onChange, no wrapper */}
                      <input
                        type="number" min="1" className="input text-center py-1.5 px-2"
                        value={item.quantity}
                        onChange={e => updateItem(item.productId, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </td>
                    <td>
                      <input
                        type="number" min="0" step="0.01" className="input py-1.5 px-2"
                        value={item.unitPrice}
                        onChange={e => updateItem(item.productId, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="font-semibold text-emerald-700 text-sm">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200">
                  <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">
                    Total Order Value:
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-700">
                    {formatCurrency(totalAmount)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-200 rounded-xl py-10 text-center">
            <Plus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Search and add products above</p>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3 justify-end">
        <Link href="/inventory/orders" className="btn-secondary">Cancel</Link>
        <button type="submit" disabled={saving || items.length === 0} className="btn-primary">
          <Save className="w-4 h-4" />
          {saving ? 'Creating…' : 'Create Order'}
        </button>
      </div>
    </form>
  )
}
