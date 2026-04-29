import { useGetServicesHealthQuery } from '@/api/monitoringApi'
import { formatDate } from '@/shared/utils/formatters'
import { Activity, RefreshCw, Cpu, MemoryStick, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import Spinner from '@/shared/components/Spinner'

// ── 상태 설정 ──────────────────────────────────────────
const STATUS_CONFIG = {
  UP:       { label: 'UP',      dot: 'bg-[#3ea76e]', text: 'text-[#3ea76e]', border: 'border-[#3ea76e]/20', icon: CheckCircle2 },
  DEGRADED: { label: 'DEGRADED', dot: 'bg-yellow-400', text: 'text-yellow-400', border: 'border-yellow-400/20', icon: AlertCircle },
  DOWN:     { label: 'DOWN',    dot: 'bg-red-500',    text: 'text-red-400',    border: 'border-red-500/20',    icon: XCircle },
  UNKNOWN:  { label: 'UNKNOWN', dot: 'bg-slate-500',  text: 'text-slate-400',  border: 'border-slate-600/30', icon: AlertCircle },
}

// ── 게이지 바 ──────────────────────────────────────────
function GaugeBar({ value, label, icon: Icon, unit = '%', mb }) {
  const pct = value ?? 0
  const color = pct >= 85 ? '#ef4444' : pct >= 70 ? '#f59e0b' : '#3ea76e'
  const textColor = pct >= 85 ? 'text-red-400' : pct >= 70 ? 'text-yellow-400' : 'text-[#3ea76e]'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Icon size={11} />
          <span className="text-[11px]">{label}</span>
        </div>
        <div className="text-right">
          {value != null ? (
            <span className={`text-[12px] font-bold tabular-nums ${textColor}`}>
              {value.toFixed(1)}{unit}
            </span>
          ) : (
            <span className="text-[11px] text-slate-600">-</span>
          )}
          {mb != null && (
            <span className="text-[10px] text-slate-600 ml-1">({mb}MB)</span>
          )}
        </div>
      </div>
      <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

// ── 서비스 카드 ────────────────────────────────────────
function ServiceCard({ service }) {
  const cfg = STATUS_CONFIG[service.status] ?? STATUS_CONFIG.UNKNOWN
  const StatusIcon = cfg.icon
  const displayName = service.serviceName
    .replace('dseum-', '')
    .replace('server', 'server')
    .toUpperCase()

  return (
    <div className={`bg-[#1e293b] rounded-xl border ${cfg.border} p-4 space-y-3 hover:bg-[#1e293b]/80 transition-colors`}>
      {/* 서비스명 + 상태 */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-white truncate">{displayName}</p>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{service.serviceName}</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-black/20 shrink-0 ${cfg.text}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${service.status === 'UP' ? 'animate-pulse' : ''}`} />
          <span className="text-[10px] font-bold">{cfg.label}</span>
        </div>
      </div>

      {/* CPU / Memory 게이지 */}
      {service.status === 'UP' || service.status === 'DEGRADED' ? (
        <div className="space-y-2.5">
          <GaugeBar
            value={service.cpuUsage}
            label="CPU"
            icon={Cpu}
          />
          <GaugeBar
            value={service.memoryUsagePercent}
            label="메모리"
            icon={MemoryStick}
            mb={service.memoryUsedMb}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center py-3">
          <div className="flex items-center gap-1.5 text-slate-600">
            <XCircle size={14} />
            <span className="text-[11px]">메트릭 수집 불가</span>
          </div>
        </div>
      )}

      {/* 응답시간 */}
      {service.responseTimeMs != null && (
        <div className="flex items-center justify-between pt-1 border-t border-slate-700/40">
          <div className="flex items-center gap-1 text-slate-500">
            <Clock size={10} />
            <span className="text-[10px]">응답시간</span>
          </div>
          <span className={`text-[11px] font-bold tabular-nums ${
            service.responseTimeMs > 1000 ? 'text-red-400' :
            service.responseTimeMs > 500  ? 'text-yellow-400' : 'text-slate-400'
          }`}>
            {service.responseTimeMs}ms
          </span>
        </div>
      )}
    </div>
  )
}

// ── 요약 배지 ──────────────────────────────────────────
function SummaryBadge({ label, count, color }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50`}>
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-[12px] text-slate-300">{label}</span>
      <span className="text-[13px] font-bold text-white">{count}</span>
    </div>
  )
}

// ── 메인 페이지 ────────────────────────────────────────
export default function ServiceHealthPage() {
  const { data: services, isLoading, refetch } = useGetServicesHealthQuery(
    undefined,
    { pollingInterval: 15000 },
  )

  const counts = {
    UP:       services?.filter(s => s.status === 'UP').length       ?? 0,
    DEGRADED: services?.filter(s => s.status === 'DEGRADED').length ?? 0,
    DOWN:     services?.filter(s => s.status === 'DOWN').length     ?? 0,
  }
  const total = services?.length ?? 0

  const avgCpu = services?.length
    ? (services.filter(s => s.cpuUsage != null).reduce((acc, s) => acc + (s.cpuUsage ?? 0), 0) /
       Math.max(1, services.filter(s => s.cpuUsage != null).length)).toFixed(1)
    : null

  const avgMem = services?.length
    ? (services.filter(s => s.memoryUsagePercent != null).reduce((acc, s) => acc + (s.memoryUsagePercent ?? 0), 0) /
       Math.max(1, services.filter(s => s.memoryUsagePercent != null).length)).toFixed(1)
    : null

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-[#3ea76e]" />
            <h2 className="text-[18px] font-black text-white">시스템 모니터링</h2>
          </div>
          <p className="text-[12px] text-slate-500 mt-0.5">15초마다 자동 갱신 · {total}개 서비스</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-slate-400 border border-slate-700 rounded-lg hover:border-slate-500 hover:text-slate-200 transition-colors"
        >
          <RefreshCw size={13} />
          새로고침
        </button>
      </div>

      {/* 요약 + 평균 메트릭 */}
      <div className="flex flex-wrap gap-2">
        <SummaryBadge label="정상"    count={counts.UP}       color="bg-[#3ea76e]" />
        <SummaryBadge label="저하"    count={counts.DEGRADED} color="bg-yellow-400" />
        <SummaryBadge label="다운"    count={counts.DOWN}     color="bg-red-500" />
        {avgCpu  && <SummaryBadge label="평균 CPU"  count={`${avgCpu}%`}  color="bg-blue-400" />}
        {avgMem  && <SummaryBadge label="평균 메모리" count={`${avgMem}%`} color="bg-purple-400" />}
      </div>

      {/* 카드 그리드 */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size={28} /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {services?.map(s => <ServiceCard key={s.serviceName} service={s} />)}
        </div>
      )}
    </div>
  )
}
