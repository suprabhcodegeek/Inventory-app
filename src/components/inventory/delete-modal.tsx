// src/components/inventory/delete-modal.tsx
'use client'
import { useState } from 'react'
import { Trash2, X, AlertTriangle } from 'lucide-react'

interface Props { name: string; onClose: () => void; onConfirm: () => Promise<void> }

export function DeleteModal({ name, onClose, onConfirm }: Props) {
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-fade-in p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Remove Product</h3>
            <p className="text-xs text-slate-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          Are you sure you want to remove <strong>"{name}"</strong> from inventory?
          The product and all its stock movements will be archived.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handle} disabled={loading} className="btn-danger flex-1 justify-center">
            <Trash2 className="w-4 h-4" />
            {loading ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  )
}
