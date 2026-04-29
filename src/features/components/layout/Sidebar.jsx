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
  { to: '/dashboard',  icon: LayoutDashboard, label: '대시보드' },
  { to: '/products',   icon: Store,           label: '상품 관리' },
  { to: '/orders',     icon: ShoppingCart,    label: '주문 관리' },
  { to: '/payments',   icon: CreditCard,      label: '결제 관리' },
  { to: '/inventory',  icon: Package,         label: '재고 관리' },
  { to: '/monitoring', icon: Activity,        label: '시스템 모니터링' },
  { to: '/logs',       icon: FileText,        label: '로그 뷰어' },
]

export default function Sidebar() {
  const collapsed = useAppSelector(selectSidebarCollapsed)

  return (
    <aside
      className={`flex flex-col bg-slate-900 border-r border-slate-700 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } shrink-0`}
    >
      {/* 로고 */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
        <div className="flex items-center justify-center w-9 h-9 bg-emerald-500/20 rounded-lg shrink-0">
          <ShieldCheck size={20} className="text-emerald-400" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-white font-black text-[15px] leading-tight tracking-wide">EUM</p>
            <p className="text-slate-400 text-[11px] tracking-widest uppercase">Backoffice</p>
          </div>
        )}
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-emerald-500/15 border border-emerald-500/25'
                  : 'border border-transparent hover:bg-slate-700/70'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-emerald-400 rounded-r" />
                )}
                <Icon
                  size={18}
                  className="shrink-0"
                  style={{ color: isActive ? '#34d399' : '#ffffff' }}
                />
                {!collapsed && (
                  <>
                    <span
                      className="flex-1"
                      style={{ color: isActive ? '#34d399' : '#ffffff' }}
                    >
                      {label}
                    </span>
                    <ChevronRight
                      size={14}
                      style={{ color: '#94a3b8', opacity: 0 }}
                      className="group-hover:opacity-50 transition-opacity"
                    />
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 하단 버전 */}
      <div className="p-3 border-t border-slate-700">
        {collapsed ? (
          <div className="w-2 h-2 rounded-full bg-emerald-500/50 mx-auto" />
        ) : (
          <p className="text-[11px] text-slate-500 text-center tracking-widest">v1.0.0</p>
        )}
      </div>
    </aside>
  )
}
