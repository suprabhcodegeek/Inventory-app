// // src/app/api/orders/[id]/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '../../../../lib/auth'
// import { db } from '../../../../lib/db'
// import { z } from 'zod'

// const StatusSchema = z.object({
//   status: z.enum(['PENDING', 'CONFIRMED', 'PARTIAL', 'RECEIVED', 'CANCELLED']),
// })

// const ReceiveSchema = z.object({
//   _action:      z.literal('receive'),
//   receivedItems: z.array(z.object({
//     itemId:      z.string(),
//     receivedQty: z.number().int().min(0),
//   })),
// })

// export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
//   const session = await getServerSession(authOptions)
//   if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

//   const order = await db.purchaseOrder.findUnique({
//     where: { id: params.id },
//     include: {
//       supplier: true,
//       items: {
//         include: {
//           product: { include: { category: true } },
//         },
//       },
//     },
//   })

//   if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
//   return NextResponse.json(order)
// }

// export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
//   const session = await getServerSession(authOptions)
//   if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

//   const body = await req.json()

//   // Handle stock receiving
//   if (body._action === 'receive') {
//     const parsed = ReceiveSchema.safeParse(body)
//     if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

//     const order = await db.purchaseOrder.findUnique({
//       where: { id: params.id },
//       include: { items: { include: { product: true } } },
//     })
//     if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
//     if (order.status === 'CANCELLED') return NextResponse.json({ error: 'Cannot receive a cancelled order' }, { status: 400 })

//     const { receivedItems } = parsed.data

//     // Process each received item in a transaction
//     await db.$transaction(async (tx) => {
//       for (const ri of receivedItems) {
//         const orderItem = order.items.find(i => i.id === ri.itemId)
//         if (!orderItem || ri.receivedQty === 0) continue

//         const newReceivedQty = orderItem.receivedQty + ri.receivedQty
//         if (newReceivedQty > orderItem.quantity) continue // skip over-receive

//         // Update order item received qty
//         await tx.purchaseOrderItem.update({
//           where: { id: ri.itemId },
//           data:  { receivedQty: newReceivedQty },
//         })

//         // Add stock movement
//         const product = await tx.product.findUnique({ where: { id: orderItem.productId } })
//         if (!product) continue

//         const newQty = product.quantity + ri.receivedQty
//         await tx.product.update({
//           where: { id: orderItem.productId },
//           data:  { quantity: newQty },
//         })
//         await tx.stockMovement.create({
//           data: {
//             productId:    orderItem.productId,
//             type:         'IN',
//             quantity:     ri.receivedQty,
//             reason:       `Received from PO ${order.orderNo}`,
//             reference:    order.orderNo,
//             balanceAfter: newQty,
//           },
//         })
//       }

//       // Update order status based on received quantities
//       const updatedItems = await tx.purchaseOrderItem.findMany({ where: { purchaseOrderId: params.id } })
//       const allReceived     = updatedItems.every(i => i.receivedQty >= i.quantity)
//       const partialReceived = updatedItems.some(i => i.receivedQty > 0)

//       await tx.purchaseOrder.update({
//         where: { id: params.id },
//         data: {
//           status:       allReceived ? 'RECEIVED' : partialReceived ? 'PARTIAL' : order.status,
//           receivedDate: allReceived ? new Date() : undefined,
//         },
//       })
//     })

//     const updated = await db.purchaseOrder.findUnique({
//       where: { id: params.id },
//       include: { supplier: true, items: { include: { product: true } } },
//     })
//     return NextResponse.json(updated)
//   }

//   // Handle status change
//   const parsed = StatusSchema.safeParse(body)
//   if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

//   const order = await db.purchaseOrder.update({
//     where: { id: params.id },
//     data:  { status: parsed.data.status },
//     include: { supplier: true, items: { include: { product: true } } },
//   })

//   return NextResponse.json(order)
// }

// export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
//   const session = await getServerSession(authOptions)
//   if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

//   const order = await db.purchaseOrder.findUnique({ where: { id: params.id } })
//   if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
//   if (order.status === 'RECEIVED') {
//     return NextResponse.json({ error: 'Cannot cancel a fully received order' }, { status: 400 })
//   }

//   await db.purchaseOrder.update({
//     where: { id: params.id },
//     data:  { status: 'CANCELLED' },
//   })

//   return NextResponse.json({ success: true })
// }
// src/app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth'
import { db } from '../../../../lib/db'
import { z } from 'zod'

const StatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PARTIAL', 'RECEIVED', 'CANCELLED']),
})

const ReceiveSchema = z.object({
  _action:       z.literal('receive'),
  receivedItems: z.array(z.object({
    itemId:      z.string(),
    receivedQty: z.number().int().min(0),
  })),
})

// ✅ FIX: Next.js 15 — params is now a Promise, must be awaited
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const order = await db.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: {
        include: { product: { include: { category: true } } },
      },
    },
  })

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params   // ✅ await before use
  const body   = await req.json()

  // ── Receive stock ────────────────────────────────────────────────────────
  if (body._action === 'receive') {
    const parsed = ReceiveSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const order = await db.purchaseOrder.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Cannot receive a cancelled order' }, { status: 400 })
    }

    await db.$transaction(async (tx) => {
      for (const ri of parsed.data.receivedItems) {
        const orderItem = order.items.find(i => i.id === ri.itemId)
        if (!orderItem || ri.receivedQty === 0) continue

        const newReceivedQty = orderItem.receivedQty + ri.receivedQty
        if (newReceivedQty > orderItem.quantity) continue

        await tx.purchaseOrderItem.update({
          where: { id: ri.itemId },
          data:  { receivedQty: newReceivedQty },
        })

        const product = await tx.product.findUnique({ where: { id: orderItem.productId } })
        if (!product) continue

        const newQty = product.quantity + ri.receivedQty
        await tx.product.update({
          where: { id: orderItem.productId },
          data:  { quantity: newQty },
        })
        await tx.stockMovement.create({
          data: {
            productId:    orderItem.productId,
            type:         'IN',
            quantity:     ri.receivedQty,
            reason:       `PO received: ${order.orderNo}`,
            reference:    order.orderNo,
            balanceAfter: newQty,
          },
        })
      }

      const updatedItems = await tx.purchaseOrderItem.findMany({
        where: { purchaseOrderId: id },
      })
      const allReceived     = updatedItems.every(i => i.receivedQty >= i.quantity)
      const partialReceived = updatedItems.some(i => i.receivedQty > 0)

      await tx.purchaseOrder.update({
        where: { id },
        data: {
          status:       allReceived ? 'RECEIVED' : partialReceived ? 'PARTIAL' : order.status,
          receivedDate: allReceived ? new Date() : undefined,
        },
      })
    })

    const updated = await db.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: { include: { product: { include: { category: true } } } },
      },
    })
    return NextResponse.json(updated)
  }

  // ── Status change ────────────────────────────────────────────────────────
  const parsed = StatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const order = await db.purchaseOrder.update({
    where: { id },                        // ✅ id is string, not undefined
    data:  { status: parsed.data.status },
    include: {
      supplier: true,
      items: { include: { product: { include: { category: true } } } },
    },
  })

  return NextResponse.json(order)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params   // ✅ await before use

  const order = await db.purchaseOrder.findUnique({ where: { id } })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (order.status === 'RECEIVED') {
    return NextResponse.json({ error: 'Cannot cancel a fully received order' }, { status: 400 })
  }

  await db.purchaseOrder.update({
    where: { id },
    data:  { status: 'CANCELLED' },
  })

  return NextResponse.json({ success: true })
}
