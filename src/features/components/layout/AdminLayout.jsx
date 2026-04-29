import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import Toast from '@/features/components/ui/Toast'
import GlobalSearch from '@/features/search/GlobalSearch'

const PAGE_TITLES = {
  '/dashboard': '대시보드',
  '/products': '상품 관리',
  '/orders': '주문 관리',
  '/payments': '결제 관리',
  '/inventory': '재고 관리',
  '/users': '회원 관리',
  '/monitoring': '시스템 모니터링',
}

export default function AdminLayout() {
  const { pathname } = useLocation()
  const title = Object.entries(PAGE_TITLES).find(([path]) => pathname.startsWith(path))?.[1] ?? 'Backoffice'
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden">
      <Sidebar onSearchOpen={() => setSearchOpen(true)} />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar title={title} onSearchOpen={() => setSearchOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <Toast />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
