import { useState } from 'react'
import {
  useGetInventoryStatusQuery,
  useGetInventoryEventHistoryQuery,
  useTraceInventoryByProductQuery,
} from '@/api/inventoryApi'
import { formatDate, formatNumber } from '@/shared/utils/formatters'
import DataTable from '@/shared/components/DataTable'
import Badge from '@/shared/components/Badge'
import Spinner from '@/shared/components/Spinner'
import { Search, AlertTriangle } from 'lucide-react'

const TABS = ['재고 현황', '이벤트 히스토리', '상품 추적']

export default function InventoryMonitorPage() {
  const [tab, setTab] = useState(0)
  const [traceProductId, setTraceProductId] = useState('')
  const [traceInput, setTraceInput] = useState('')

  const { data: inventory, isLoading: invLoading } = useGetInventoryStatusQuery(undefined, { skip: tab !== 0 })
  const { data: events, isLoading: eventsLoading } = useGetInventoryEventHistoryQuery({ page: 0, size: 50 }, { skip: tab !== 1 })
  const { data: traceData, isLoading: traceLoading } = useTraceInventoryByProductQuery(
    { productId: traceProductId },
    { skip: tab !== 2 || !traceProductId },
  )

  const inventoryColumns = [
    { key: 'productId', header: '상품ID', render: (r) => <span className="font-mono text-[11px]">{r.productId}</span> },
    { key: 'optionId', header: '옵션ID', render: (r) => (
      <span className="font-mono text-[11px] text-slate-400">{r.optionId ?? '-'}</span>
    )},
    { key: 'stockQuantity', header: '현재고', render: (r) => (
      <span className={`font-bold ${r.stockQuantity <= 0 ? 'text-red-400' : r.stockQuantity <= 10 ? 'text-yellow-400' : 'text-emerald-400'}`}>
        {formatNumber(r.stockQuantity)}
      </span>
    )},
    { key: 'status', header: '상태', render: (r) => (
      <Badge
        status={r.stockQuantity <= 0 ? 'FAILED' : r.stockQuantity <= 10 ? 'PENDING' : 'COMPLETED'}
        label={r.stockQuantity <= 0 ? '품절' : r.stockQuantity <= 10 ? '부족' : '정상'}
      />
    )},
  ]

  const eventColumns = [
    { key: 'eventId', header: '이벤트ID', render: (r) => <span className="font-mono text-[10px]">{r.eventId}</span> },
    { key: 'productId', header: '상품ID', render: (r) => <span className="font-mono text-[11px]">{r.productId}</span> },
    { key: 'eventType', header: '타입', render: (r) => <span className="font-mono text-[12px] text-blue-300">{r.eventType}</span> },
    { key: 'quantity', header: '수량', render: (r) => (
      <span className={`font-bold ${r.quantity < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
        {r.quantity > 0 ? '+' : ''}{formatNumber(r.quantity)}
      </span>
    )},
    { key: 'traceId', header: '트레이스ID', render: (r) => <span className="font-mono text-[10px] text-slate-400">{r.traceId}</span> },
    { key: 'occurredAt', header: '발생시각', render: (r) => formatDate(r.occurredAt) },
  ]

  return (
    <div className="space-y-5">
      <div className="flex gap-1 bg-[#0f172a] rounded-xl p-1 w-fit">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-colors ${
              tab === i ? 'bg-[#1e293b] text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="space-y-4">
          {inventory?.some(i => i.stockQuantity <= 10) && (
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3">
              <AlertTriangle size={16} className="text-yellow-400" />
              <p className="text-[13px] text-yellow-300 font-bold">
                재고 부족 품목이 {inventory.filter(i => i.stockQuantity <= 10).length}개 있습니다.
              </p>
            </div>
          )}
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50">
            <h3 className="text-[15px] font-bold text-white mb-4">전체 재고 현황</h3>
            <DataTable columns={inventoryColumns} data={inventory} isLoading={invLoading} />
          </div>
        </div>
      )}

      {tab === 1 && (
        <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50">
          <h3 className="text-[15px] font-bold text-white mb-4">재고 변동 이벤트 히스토리</h3>
          <DataTable columns={eventColumns} data={events?.content ?? events} isLoading={eventsLoading} />
        </div>
      )}

      {tab === 2 && (
        <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50">
          <h3 className="text-[15px] font-bold text-white mb-4">상품 재고 추적</h3>
          <div className="flex gap-3 mb-5">
            <input
              value={traceInput}
              onChange={(e) => setTraceInput(e.target.value)}
              placeholder="상품 ID 입력..."
              className="bg-[#0f172a] border border-slate-600 text-white text-[13px] rounded-xl px-4 py-2.5 outline-none focus:border-[#3ea76e] flex-1"
              onKeyDown={(e) => e.key === 'Enter' && setTraceProductId(traceInput)}
            />
            <button
              onClick={() => setTraceProductId(traceInput)}
              className="px-4 py-2.5 bg-[#3ea76e] hover:bg-[#318a57] text-white rounded-xl text-[13px] font-bold transition-colors flex items-center gap-2"
            >
              <Search size={14} />추적
            </button>
          </div>
          {traceLoading && <div className="flex justify-center py-8"><Spinner size={28} /></div>}
          {traceData && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: '총 입고', value: formatNumber(traceData.totalIn) },
                  { label: '총 출고', value: formatNumber(traceData.totalOut) },
                  { label: '현재고', value: formatNumber(traceData.currentStock) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#0f172a] rounded-xl p-3">
                    <p className="text-[11px] text-slate-400 mb-1">{label}</p>
                    <p className="text-[18px] font-black text-white">{value}</p>
                  </div>
                ))}
              </div>
              <DataTable columns={eventColumns} data={traceData.events} isLoading={false} emptyText="이벤트 없음" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
