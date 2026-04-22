# 🏪 InventoryPro — Full Stack Inventory Management

> **Next.js 14 · MySQL (Prisma) · NextAuth · Recharts · Tailwind CSS**

---

## 📁 Project Structure

```
inventory-app/
├── prisma/
│   ├── schema.prisma          # MySQL database schema (8 models)
│   └── seed.ts                # Sample data seeder
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # Auth endpoints
│   │   │   ├── products/            # GET list, POST create
│   │   │   │   └── [id]/           # GET, PUT (edit + stock adjust), DELETE
│   │   │   ├── categories/          # GET, POST
│   │   │   ├── suppliers/           # GET, POST
│   │   │   ├── dashboard/           # Stats aggregation
│   │   │   └── reports/             # Stock value, movement, low stock
│   │   ├── dashboard/               # Main dashboard with charts
│   │   ├── inventory/               # Product list + new product form
│   │   ├── suppliers/               # Supplier cards + add modal
│   │   ├── reports/                 # Reports with Excel/CSV export
│   │   ├── settings/                # Profile, notifications, system
│   │   └── login/                   # Auth page
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx          # Collapsible sidebar nav
│   │   │   └── header.tsx           # Search + notifications bar
│   │   ├── dashboard/
│   │   │   ├── stats-cards.tsx      # 4 KPI metric cards
│   │   │   ├── charts.tsx           # Area, Pie, Bar charts (Recharts)
│   │   │   ├── low-stock-table.tsx  # Alert table
│   │   │   └── recent-activity.tsx  # Movement feed
│   │   ├── inventory/
│   │   │   ├── stock-adjust-modal.tsx  # IN/OUT/ADJUSTMENT modal
│   │   │   └── delete-modal.tsx        # Confirm delete
│   │   ├── providers/
│   │   │   └── session-provider.tsx
│   │   └── ui/
│   │       └── toaster.tsx
│   └── lib/
│       ├── db.ts              # Prisma singleton
│       ├── auth.ts            # NextAuth config
│       └── utils.ts           # Helpers (formatCurrency, SKU gen…)
```

---

## 🗄️ Database Schema (MySQL via Prisma)

| Table            | Key Fields |
|------------------|------------|
| `User`           | id, name, email, password, role (ADMIN/MANAGER/STAFF) |
| `Category`       | id, name, color, description |
| `Supplier`       | id, name, contactPerson, email, phone, gstin |
| `Product`        | id, sku, name, categoryId, supplierId, costPrice, sellingPrice, quantity, minStock |
| `StockMovement`  | id, productId, type (IN/OUT/ADJUSTMENT/RETURN), quantity, balanceAfter |
| `PurchaseOrder`  | id, orderNo, supplierId, status, totalAmount |

---

## 🚀 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/api/products` | List with search, filter, pagination |
| POST   | `/api/products` | Create product + initial stock movement |
| GET    | `/api/products/[id]` | Single product + movement history |
| PUT    | `/api/products/[id]` | Edit product OR stock adjustment |
| DELETE | `/api/products/[id]` | Soft delete |
| GET    | `/api/categories` | All categories with product count |
| POST   | `/api/categories` | Create category |
| GET    | `/api/suppliers` | All suppliers with product count |
| POST   | `/api/suppliers` | Create supplier |
| GET    | `/api/dashboard` | Aggregated KPI stats |
| GET    | `/api/reports` | Stock value / low stock / movement |
| POST   | `/api/auth/[...nextauth]` | Login / session |

---

## ⚡ Quick Start (Local Dev)

```bash
# 1. Clone and install
git clone <your-repo>
cd inventory-app
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env → set DATABASE_URL and NEXTAUTH_SECRET

# 3. Setup database
npx prisma db push          # Creates all tables
npm run db:seed             # Adds sample data

# 4. Run dev server
npm run dev
# Open http://localhost:3000
# Login: admin@company.com / admin123
```

---

## 🌐 Deployment Guide (₹0–₹500/month)

### Option A — Vercel + PlanetScale (Recommended, Free Tier)

