// src/app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { db } from '../../../lib/db'
import { subDays, format, startOfDay, endOfDay } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'overview'

  if (type === 'stock_value') {
    const products = await db.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { quantity: 'desc' },
    })
    const data = products.map(p => ({
      id: p.id, name: p.name, sku: p.sku,
      category: p.category.name,
      quantity: p.quantity,
      costPrice: Number(p.costPrice),
      sellingPrice: Number(p.sellingPrice),
      stockValue: Number(p.costPrice) * p.quantity,
      potentialRevenue: Number(p.sellingPrice) * p.quantity,
    }))
    return NextResponse.json(data)
  }

  if (type === 'movement') {
    const days = parseInt(searchParams.get('days') || '30')
    const from = startOfDay(subDays(new Date(), days))
    const movements = await db.stockMovement.findMany({
      where: { createdAt: { gte: from } },
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(movements)
  }

  if (type === 'low_stock') {
    const products = await db.product.findMany({
      where: { isActive: true, quantity: { lte: db.product.fields.minStock } },
      include: { category: true, supplier: true },
      orderBy: { quantity: 'asc' },
    })
    return NextResponse.json(products)
  }

  // Overview summary
  const [totalProducts, totalValue, categories, lowStock] = await Promise.all([
    db.product.count({ where: { isActive: true } }),
    db.product.aggregate({
      where: { isActive: true },
      _sum: { quantity: true },
    }),
    db.category.count(),
    db.product.count({ where: { isActive: true, quantity: { lte: db.product.fields.minStock } } }),
  ])

  return NextResponse.json({ totalProducts, totalValue, categories, lowStock })
}
