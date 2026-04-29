import { useState } from 'react'
import { useGetAdminOrdersQuery, useGetOrderInconsistenciesQuery } from '@/api/orderApi'
import { formatDate, formatPrice, getStatusLabel } from '@/shared/utils/formatters'
import DataTable from '@/shared/components/DataTable'
import Badge from '@/shared/components/Badge'
import OutboxRetryPanel from './OutboxRetryPanel'
import { AlertTriangle } from 'lucide-react'

const TABS = ['전체 주문', 'Outbox 이벤트', '불일치 주문']

export default function OrderManagementPage() {
  const [tab, setTab] = useState(0)
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')

  const { data: ordersData, isLoading: ordersLoading } = useGetAdminOrdersQuery(
    { page, size: 20, status: statusFilter || undefined },
    { skip: tab !== 0 }
  )
  const { data: inconsistencies, isLoading: incLoading } = useGetOrderInconsistenciesQuery(
    undefined,
    { skip: tab !== 2 }
  )

  const orderColumns = [
    { key: 'orderId', header: '주문ID', render: (r) => <span className="font-mono text-[11px]">{r.orderId}</span> },
    { key: 'userId', header: '사용자ID', render: (r) => <span className="font-mono text-[11px]">{r.userId}</span> },
    { key: 'totalAmount', header: '금액', render: (r) => formatPrice(r.totalAmount) },
    { key: 'status', header: '상태', render: (r) => <Badge status={r.status} label={getStatusLabel(r.status)} /> },
    { key: 'paymentStatus', header: '결제', render: (r) => <Badge status={r.paymentStatus} label={getStatusLabel(r.paymentStatus)} /> },
    { key: 'createdAt', header: '주문일시', render: (r) => formatDate(r.createdAt) },
  ]

  const incColumns = [
    { key: 'orderId', header: '주문ID', render: (r) => <span className="font-mono text-[11px]">{r.orderId}</span> },
    { key: 'orderStatus', header: '주문상태', render: (r) => <Badge status={r.orderStatus} label={getStatusLabel(r.orderStatus)} /> },
    { key: 'paymentStatus', header: '결제상태', render: (r) => <Badge status={r.paymentStatus} label={getStatusLabel(r.paymentStatus)} /> },
    { key: 'issue', header: '불일치 원인', render: (r) => (
      <span className="text-yellow-400 text-[12px]">{r.issue}</span>
    )},
    { key: 'detectedAt', header: '감지시각', render: (r) => formatDate(r.detectedAt) },
  ]

  return (
    <div className="space-y-5">
      <div className="flex gap-1 bg-[#0f172a] rounded-xl p-1 w-fit">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-colors ${
              tab === i ? 'bg-[#1e293b] text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-[15px] font-bold text-white flex-1">주문 목록</h3>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
              className="bg-[#0f172a] border border-slate-600 text-slate-300 text-[13px] rounded-lg px-3 py-1.5 outline-none focus:border-[#3ea76e]"
            >
              <option value="">전체 상태</option>
              <option value="PENDING">대기</option>
              <option value="PROCESSING">처리중</option>
              <option value="COMPLETED">완료</option>
              <option value="CANCELLED">취소</option>
              <option value="FAILED">실패</option>
            </select>
          </div>
          <DataTable columns={orderColumns} data={ordersData?.content} isLoading={ordersLoading} />
          {ordersData && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-[12px] text-slate-400">
                총 {ordersData.totalElements}건 / {ordersData.totalPages}페이지
              </p>
              <div className="flex gap-2">
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 rounded-lg bg-slate-700 text-slate-300 text-[12px] disabled:opacity-30 hover:bg-slate-600 transition-colors">
                  이전
                </button>
                <span className="px-3 py-1 text-[12px] text-slate-400">{page + 1}</span>
                <button disabled={page >= ordersData.totalPages - 1} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 rounded-lg bg-slate-700 text-slate-300 text-[12px] disabled:opacity-30 hover:bg-slate-600 transition-colors">
                  다음
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 1 && <OutboxRetryPanel />}

      {tab === 2 && (
        <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-yellow-400" />
            <h3 className="text-[15px] font-bold text-white">주문-결제 불일치 목록</h3>
          </div>
          <DataTable columns={incColumns} data={inconsistencies} isLoading={incLoading} emptyText="불일치 주문이 없습니다." />
        </div>
      )}
    </div>
  )
}