| Service | Cost | Purpose |
|---------|------|---------|
| Vercel  | ₹0 (Free) | Next.js hosting, auto-deploy |
| PlanetScale | ₹0 (5GB free) | MySQL-compatible serverless DB |

```bash
# Step 1: PlanetScale
# Go to planetscale.com → Create database "inventory_db"
# Get connection string → paste in DATABASE_URL

# Step 2: Deploy to Vercel
npm install -g vercel
vercel

# Set env vars in Vercel dashboard:
# DATABASE_URL = your PlanetScale connection string
# NEXTAUTH_SECRET = openssl rand -base64 32
# NEXTAUTH_URL = https://your-app.vercel.app

# Step 3: Seed production DB
DATABASE_URL="<planetscale-url>" npx prisma db push
DATABASE_URL="<planetscale-url>" npm run db:seed
```

### Option B — Railway (₹300–600/month, includes MySQL)

```bash
# Railway gives you Next.js + MySQL in one platform
# 1. Go to railway.app → New Project → Deploy from GitHub
# 2. Add MySQL service → copy DATABASE_URL
# 3. Set all env vars → Deploy
```

### Option C — VPS (₹200–400/month, full control)

```bash
# DigitalOcean Droplet $4/mo OR Hostinger VPS ₹199/mo
# Install: Node.js 20, MySQL 8, Nginx, PM2

# 1. Clone repo on server
# 2. Configure .env with local MySQL
# 3. Build and start
npm run build
pm2 start npm --name "inventory" -- start

# 4. Nginx reverse proxy to port 3000
# 5. Free SSL via Certbot/Let's Encrypt
```

---

## 🔌 Is an API Used?

**Yes, this project uses its own internal REST API** — not any third-party paid API.

| Component | Technology |
|-----------|------------|
| Frontend  | Next.js App Router (React) |
| API Layer | Next.js API Routes (`/api/*`) |
| Database  | MySQL via Prisma ORM |
| Auth      | NextAuth.js (JWT sessions) |
| No 3rd party AI/paid APIs used | ✅ 100% self-contained |

The app calls its own `/api/products`, `/api/suppliers` etc. endpoints — these are free, part of your own server.

---

## 💰 Total Cost Summary

| Scenario | Monthly Cost |
|----------|-------------|
| Vercel (free) + PlanetScale (free) | **₹0** |
| Railway (App + MySQL) | **₹350–600** |
| VPS (Hostinger/DigitalOcean) | **₹200–400** |
| Domain (.in) | **₹600/year = ₹50/month** |

---

## 🔑 Environment Variables

```env
DATABASE_URL="mysql://user:pass@host:3306/inventory_db"
NEXTAUTH_SECRET="min-32-char-random-string"
NEXTAUTH_URL="https://your-domain.com"
NEXT_PUBLIC_APP_NAME="InventoryPro"
NEXT_PUBLIC_CURRENCY="₹"
```

---

## 🛡️ Security Features

- ✅ All API routes protected by session check
- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ JWT tokens (not database sessions = faster)
- ✅ Role-based access (ADMIN / MANAGER / STAFF)
- ✅ Zod schema validation on all API inputs
- ✅ Soft deletes (no data loss)
- ✅ SQL injection prevented by Prisma ORM

---

## 📊 Features Summary

- ✅ **Dashboard** — KPI cards, live charts, low stock alerts, activity feed
- ✅ **Inventory** — Search, filter, paginated table, CSV export
- ✅ **Stock Adjust** — IN / OUT / ADJUSTMENT / RETURN with audit trail
- ✅ **Products** — Add with auto SKU, pricing, location, barcode
- ✅ **Suppliers** — Card view, add modal, product count
- ✅ **Reports** — Stock value, low stock, movement with Excel/CSV export
- ✅ **Settings** — Profile, notifications, system config
- ✅ **Auth** — Login with email/password, role-based access
- ✅ **Responsive** — Works on mobile, tablet, desktop
- ✅ **Collapsible sidebar** — More screen space when needed
# Inventory-app
