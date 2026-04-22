// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { db } from '../../../../lib/db'
import { z } from 'zod'

const UpdateSchema = z.object({
  name:         z.string().min(1).optional(),
  description:  z.string().optional(),
  categoryId:   z.string().optional(),
  supplierId:   z.string().optional().nullable(),
  unit:         z.string().optional(),
  costPrice:    z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  minStock:     z.number().int().min(0).optional(),
  maxStock:     z.number().int().min(0).optional(),
  location:     z.string().optional(),
  barcode:      z.string().optional(),
  isActive:     z.boolean().optional(),
})

const StockAdjSchema = z.object({
  type:      z.enum(['IN', 'OUT', 'ADJUSTMENT', 'RETURN']),
  quantity:  z.number().int().min(1),
  reason:    z.string().optional(),
  reference: z.string().optional(),
})

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const product = await db.product.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      supplier: true,
      stockMovements: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  })

  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Stock adjustment endpoint
  if (body._action === 'stock_adjust') {
    const parsed = StockAdjSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const product = await db.product.findUnique({ where: { id: params.id } })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { type, quantity, reason, reference } = parsed.data
    let newQty = product.quantity

    if (type === 'IN' || type === 'RETURN') newQty += quantity
    else if (type === 'OUT') {
      if (quantity > product.quantity) return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
      newQty -= quantity
    } else {
      newQty = quantity // ADJUSTMENT = set absolute value
    }

    const [updated] = await db.$transaction([
      db.product.update({ where: { id: params.id }, data: { quantity: newQty } }),
      db.stockMovement.create({
        data: { productId: params.id, type, quantity, reason, reference, balanceAfter: newQty },
      }),
    ])

    return NextResponse.json(updated)
  }

  // Regular update
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const product = await db.product.update({
    where: { id: params.id },
    data: parsed.data,
    include: { category: true, supplier: true },
  })

  return NextResponse.json(product)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Soft delete
  await db.product.update({ where: { id: params.id }, data: { isActive: false } })
  return NextResponse.json({ success: true })
}
