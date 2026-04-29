import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Package, ShoppingCart, X } from 'lucide-react'
import { useGetAdminProductsQuery } from '@/api/productApi'
import { useGetAdminOrdersQuery } from '@/api/orderApi'

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function ResultItem({ icon: Icon, color, label, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700/50 transition-colors text-left rounded-lg"
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={13} />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] text-white font-medium truncate">{label}</p>
        <p className="text-[11px] text-slate-500 truncate">{sub}</p>
      </div>
    </button>
  )
}

export default function GlobalSearch({ open, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const debouncedQuery = useDebounce(query, 300)

  const enabled = open && debouncedQuery.length >= 1

  const { data: productData } = useGetAdminProductsQuery(
    { productName: debouncedQuery, size: 5 },
    { skip: !enabled },
  )
  const { data: orderData } = useGetAdminOrdersQuery(
    { keyword: debouncedQuery, size: 5 },
    { skip: !enabled },
  )

  const products = productData?.content ?? []
  const orders = orderData?.content ?? []
  const hasResults = products.length > 0 || orders.length > 0

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const go = useCallback((path) => {
    onClose()
    navigate(path)
  }, [navigate, onClose])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-lg mx-4 bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/60">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="상품명, 주문번호 검색..."
            className="flex-1 bg-transparent text-[14px] text-white placeholder-slate-500 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-500 hover:text-slate-300">
              <X size={14} />
            </button>
          )}
          <kbd className="text-[10px] text-slate-600 border border-slate-700 rounded px-1.5 py-0.5">ESC</kbd>
        </div>

        {/* Results */}
        <div className="p-2 max-h-80 overflow-y-auto">
          {!query && (
            <p className="text-[12px] text-slate-500 text-center py-6">검색어를 입력하세요</p>
          )}

          {query && !hasResults && debouncedQuery === query && (
            <p className="text-[12px] text-slate-500 text-center py-6">검색 결과가 없습니다.</p>
          )}

          {products.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 mb-1">상품</p>
              {products.map((p) => (
                <ResultItem
                  key={p.productId}
                  icon={Package}
                  color="bg-[#3ea76e]/20 text-[#3ea76e]"
                  label={p.productName}
                  sub={`#${p.productId} · ${p.brandName ?? '-'} · ₩${Number(p.price).toLocaleString()}`}
                  onClick={() => go('/products')}
                />
              ))}
            </div>
          )}

          {orders.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4 mb-1">주문</p>
              {orders.map((o) => (
                <ResultItem
                  key={o.orderId}
                  icon={ShoppingCart}
                  color="bg-blue-500/20 text-blue-400"
                  label={`주문 #${o.orderId}`}
                  sub={`${o.orderState ?? '-'} · ₩${Number(o.totalPrice ?? 0).toLocaleString()}`}
                  onClick={() => go('/orders')}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-slate-700/60 flex gap-3 text-[10px] text-slate-600">
          <span><kbd className="border border-slate-700 rounded px-1">↑↓</kbd> 이동</span>
          <span><kbd className="border border-slate-700 rounded px-1">Enter</kbd> 선택</span>
          <span><kbd className="border border-slate-700 rounded px-1">ESC</kbd> 닫기</span>
        </div>
      </div>
    </div>
  )
}
