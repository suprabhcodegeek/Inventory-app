// src/app/api/suppliers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'
import { db } from '../../../lib/db'
import { z } from 'zod'

const SupplierSchema = z.object({
  name:          z.string().min(1),
  contactPerson: z.string().optional(),
  email:         z.string().email().optional().or(z.literal('')),
  phone:         z.string().optional(),
  address:       z.string().optional(),
  gstin:         z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const suppliers = await db.supplier.findMany({
    where: { isActive: true },
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(suppliers)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = SupplierSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const supplier = await db.supplier.create({ data: parsed.data })
  return NextResponse.json(supplier, { status: 201 })
}
