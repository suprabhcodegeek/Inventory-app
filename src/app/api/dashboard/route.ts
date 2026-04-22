// src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { db } from '../../../lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [products, categories, movements] = await Promise.all([
    db.product.findMany({ where: { isActive: true }, include: { category: true } }),
    db.category.findMany({ include: { _count: { select: { products: true } } } }),
    db.stockMovement.findMany({ orderBy: { createdAt: 'desc' }, take: 50, include: { product: true } }),
  ])

  const totalValue = products.reduce((s, p) => s + Number(p.costPrice) * p.quantity, 0)
  const lowStock   = products.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length
  const outOfStock = products.filter(p => p.quantity === 0).length

  return NextResponse.json({
    totalProducts: products.length,
    totalValue,
    lowStock,
    outOfStock,
    categories: categories.map(c => ({ name: c.name, count: c._count.products })),
  })
}
