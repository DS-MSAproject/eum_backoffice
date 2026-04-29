const LIFECYCLE_CONFIG = {
  DRAFT:        { label: '임시저장', cls: 'bg-slate-700 text-slate-300' },
  REVIEW:       { label: '검수 중',  cls: 'bg-yellow-900/40 text-yellow-400' },
  READY:        { label: '판매대기', cls: 'bg-blue-900/40 text-blue-400' },
  ON_SALE:      { label: '판매 중',  cls: 'bg-emerald-900/40 text-emerald-400' },
  DISCONTINUED: { label: '판매종료', cls: 'bg-red-900/40 text-red-400' },
}

export default function ProductStatusBadge({ status }) {
  const cfg = LIFECYCLE_CONFIG[status] ?? { label: status, cls: 'bg-slate-700 text-slate-400' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}
