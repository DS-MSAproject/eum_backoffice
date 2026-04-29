import { useState } from 'react'
import {
  useGetAdminPaymentsQuery,
  useGetReconciliationReportQuery,
  useGetIdempotencyViolationsQuery,
  useRetryPaymentMutation,
  useForceRefundMutation,
} from '@/api/paymentApi'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { addToast } from '@/features/ui/uiSlice'
import { formatDate, formatPrice, getStatusLabel } from '@/shared/utils/formatters'
import DataTable from '@/shared/components/DataTable'
import Badge from '@/shared/components/Badge'
import { RefreshCw, DollarSign, ShieldAlert } from 'lucide-react'

const TABS = ['결제 목록', '정산 리포트', '멱등성 위반']

export default function PaymentReconciliationPage() {
  const [tab, setTab] = useState(0)
  const dispatch = useAppDispatch()
  const [actionId, setActionId] = useState(null)

  const { data: payments, isLoading: paymentsLoading } = useGetAdminPaymentsQuery({ page: 0, size: 20 }, { skip: tab !== 0 })
  const { data: report, isLoading: reportLoading } = useGetReconciliationReportQuery(undefined, { skip: tab !== 1 })
  const { data: violations, isLoading: violationsLoading } = useGetIdempotencyViolationsQuery(undefined, { skip: tab !== 2 })

  const [retryPayment] = useRetryPaymentMutation()
  const [forceRefund] = useForceRefundMutation()

  const handleRetry = async (paymentId) => {
    setActionId(paymentId)
    try {
      await retryPayment(paymentId).unwrap()
      dispatch(addToast({ type: 'success', message: '결제 재시도 요청 완료' }))
    } catch (e) {
      dispatch(addToast({ type: 'error', message: e.data?.message ?? '재시도 실패' }))
    } finally {
      setActionId(null)
    }
  }

  const handleRefund = async (paymentId) => {
    if (!window.confirm('강제 환불을 진행하시겠습니까?')) return
    setActionId(paymentId)
    try {
      await forceRefund(paymentId).unwrap()
      dispatch(addToast({ type: 'success', message: '강제 환불 완료' }))
    } catch (e) {
      dispatch(addToast({ type: 'error', message: e.data?.message ?? '환불 실패' }))
    } finally {
      setActionId(null)
    }
  }

  const paymentColumns = [
    { key: 'paymentId', header: '결제ID', render: (r) => <span className="font-mono text-[11px]">{r.paymentId}</span> },
    { key: 'orderId', header: '주문ID', render: (r) => <span className="font-mono text-[11px]">{r.orderId}</span> },
    { key: 'amount', header: '금액', render: (r) => formatPrice(r.amount) },
    { key: 'method', header: '결제수단', render: (r) => <span className="text-[12px]">{r.method}</span> },
    { key: 'status', header: '상태', render: (r) => <Badge status={r.status} label={getStatusLabel(r.status)} /> },
    { key: 'paidAt', header: '결제일시', render: (r) => formatDate(r.paidAt) },
    {
      key: 'actions', header: '액션', render: (r) => (
        <div className="flex gap-2">
          {r.status === 'FAILED' && (
            <button onClick={() => handleRetry(r.paymentId)} disabled={actionId === r.paymentId}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-[12px] font-bold transition-colors disabled:opacity-50">
              <RefreshCw size={12} />재시도
            </button>
          )}
          {r.status === 'PAID' && (
            <button onClick={() => handleRefund(r.paymentId)} disabled={actionId === r.paymentId}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[12px] font-bold transition-colors disabled:opacity-50">
              <DollarSign size={12} />강제환불
            </button>
          )}
        </div>
      ),
    },
  ]

  const violationColumns = [
    { key: 'idempotencyKey', header: '멱등성 키', render: (r) => <span className="font-mono text-[11px]">{r.idempotencyKey}</span> },
    { key: 'duplicateCount', header: '중복 횟수', render: (r) => <span className="font-bold text-red-400">{r.duplicateCount}</span> },
    { key: 'firstOccurrence', header: '최초 발생', render: (r) => formatDate(r.firstOccurrence) },
    { key: 'lastOccurrence', header: '최근 발생', render: (r) => formatDate(r.lastOccurrence) },
    { key: 'resolved', header: '해결', render: (r) => <Badge status={r.resolved ? 'COMPLETED' : 'FAILED'} label={r.resolved ? '해결됨' : '미해결'} /> },
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
          <h3 className="text-[15px] font-bold text-white mb-4">결제 목록</h3>
          <DataTable columns={paymentColumns} data={payments?.content} isLoading={paymentsLoading} />
        </div>
      )}

      {tab === 1 && (
        <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50">
          <h3 className="text-[15px] font-bold text-white mb-4">정산 리포트</h3>
          {reportLoading ? (
            <p className="text-slate-400 text-[13px]">불러오는 중...</p>
          ) : report ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: '총 결제액', value: formatPrice(report.totalPaid) },
                  { label: '총 환불액', value: formatPrice(report.totalRefunded) },
                  { label: '순 매출', value: formatPrice(report.netRevenue), highlight: true },
                  { label: '불일치 건수', value: `${report.discrepancyCount}건`, warn: report.discrepancyCount > 0 },
                ].map(({ label, value, highlight, warn }) => (
                  <div key={label} className="bg-[#0f172a] rounded-xl p-4">
                    <p className="text-[11px] text-slate-400 mb-1">{label}</p>
                    <p className={`text-[18px] font-black ${highlight ? 'text-[#3ea76e]' : warn ? 'text-red-400' : 'text-white'}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-[13px]">데이터 없음</p>
          )}
        </div>
      )}

      {tab === 2 && (
        <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert size={16} className="text-yellow-400" />
            <h3 className="text-[15px] font-bold text-white">멱등성 위반 목록</h3>
          </div>
          <DataTable columns={violationColumns} data={violations} isLoading={violationsLoading} emptyText="멱등성 위반이 없습니다." />
        </div>
      )}
    </div>
  )
}
