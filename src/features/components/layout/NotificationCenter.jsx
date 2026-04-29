import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Package, AlertTriangle, CreditCard, X, ChevronRight } from 'lucide-react'
import { useGetDashboardSummaryQuery } from '@/api/monitoringApi'

function NotifItem({ icon: Icon, color, title, desc, to, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-700/40 transition-colors text-left"
    >
      <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-white">{title}</p>
        <p className="text-[11px] text-slate-400 mt-0.5 truncate">{desc}</p>
      </div>
      <ChevronRight size={14} className="text-slate-600 mt-1 shrink-0" />
    </button>
  )
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const { data } = useGetDashboardSummaryQuery(undefined, { pollingInterval: 30000 })

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const notifications = []

  if (data?.lowStockCount > 0)
    notifications.push({
      icon: Package,
      color: 'bg-yellow-500/20 text-yellow-400',
      title: `재고 부족 ${data.lowStockCount}건`,
      desc: '10개 이하 품목이 있습니다. 재고를 확인해주세요.',
      to: '/inventory',
    })

  if (data?.failedOrders > 0)
    notifications.push({
      icon: AlertTriangle,
      color: 'bg-red-500/20 text-red-400',
      title: `실패 주문 ${data.failedOrders}건`,
      desc: 'Outbox 미처리 이벤트가 있습니다.',
      to: '/orders',
    })

  if (data?.reconciliationIssues > 0)
    notifications.push({
      icon: CreditCard,
      color: 'bg-orange-500/20 text-orange-400',
      title: `결제 불일치 ${data.reconciliationIssues}건`,
      desc: '정산 오류를 확인해주세요.',
      to: '/payments',
    })

  const count = notifications.length

  const go = (to) => {
    setOpen(false)
    navigate(to)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative text-slate-400 hover:text-slate-200 transition-colors p-1"
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-9 w-80 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60">
            <span className="text-[13px] font-bold text-white">알림</span>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300">
              <X size={14} />
            </button>
          </div>

          {count === 0 ? (
            <div className="px-4 py-8 text-center">
              <Bell size={24} className="text-slate-600 mx-auto mb-2" />
              <p className="text-[12px] text-slate-500">처리가 필요한 알림이 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/40">
              {notifications.map((n, i) => (
                <NotifItem key={i} {...n} onClick={() => go(n.to)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
