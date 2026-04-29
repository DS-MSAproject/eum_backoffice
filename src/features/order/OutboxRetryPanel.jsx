import { useState } from 'react'
import { useGetOutboxPendingEventsQuery, useRetryOutboxEventMutation, useApplyCompensationMutation } from '@/api/orderApi'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { addToast } from '@/features/ui/uiSlice'
import { formatDate } from '@/shared/utils/formatters'
import DataTable from '@/shared/components/DataTable'
import Badge from '@/shared/components/Badge'
import { RefreshCw, Undo2 } from 'lucide-react'

export default function OutboxRetryPanel() {
  const dispatch = useAppDispatch()
  const { data, isLoading, refetch } = useGetOutboxPendingEventsQuery()
  const [retryEvent, { isLoading: retrying }] = useRetryOutboxEventMutation()
  const [applyCompensation, { isLoading: compensating }] = useApplyCompensationMutation()
  const [actionId, setActionId] = useState(null)

  const handleRetry = async (id) => {
    setActionId(id)
    try {
      await retryEvent(id).unwrap()
      dispatch(addToast({ type: 'success', message: `이벤트 ${id} 재시도 완료` }))
      refetch()
    } catch (e) {
      dispatch(addToast({ type: 'error', message: e.data?.message ?? '재시도 실패' }))
    } finally {
      setActionId(null)
    }
  }

  const handleCompensation = async (id) => {
    if (!window.confirm('보상 트랜잭션을 실행하시겠습니까?')) return
    setActionId(id)
    try {
      await applyCompensation(id).unwrap()
      dispatch(addToast({ type: 'success', message: `보상 트랜잭션 실행 완료` }))
      refetch()
    } catch (e) {
      dispatch(addToast({ type: 'error', message: e.data?.message ?? '보상 트랜잭션 실패' }))
    } finally {
      setActionId(null)
    }
  }

  const columns = [
    { key: 'id', header: 'ID', width: 80, render: (r) => <span className="font-mono text-[11px]">{r.id}</span> },
    { key: 'eventType', header: '이벤트 타입', render: (r) => <span className="font-mono text-[12px] text-blue-300">{r.eventType}</span> },
    { key: 'aggregateId', header: 'Aggregate ID', render: (r) => <span className="font-mono text-[11px]">{r.aggregateId}</span> },
    { key: 'retryCount', header: '재시도', width: 80, render: (r) => (
      <span className={`font-bold ${r.retryCount >= 3 ? 'text-red-400' : 'text-slate-300'}`}>{r.retryCount}</span>
    )},
    { key: 'status', header: '상태', render: (r) => <Badge status={r.status} label={r.status} /> },
    { key: 'createdAt', header: '생성시각', render: (r) => formatDate(r.createdAt) },
    {
      key: 'actions', header: '액션', render: (r) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleRetry(r.id)}
            disabled={actionId === r.id && retrying}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-[12px] font-bold transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} />재시도
          </button>
          <button
            onClick={() => handleCompensation(r.id)}
            disabled={actionId === r.id && compensating}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[12px] font-bold transition-colors disabled:opacity-50"
          >
            <Undo2 size={12} />보상
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-bold text-white">Outbox 미처리 이벤트</h3>
          <p className="text-[12px] text-slate-400 mt-0.5">처리 실패한 이벤트를 재시도하거나 보상 트랜잭션을 실행합니다.</p>
        </div>
        <button onClick={refetch} className="text-slate-400 hover:text-slate-200 transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>
      <DataTable columns={columns} data={data} isLoading={isLoading} emptyText="미처리 이벤트가 없습니다." />
    </div>
  )
}
