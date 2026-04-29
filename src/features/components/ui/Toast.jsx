import { useEffect } from 'react'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { removeToast, selectToasts } from '@/features/ui/uiSlice'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

const icons = {
  success: <CheckCircle size={16} className="text-emerald-400 shrink-0" />,
  error: <XCircle size={16} className="text-red-400 shrink-0" />,
  warning: <AlertCircle size={16} className="text-yellow-400 shrink-0" />,
}

function ToastItem({ toast }) {
  const dispatch = useAppDispatch()
  useEffect(() => {
    const t = setTimeout(() => dispatch(removeToast(toast.id)), toast.duration ?? 3000)
    return () => clearTimeout(t)
  }, [toast.id, toast.duration, dispatch])

  return (
    <div className="flex items-start gap-3 bg-[#1e293b] border border-slate-600/50 rounded-xl px-4 py-3 shadow-2xl min-w-[280px] max-w-sm">
      {icons[toast.type] ?? icons.success}
      <p className="text-[13px] text-slate-200 flex-1">{toast.message}</p>
      <button onClick={() => dispatch(removeToast(toast.id))} className="text-slate-500 hover:text-slate-300 mt-0.5">
        <X size={14} />
      </button>
    </div>
  )
}

export default function Toast() {
  const toasts = useAppSelector(selectToasts)
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
    </div>
  )
}
