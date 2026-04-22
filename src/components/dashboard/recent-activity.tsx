// src/components/dashboard/recent-activity.tsx
import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Movement {
  id: string; type: string; quantity: number; reason?: string | null
  createdAt: Date; product: { name: string }
}

export function RecentActivity({ movements }: { movements: Movement[] }) {
  const icons = {
    IN:         { Icon: ArrowDownCircle, color: 'text-emerald-500' },
    OUT:        { Icon: ArrowUpCircle,   color: 'text-red-500' },
    ADJUSTMENT: { Icon: RefreshCw,       color: 'text-sky-500' },
    RETURN:     { Icon: ArrowDownCircle, color: 'text-violet-500' },
  }

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-slate-800 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {movements.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-4">No recent activity</p>
        )}
        {movements.slice(0, 6).map((m) => {
          const { Icon, color } = icons[m.type as keyof typeof icons] || icons.ADJUSTMENT
          return (
            <div key={m.id} className="flex items-start gap-3">
              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{m.product.name}</p>
                <p className="text-xs text-slate-400">
                  {m.type} · {m.quantity} units {m.reason ? `· ${m.reason}` : ''}
                </p>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap">
                {formatDistanceToNow(new Date(m.createdAt), { addSuffix: true })}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
