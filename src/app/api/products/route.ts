// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { db } from '../../../lib/db'
import { z } from 'zod'
import { generateSKU } from '../../../lib/utils'

const ProductSchema = z.object({
  name:         z.string().min(1),
  description:  z.string().optional(),
  categoryId:   z.string().min(1),
  supplierId:   z.string().optional().nullable(),
  unit:         z.string().default('pcs'),
  costPrice:    z.number().min(0),
  sellingPrice: z.number().min(0),
  quantity:     z.number().int().min(0),
  minStock:     z.number().int().min(0).default(10),
  maxStock:     z.number().int().min(0).default(1000),
  location:     z.string().optional(),
  barcode:      z.string().optional(),
  sku:          z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const search   = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const filter   = searchParams.get('filter') || ''
  const page     = parseInt(searchParams.get('page') || '1')
  const limit    = parseInt(searchParams.get('limit') || '20')

  const where: any = { isActive: true }
  if (search)   where.OR = [
    { name:    { contains: search } },
    { sku:     { contains: search } },
    { barcode: { contains: search } },
  ]
  if (category) where.categoryId = category
  if (filter === 'low')  where.quantity = { lte: db.product.fields.minStock }
  if (filter === 'out')  where.quantity = 0

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: true, supplier: { select: { id: true, name: true } } },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.product.count({ where }),
  ])

  return NextResponse.json({ products, total, page, limit, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = ProductSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data } = parsed
  const category = await db.category.findUnique({ where: { id: data.categoryId } })
  const sku = data.sku || generateSKU(data.name, category?.name || 'GEN')

  const product = await db.product.create({
    data: {
      ...data,
      sku,
      costPrice:    data.costPrice,
      sellingPrice: data.sellingPrice,
    },
    include: { category: true, supplier: true },
  })

  // Record initial stock movement
  if (data.quantity > 0) {
    await db.stockMovement.create({
      data: {
        productId:    product.id,
        type:         'IN',
        quantity:     data.quantity,
        reason:       'Initial stock',
        balanceAfter: data.quantity,
      },
    })
  }

  return NextResponse.json(product, { status: 201 })
}
