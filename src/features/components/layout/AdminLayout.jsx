import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import Toast from '@/features/components/ui/Toast'

const PAGE_TITLES = {
  '/dashboard': '대시보드',
  '/orders': '주문 관리',
  '/payments': '결제 관리',
  '/inventory': '재고 관리',
  '/monitoring': '시스템 모니터링',
  '/logs': '로그 뷰어',
}

export default function AdminLayout() {
  const { pathname } = useLocation()
  const title = Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path))?.[1] ?? 'Backoffice'

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  )
}
