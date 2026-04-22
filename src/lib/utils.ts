// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(num)
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat('en-IN').format(num)
}

export function getStockStatus(qty: number, minStock: number) {
  if (qty === 0) return { label: 'Out of Stock', color: 'red' }
  if (qty <= minStock) return { label: 'Low Stock', color: 'orange' }
  if (qty <= minStock * 1.5) return { label: 'Medium', color: 'yellow' }
  return { label: 'In Stock', color: 'green' }
}

export function generateSKU(name: string, categoryName: string) {
  const prefix = categoryName.substring(0, 3).toUpperCase()
  const namePart = name.replace(/\s+/g, '').substring(0, 4).toUpperCase()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}-${namePart}-${random}`
}

export function generateOrderNo() {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `PO-${year}${month}-${random}`
}
