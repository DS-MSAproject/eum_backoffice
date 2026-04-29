const variants = {
  green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  red: 'bg-red-500/15 text-red-400 border-red-500/30',
  yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  gray: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
}

const statusVariant = {
  COMPLETED: 'green',
  PAID: 'green',
  DELIVERED: 'green',
  PROCESSING: 'blue',
  SHIPPED: 'blue',
  PENDING: 'yellow',
  FAILED: 'red',
  CANCELLED: 'gray',
  REFUNDED: 'purple',
  UP: 'green',
  DOWN: 'red',
  DEGRADED: 'yellow',
}

export default function Badge({ label, variant, status }) {
  const v = variant ?? statusVariant[status] ?? 'gray'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${variants[v]}`}>
      {label ?? status}
    </span>
  )
}
