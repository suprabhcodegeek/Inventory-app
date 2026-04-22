// src/app/dashboard/page.tsx
import { db } from '../../lib/db'
import { StatsCards } from '../../components/dashboard/stats-cards'
import { CategoryPieChart, StockMovementChart, TopProductsChart } from '../../components/dashboard/charts'
import { LowStockTable } from '../../components/dashboard/low-stock-table'
import { RecentActivity } from '../../components/dashboard/recent-activity'
import { subDays, format } from 'date-fns'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  const [
    totalProducts,
    products,
    categories,
    lowStock,
    recentMovements,
  ] = await Promise.all([
    db.product.count({ where: { isActive: true } }),
    db.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { quantity: 'asc' },
    }),
    db.category.findMany({ include: { _count: { select: { products: true } } } }),
    db.product.findMany({
      where: { isActive: true, quantity: { lte: db.product.fields.minStock } },
      include: { category: true, supplier: true },
      orderBy: { quantity: 'asc' },
      take: 10,
    }),
    db.stockMovement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { product: true },
    }),
  ])

  const totalValue = products.reduce((sum, p) => sum + Number(p.costPrice) * p.quantity, 0)
  const outOfStock = products.filter(p => p.quantity === 0).length
  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length

  const topCategory = categories.sort((a, b) => b._count.products - a._count.products)[0]?.name || '—'

  // Category distribution for pie chart
  const categoryData = categories.map((c) => ({
    name: c.name,
    count: c._count.products,
    value: c._count.products,
  }))

  // Stock movement last 7 days
  const movementData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i)
    const dayStr = format(day, 'dd MMM')
    const dayMovements = recentMovements.filter(m =>
      format(m.createdAt, 'dd MMM') === dayStr
    )
    return {
      date: dayStr,
      in:  dayMovements.filter(m => m.type === 'IN').reduce((s, m) => s + m.quantity, 0),
      out: dayMovements.filter(m => m.type === 'OUT').reduce((s, m) => s + m.quantity, 0),
    }
  })

  // Top products by qty
  const topProducts = [...products]
    .sort((a, b) => Number(b.costPrice) * b.quantity - Number(a.costPrice) * a.quantity)
    .slice(0, 5)
    .map(p => ({ name: p.name.substring(0, 18), qty: p.quantity }))

  // Low stock products (qty <= minStock)
  const lowStockProducts = products
    .filter(p => p.quantity <= p.minStock)
    .slice(0, 8)

  return {
    totalProducts,
    totalValue,
    lowStockCount,
    outOfStockCount: outOfStock,
    topCategory,
    categoryData,
    movementData,
    topProducts,
    lowStockProducts,
    recentMovements,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      {/* Stats */}
      <StatsCards
        totalProducts={data.totalProducts}
        totalValue={data.totalValue}
        lowStockCount={data.lowStockCount}
        outOfStockCount={data.outOfStockCount}
        topCategory={data.topCategory}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <StockMovementChart data={data.movementData} />
        </div>
        <CategoryPieChart data={data.categoryData} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <LowStockTable products={data.lowStockProducts} />
        </div>
        <div className="space-y-4">
          <TopProductsChart data={data.topProducts} />
          <RecentActivity movements={data.recentMovements} />
        </div>
      </div>
    </div>
  )
}
