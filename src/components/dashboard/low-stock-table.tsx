// src/components/dashboard/low-stock-table.tsx
import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'

interface Product {
  id: string; name: string; sku: string; quantity: number; minStock: number;
  category: { name: string; color: string }
  supplier?: { name: string } | null
}

export function LowStockTable({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <div className="card p-8 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
          <AlertTriangle className="w-5 h-5 text-emerald-500" />
        </div>
        <p className="font-medium text-slate-700">All stock levels are healthy!</p>
        <p className="text-sm text-slate-400 mt-1">No items below minimum threshold</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-slate-800">Low Stock Alerts</h3>
          <span className="badge-red">{products.length}</span>
        </div>
        <Link href="/inventory?filter=low" className="text-xs text-sky-600 hover:underline flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="table-header">
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Min</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const pct = Math.round((p.quantity / p.minStock) * 100)
              return (
                <tr key={p.id} className="table-row">
                  <td>
                    <Link href={`/inventory/${p.id}`} className="font-medium text-slate-800 hover:text-sky-600">
                      {p.name}
                    </Link>
                    {p.supplier && <p className="text-xs text-slate-400">{p.supplier.name}</p>}
                  </td>
                  <td><code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{p.sku}</code></td>
                  <td>
                    <span className="badge-blue">{p.category.name}</span>
                  </td>
                  <td>
                    <span className={`font-semibold ${p.quantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {p.quantity}
                    </span>
                  </td>
                  <td><span className="text-slate-500">{p.minStock}</span></td>
                  <td>
                    {p.quantity === 0
                      ? <span className="badge-red">Out of Stock</span>
                      : <span className="badge-yellow">Low Stock</span>
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
