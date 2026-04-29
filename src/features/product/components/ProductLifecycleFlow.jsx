import { useTransitionProductStatusMutation } from '@/api/productApi'

const STATUSES = [
  { status: 'DRAFT',        label: '임시저장', color: 'slate' },
  { status: 'REVIEW',       label: '검수 중',  color: 'yellow' },
  { status: 'READY',        label: '판매대기', color: 'blue' },
  { status: 'ON_SALE',      label: '판매 중',  color: 'green' },
  { status: 'DISCONTINUED', label: '판매종료', color: 'red' },
]

const COLOR_ACTIVE = {
  slate:  'bg-slate-600 text-white border-slate-500',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
  blue:   'bg-blue-500/20 text-blue-400 border-blue-500',
  green:  'bg-[#3ea76e]/20 text-[#3ea76e] border-[#3ea76e]',
  red:    'bg-red-500/20 text-red-400 border-red-500',
}

const COLOR_IDLE = {
  slate:  'text-slate-500 border-slate-700 hover:border-slate-500 hover:text-slate-300',
  yellow: 'text-slate-500 border-slate-700 hover:border-yellow-700 hover:text-yellow-400',
  blue:   'text-slate-500 border-slate-700 hover:border-blue-700 hover:text-blue-400',
  green:  'text-slate-500 border-slate-700 hover:border-[#3ea76e]/50 hover:text-[#3ea76e]',
  red:    'text-slate-500 border-slate-700 hover:border-red-700 hover:text-red-400',
}

export default function ProductLifecycleFlow({ productId, currentStatus }) {
  const [transition, { isLoading }] = useTransitionProductStatusMutation()

  const handleSelect = async (targetStatus) => {
    if (targetStatus === currentStatus || isLoading) return
    await transition({ productId, targetStatus })
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map(({ status, label, color }) => {
        const isActive = status === currentStatus
        return (
          <button
            key={status}
            onClick={() => handleSelect(status)}
            disabled={isActive || isLoading}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-colors
              ${isActive
                ? `${COLOR_ACTIVE[color]} cursor-default`
                : `bg-slate-800 ${COLOR_IDLE[color]} cursor-pointer`
              } disabled:opacity-60`}
          >
            {isActive && <span className="mr-1">●</span>}
            {label}
          </button>
        )
      })}
    </div>
  )
}
