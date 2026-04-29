import { ChevronRight, Check } from 'lucide-react'
import { useTransitionProductStatusMutation } from '@/api/productApi'

const STEPS = [
  { status: 'DRAFT',        label: '임시저장', next: 'REVIEW' },
  { status: 'REVIEW',       label: '검수 중',  next: 'READY' },
  { status: 'READY',        label: '판매대기', next: 'ON_SALE' },
  { status: 'ON_SALE',      label: '판매 중',  next: 'DISCONTINUED' },
  { status: 'DISCONTINUED', label: '판매종료', next: null },
]

const STEP_INDEX = Object.fromEntries(STEPS.map((s, i) => [s.status, i]))

export default function ProductLifecycleFlow({ productId, currentStatus }) {
  const [transition, { isLoading }] = useTransitionProductStatusMutation()
  const currentIdx = STEP_INDEX[currentStatus] ?? 0
  const nextStep = STEPS[currentIdx]?.next

  const handleAdvance = async () => {
    if (!nextStep) return
    await transition({ productId, targetStatus: nextStep })
  }

  const handleReject = async () => {
    // REVIEW → DRAFT (reject)
    if (currentStatus === 'REVIEW') {
      await transition({ productId, targetStatus: 'DRAFT' })
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Step indicators */}
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const isDone    = i < currentIdx
          const isCurrent = i === currentIdx
          return (
            <div key={step.status} className="flex items-center">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold shrink-0 ${
                  isDone    ? 'bg-[#3ea76e] text-white' :
                  isCurrent ? 'bg-blue-500 text-white ring-2 ring-blue-500/30' :
                              'bg-slate-700 text-slate-500'
                }`}
              >
                {isDone ? <Check size={12} /> : i + 1}
              </div>
              <span className={`ml-1 text-[11px] font-medium ${
                isCurrent ? 'text-blue-400' : isDone ? 'text-[#3ea76e]' : 'text-slate-500'
              }`}>{step.label}</span>
              {i < STEPS.length - 1 && (
                <ChevronRight size={14} className="mx-1 text-slate-600" />
              )}
            </div>
          )
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {nextStep && (
          <button
            onClick={handleAdvance}
            disabled={isLoading}
            className="px-3 py-1.5 bg-[#3ea76e] text-white text-[12px] font-semibold rounded-lg hover:bg-[#35916a] disabled:opacity-50 transition"
          >
            {nextStep === 'REVIEW' ? '검수 요청' :
             nextStep === 'READY'  ? '승인' :
             nextStep === 'ON_SALE' ? '판매 시작' :
             nextStep === 'DISCONTINUED' ? '판매 종료' : '다음 단계'}
          </button>
        )}
        {currentStatus === 'REVIEW' && (
          <button
            onClick={handleReject}
            disabled={isLoading}
            className="px-3 py-1.5 bg-red-900/30 text-red-400 border border-red-800/50 text-[12px] font-semibold rounded-lg hover:bg-red-900/50 disabled:opacity-50 transition"
          >
            반려 (임시저장으로)
          </button>
        )}
      </div>
    </div>
  )
}
