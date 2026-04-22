// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { db } from '../../../lib/db'
import { z } from 'zod'
import { generateOrderNo } from '../../../lib/utils'

const OrderItemSchema = z.object({
  productId: z.string().min(1),
  quantity:  z.number().int().min(1),
  unitPrice: z.number().min(0),
})

const OrderSchema = z.object({
  supplierId:   z.string().min(1),
  expectedDate: z.string().optional(),
  notes:        z.string().optional(),
  items:        z.array(OrderItemSchema).min(1, 'At least one item is required'),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status     = searchParams.get('status') || ''
  const supplierId = searchParams.get('supplierId') || ''
  const page       = parseInt(searchParams.get('page') || '1')
  const limit      = parseInt(searchParams.get('limit') || '20')

  const where: any = {}
  if (status)     where.status     = status
  if (supplierId) where.supplierId = supplierId

  const [orders, total] = await Promise.all([
    db.purchaseOrder.findMany({
      where,
      include: {
        supplier: { select: { id: true, name: true } },
        items: {
          include: { product: { select: { id: true, name: true, sku: true, unit: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.purchaseOrder.count({ where }),
  ])

  return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = OrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { supplierId, expectedDate, notes, items } = parsed.data

  // Calculate total amount
  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  const order = await db.purchaseOrder.create({
    data: {
      orderNo:      generateOrderNo(),
      supplierId,
      totalAmount,
      notes,
      expectedDate: expectedDate ? new Date(expectedDate) : undefined,
      status:       'PENDING',
      items: {
        create: items.map(item => ({
          productId:   item.productId,
          quantity:    item.quantity,
          unitPrice:   item.unitPrice,
          receivedQty: 0,
        })),
      },
    },
    include: {
      supplier: true,
      items: { include: { product: true } },
    },
  })

  return NextResponse.json(order, { status: 201 })
}
