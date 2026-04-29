import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { toggleSidebar, addToast, selectSidebarCollapsed } from '@/features/ui/uiSlice'
import { useAdminLogoutMutation } from '@/api/authApi'
import useAdminAuth from '@/features/auth/useAdminAuth'
import { PanelLeftClose, PanelLeftOpen, LogOut, Bell } from 'lucide-react'

export default function TopBar({ title }) {
  const dispatch = useAppDispatch()
  const collapsed = useAppSelector(selectSidebarCollapsed)
  const { admin } = useAdminAuth()
  const [logout] = useAdminLogoutMutation()

  const handleLogout = async () => {
    try {
      await logout().unwrap()
    } catch {
      // ignore network errors on logout
    }
    dispatch(addToast({ type: 'success', message: '로그아웃되었습니다.' }))
    window.location.href = '/login'
  }

  return (
    <header className="h-14 bg-[#1e293b] border-b border-slate-700/50 flex items-center px-4 gap-4 shrink-0">
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="text-slate-400 hover:text-slate-200 transition-colors"
      >
        {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
      </button>

      <h1 className="text-[15px] font-bold text-white flex-1">{title}</h1>

      <button className="text-slate-400 hover:text-slate-200 transition-colors relative">
        <Bell size={18} />
      </button>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#3ea76e]/20 flex items-center justify-center">
          <span className="text-[#3ea76e] text-[12px] font-bold">
            {admin?.name?.[0] ?? 'A'}
          </span>
        </div>
        {admin?.name && (
          <span className="text-[13px] text-slate-300 font-semibold hidden sm:block">{admin.name}</span>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-red-400 transition-colors"
      >
        <LogOut size={16} />
        <span className="hidden sm:block">로그아웃</span>
      </button>
    </header>
  )
}
