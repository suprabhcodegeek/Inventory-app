// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database…')

  // Admin user
  const hashed = await bcrypt.hash('admin123', 12)
  await db.user.upsert({
    where: { email: 'admin@company.com' },
    update: {},
    create: { name: 'Admin User', email: 'admin@company.com', password: hashed, role: 'ADMIN' },
  })

  // Categories
  const cats = await Promise.all([
    db.category.upsert({ where: { name: 'Raw Materials' }, update: {}, create: { name: 'Raw Materials', color: '#0ea5e9', description: 'Raw input materials' } }),
    db.category.upsert({ where: { name: 'Finished Goods' }, update: {}, create: { name: 'Finished Goods', color: '#10b981', description: 'Ready-to-sell products' } }),
    db.category.upsert({ where: { name: 'Packaging' }, update: {}, create: { name: 'Packaging', color: '#f59e0b', description: 'Packing materials' } }),
    db.category.upsert({ where: { name: 'Electronics' }, update: {}, create: { name: 'Electronics', color: '#6366f1', description: 'Electronic items' } }),
    db.category.upsert({ where: { name: 'Consumables' }, update: {}, create: { name: 'Consumables', color: '#ef4444', description: 'Day-to-day consumables' } }),
  ])

  // Suppliers
  const suppliers = await Promise.all([
    db.supplier.create({ data: { name: 'Sharma Trading Co.', contactPerson: 'Rajesh Sharma', email: 'rajesh@sharma.in', phone: '9876543210', gstin: '27AAACS1234A1Z1' } }),
    db.supplier.create({ data: { name: 'Patel Distributors', contactPerson: 'Amit Patel', email: 'amit@patel.in', phone: '9765432109' } }),
    db.supplier.create({ data: { name: 'Global Supplies Ltd', email: 'info@global.in', phone: '9654321098' } }),
  ])

  // Products
  const products = [
    { sku: 'RM-RICE-0001', name: 'Basmati Rice', categoryId: cats[0].id, supplierId: suppliers[0].id, unit: 'kg',  costPrice: 65,  sellingPrice: 80,  quantity: 500, minStock: 100 },
    { sku: 'RM-WHET-0002', name: 'Wheat Flour',  categoryId: cats[0].id, supplierId: suppliers[0].id, unit: 'kg',  costPrice: 35,  sellingPrice: 45,  quantity: 8,   minStock: 50  },
    { sku: 'FG-ATAA-0003', name: 'Aata 5kg Pack', categoryId: cats[1].id, supplierId: suppliers[1].id, unit: 'pcs', costPrice: 160, sellingPrice: 195, quantity: 0,   minStock: 30  },
    { sku: 'PK-BAGS-0004', name: 'Poly Bags 1kg', categoryId: cats[2].id, supplierId: suppliers[2].id, unit: 'box', costPrice: 250, sellingPrice: 310, quantity: 45,  minStock: 20  },
    { sku: 'EL-BULB-0005', name: 'LED Bulb 9W',  categoryId: cats[3].id, supplierId: suppliers[1].id, unit: 'pcs', costPrice: 55,  sellingPrice: 85,  quantity: 200, minStock: 30  },
    { sku: 'CO-SOAP-0006', name: 'Hand Soap Bar', categoryId: cats[4].id, supplierId: suppliers[0].id, unit: 'pcs', costPrice: 18,  sellingPrice: 28,  quantity: 12,  minStock: 25  },
    { sku: 'RM-SUGR-0007', name: 'Sugar',         categoryId: cats[0].id, supplierId: suppliers[2].id, unit: 'kg',  costPrice: 42,  sellingPrice: 52,  quantity: 300, minStock: 80  },
    { sku: 'FG-BSMT-0008', name: 'Biscuit Pack', categoryId: cats[1].id, supplierId: suppliers[1].id, unit: 'box', costPrice: 85,  sellingPrice: 110, quantity: 75,  minStock: 20  },
  ]

  for (const p of products) {
    const exists = await db.product.findUnique({ where: { sku: p.sku } })
    if (!exists) {
      const product = await db.product.create({ data: { ...p, location: 'Rack A' } })
      if (p.quantity > 0) {
        await db.stockMovement.create({
          data: { productId: product.id, type: 'IN', quantity: p.quantity, reason: 'Initial stock', balanceAfter: p.quantity },
        })
      }
    }
  }

  console.log('✅ Database seeded successfully!')
  console.log('   Login: admin@company.com / admin123')
}

main().catch(console.error).finally(() => db.$disconnect())
