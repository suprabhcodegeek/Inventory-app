// src/components/dashboard/stats-cards.tsx
import { Package, TrendingUp, AlertTriangle, IndianRupee, ArrowUp, ArrowDown } from 'lucide-react'
import { formatCurrency, formatNumber } from '../../lib/utils'

interface StatsProps {
  totalProducts: number
  totalValue: number
  lowStockCount: number
  outOfStockCount: number
  topCategory: string
}

export function StatsCards({ totalProducts, totalValue, lowStockCount, outOfStockCount, topCategory }: StatsProps) {
  const stats = [
    {
      label: 'Total Products',
      value: formatNumber(totalProducts),
      sub: `${topCategory} is top category`,
      icon: Package,
      color: 'sky',
      trend: null,
    },
    {
      label: 'Inventory Value',
      value: formatCurrency(totalValue),
      sub: 'Total stock value (cost)',
      icon: IndianRupee,
      color: 'emerald',
      trend: { up: true, pct: '8.2%' },
    },
    {
      label: 'Low Stock Items',
      value: formatNumber(lowStockCount),
      sub: 'Need restocking soon',
      icon: AlertTriangle,
      color: 'amber',
      trend: null,
    },
    {
      label: 'Out of Stock',
      value: formatNumber(outOfStockCount),
      sub: 'Immediate action needed',
      icon: TrendingUp,
      color: 'red',
      trend: null,
    },
  ]

  const colorMap: Record<string, string> = {
    sky:     'bg-sky-50 text-sky-600 border-sky-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber:   'bg-amber-50 text-amber-600 border-amber-100',
    red:     'bg-red-50 text-red-600 border-red-100',
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="card p-5 flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${colorMap[s.color]}`}>
            <s.icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5 leading-tight">{s.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {s.trend && (
                s.trend.up
                  ? <ArrowUp className="w-3 h-3 text-emerald-500" />
                  : <ArrowDown className="w-3 h-3 text-red-500" />
              )}
              <p className="text-xs text-slate-400 truncate">{s.sub}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
