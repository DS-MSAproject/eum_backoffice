import { useState } from 'react'
import { useSearchLogsQuery, useGetOrderLogTimelineQuery, useGetAuditLogsQuery } from '@/api/monitoringApi'
import { formatDate } from '@/shared/utils/formatters'
import DataTable from '@/shared/components/DataTable'
import Badge from '@/shared/components/Badge'
import Spinner from '@/shared/components/Spinner'
import { Search, Clock, Shield } from 'lucide-react'

const TABS = ['로그 검색', '주문 타임라인', '감사 로그']

const LEVEL_COLORS = {
  ERROR: 'text-red-400',
  WARN: 'text-yellow-400',
  INFO: 'text-blue-300',
  DEBUG: 'text-slate-400',
}

export default function LogViewerPage() {
  const [tab, setTab] = useState(0)
  const [logQuery, setLogQuery] = useState({ keyword: '', service: '', level: '', from: '', to: '' })
  const [logSearch, setLogSearch] = useState(null)
  const [orderIdInput, setOrderIdInput] = useState('')
  const [orderId, setOrderId] = useState('')

  const { data: logs, isLoading: logsLoading } = useSearchLogsQuery(logSearch, { skip: !logSearch })
  const { data: timeline, isLoading: timelineLoading } = useGetOrderLogTimelineQuery(orderId, { skip: !orderId })
  const { data: auditLogs, isLoading: auditLoading } = useGetAuditLogsQuery({ page: 0, size: 50 }, { skip: tab !== 2 })

  const auditColumns = [
    { key: 'id', header: 'ID', width: 60 },
    { key: 'adminEmail', header: '관리자', render: (r) => <span className="text-[12px]">{r.adminEmail}</span> },
    { key: 'action', header: '액션', render: (r) => <span className="font-mono text-[12px] text-blue-300">{r.action}</span> },
    { key: 'target', header: '대상', render: (r) => <span className="font-mono text-[11px]">{r.target}</span> },
    { key: 'result', header: '결과', render: (r) => <Badge status={r.result === 'SUCCESS' ? 'COMPLETED' : 'FAILED'} label={r.result} /> },
    { key: 'ipAddress', header: 'IP', render: (r) => <span className="font-mono text-[11px]">{r.ipAddress}</span> },
    { key: 'createdAt', header: '시각', render: (r) => formatDate(r.createdAt) },
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
        <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
            <input value={logQuery.keyword} onChange={(e) => setLogQuery(q => ({ ...q, keyword: e.target.value }))}
              placeholder="키워드 검색..."
              className="col-span-2 sm:col-span-1 bg-[#0f172a] border border-slate-600 text-white text-[13px] rounded-xl px-3 py-2 outline-none focus:border-[#3ea76e]" />
            <select value={logQuery.service} onChange={(e) => setLogQuery(q => ({ ...q, service: e.target.value }))}
              className="bg-[#0f172a] border border-slate-600 text-slate-300 text-[13px] rounded-xl px-3 py-2 outline-none focus:border-[#3ea76e]">
              <option value="">전체 서비스</option>
              {['orderserver', 'paymentserver', 'inventoryserver', 'cartserver', 'authserver', 'productserver', 'reviewserver'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select value={logQuery.level} onChange={(e) => setLogQuery(q => ({ ...q, level: e.target.value }))}
              className="bg-[#0f172a] border border-slate-600 text-slate-300 text-[13px] rounded-xl px-3 py-2 outline-none focus:border-[#3ea76e]">
              <option value="">전체 레벨</option>
              {['ERROR', 'WARN', 'INFO', 'DEBUG'].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <input value={logQuery.from} onChange={(e) => setLogQuery(q => ({ ...q, from: e.target.value }))}
              type="datetime-local"
              className="bg-[#0f172a] border border-slate-600 text-slate-300 text-[13px] rounded-xl px-3 py-2 outline-none focus:border-[#3ea76e]" />
            <button onClick={() => setLogSearch(logQuery)}
              className="flex items-center justify-center gap-2 bg-[#3ea76e] hover:bg-[#318a57] text-white rounded-xl text-[13px] font-bold px-4 py-2 transition-colors">
              <Search size={14} />검색
            </button>
          </div>

          {logsLoading && <div className="flex justify-center py-8"><Spinner size={28} /></div>}
          {logs && (
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3 px-3 py-2 rounded-lg hover:bg-slate-700/30 font-mono text-[12px]">
                  <span className="text-slate-500 shrink-0 w-32">{formatDate(log.timestamp)}</span>
                  <span className={`shrink-0 w-12 font-bold ${LEVEL_COLORS[log.level] ?? 'text-slate-400'}`}>{log.level}</span>
                  <span className="text-blue-300 shrink-0 w-24">{log.service}</span>
                  <span className="text-slate-300 flex-1 break-all">{log.message}</span>
                </div>
              ))}
              {!logs.length && <p className="text-slate-500 text-[13px] py-4 text-center">검색 결과 없음</p>}
            </div>
          )}
        </div>
      )}

      {tab === 1 && (
        <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-[#3ea76e]" />
            <h3 className="text-[15px] font-bold text-white">주문 로그 타임라인</h3>
          </div>
          <div className="flex gap-3 mb-5">
            <input value={orderIdInput} onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="주문 ID 입력..."
              className="bg-[#0f172a] border border-slate-600 text-white text-[13px] rounded-xl px-4 py-2.5 outline-none focus:border-[#3ea76e] flex-1"
              onKeyDown={(e) => e.key === 'Enter' && setOrderId(orderIdInput)} />
            <button onClick={() => setOrderId(orderIdInput)}
              className="px-4 py-2.5 bg-[#3ea76e] hover:bg-[#318a57] text-white rounded-xl text-[13px] font-bold transition-colors flex items-center gap-2">
              <Search size={14} />조회
            </button>
          </div>
          {timelineLoading && <div className="flex justify-center py-8"><Spinner size={28} /></div>}
          {timeline && (
            <div className="relative pl-6 space-y-3">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-700" />
              {timeline.map((event, i) => (
                <div key={i} className="relative">
                  <div className={`absolute -left-4 top-1.5 w-2.5 h-2.5 rounded-full border-2 ${
                    event.level === 'ERROR' ? 'border-red-400 bg-red-400/20' :
                    event.level === 'WARN' ? 'border-yellow-400 bg-yellow-400/20' :
                    'border-[#3ea76e] bg-[#3ea76e]/20'
                  }`} />
                  <div className="bg-[#0f172a] rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] text-slate-500 font-mono">{formatDate(event.timestamp)}</span>
                      <span className="text-[11px] text-blue-300 font-mono">{event.service}</span>
                      <span className={`text-[11px] font-bold ${LEVEL_COLORS[event.level] ?? 'text-slate-400'}`}>{event.level}</span>
                    </div>
                    <p className="text-[12px] text-slate-300">{event.message}</p>
                    {event.traceId && (
                      <p className="text-[10px] text-slate-500 font-mono mt-1">trace: {event.traceId}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 2 && (
        <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-[#3ea76e]" />
            <h3 className="text-[15px] font-bold text-white">관리자 감사 로그</h3>
          </div>
          <DataTable columns={auditColumns} data={auditLogs?.content ?? auditLogs} isLoading={auditLoading} />
        </div>
      )}
    </div>
  )
}
