// src/app/settings/page.tsx
'use client'
import { useState } from 'react'
import { Save, Shield, Bell, Database, User } from 'lucide-react'

export default function SettingsPage() {
  const [tab, setTab] = useState<'profile' | 'notifications' | 'system'>('profile')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { id: 'profile',       label: 'Profile',       icon: User },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'system',        label: 'System',        icon: Database },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">Profile Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Full Name</label><input className="input" defaultValue="Admin User" /></div>
            <div><label className="label">Email</label><input className="input" defaultValue="admin@company.com" type="email" /></div>
            <div><label className="label">Company Name</label><input className="input" defaultValue="My Company" /></div>
            <div><label className="label">Phone</label><input className="input" defaultValue="+91 98765 43210" /></div>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-medium text-slate-700 mb-3">Change Password</h4>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Current Password</label><input className="input" type="password" placeholder="••••••••" /></div>
              <div><label className="label">New Password</label><input className="input" type="password" placeholder="••••••••" /></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">Notification Preferences</h3>
          {[
            { label: 'Low Stock Alerts', sub: 'Get notified when items fall below minimum threshold' },
            { label: 'Out of Stock Alerts', sub: 'Immediate alerts when items reach zero' },
            { label: 'New Supplier Added', sub: 'Notify when a new supplier is added' },
            { label: 'Purchase Order Updates', sub: 'Status changes for purchase orders' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                <div className="w-10 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-sky-500 rounded-full peer
                                peer-checked:bg-sky-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                                after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                                peer-checked:after:translate-x-4" />
              </label>
            </div>
          ))}
        </div>
      )}

      {tab === 'system' && (
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">System Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Currency</label>
              <select className="input"><option>INR (₹)</option><option>USD ($)</option><option>EUR (€)</option></select>
            </div>
            <div><label className="label">Date Format</label>
              <select className="input"><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select>
            </div>
            <div><label className="label">Low Stock Threshold (%)</label>
              <input className="input" type="number" defaultValue={20} min={1} max={100} />
            </div>
            <div><label className="label">Items Per Page</label>
              <select className="input"><option>20</option><option>50</option><option>100</option></select>
            </div>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2 text-amber-700 text-sm font-medium mb-1">
              <Shield className="w-4 h-4" /> Data & Privacy
            </div>
            <p className="text-xs text-amber-600">All your data is stored in your own MySQL database. Nothing is shared externally.</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary">
          <Save className="w-4 h-4" />
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
