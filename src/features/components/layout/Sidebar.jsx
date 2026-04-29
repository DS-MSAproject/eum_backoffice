import { NavLink } from 'react-router-dom'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectSidebarCollapsed } from '@/features/ui/uiSlice'
import {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  Package,
  Activity,
  FileText,
  ShieldCheck,
  ChevronRight,
  Store,
} from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: '대시보드' },
  { to: '/products',  icon: Store,           label: '상품 관리' },
  { to: '/orders',    icon: ShoppingCart,    label: '주문 관리' },
  { to: '/payments',  icon: CreditCard,      label: '결제 관리' },
  { to: '/inventory', icon: Package,         label: '재고 관리' },
  { to: '/monitoring',icon: Activity,        label: '시스템 모니터링' },
  { to: '/logs',      icon: FileText,        label: '로그 뷰어' },
]

export default function Sidebar() {
  const collapsed = useAppSelector(selectSidebarCollapsed)

  return (
    <aside
      className={`flex flex-col bg-[#0f172a] border-r border-slate-700/50 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      } shrink-0`}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700/50">
        <div className="flex items-center justify-center w-8 h-8 bg-[#3ea76e]/20 rounded-lg shrink-0">
          <ShieldCheck size={18} className="text-[#3ea76e]" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-black text-[14px] leading-tight">EUM</p>
            <p className="text-slate-400 text-[11px]">Backoffice</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 space-y-0.5 px-2 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-colors group ${
                isActive
                  ? 'bg-[#3ea76e]/15 text-[#3ea76e]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
            {!collapsed && (
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-slate-700/50">
        <p className={`text-[10px] text-slate-600 text-center ${collapsed ? 'hidden' : ''}`}>
          v1.0.0
        </p>
      </div>
    </aside>
  )
}
