import { useGetServicesHealthQuery, useGetKafkaConsumerLagQuery } from '@/api/monitoringApi'
import Badge from '@/shared/components/Badge'
import { formatDate, formatNumber } from '@/shared/utils/formatters'
import { Activity, RefreshCw } from 'lucide-react'

function ServiceCard({ service }) {
  const isUp = service.status === 'UP'
  const isDegraded = service.status === 'DEGRADED'
  return (
    <div className={`bg-[#1e293b] rounded-xl p-4 border ${isUp ? 'border-slate-700/50' : isDegraded ? 'border-yellow-500/30' : 'border-red-500/30'}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[14px] font-bold text-white">{service.serviceName}</p>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">{service.host}</p>
        </div>
        <Badge status={service.status} label={service.status} />
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {[
          { label: '응답시간', value: service.responseTimeMs != null ? `${service.responseTimeMs}ms` : '-' },
          { label: 'CPU', value: service.cpuUsage != null ? `${service.cpuUsage}%` : '-' },
          { label: '메모리', value: service.memoryUsage != null ? `${service.memoryUsage}%` : '-' },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[10px] text-slate-500">{label}</p>
            <p className="text-[12px] font-bold text-slate-300">{value}</p>
          </div>
        ))}
      </div>
      {service.lastCheckedAt && (
        <p className="text-[10px] text-slate-600 mt-2">{formatDate(service.lastCheckedAt)}</p>
      )}
    </div>
  )
}

function KafkaLagTable({ data, isLoading }) {
  if (isLoading) return <p className="text-slate-400 text-[13px]">불러오는 중...</p>
  if (!data?.length) return <p className="text-slate-500 text-[13px]">데이터 없음</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-slate-700/50">
            {['Consumer Group', 'Topic', 'Partition', 'Lag', '상태'].map(h => (
              <th key={h} className="px-3 py-2 text-left text-[11px] font-bold text-slate-400 uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/20">
              <td className="px-3 py-2 font-mono text-slate-300">{row.consumerGroup}</td>
              <td className="px-3 py-2 font-mono text-blue-300">{row.topic}</td>
              <td className="px-3 py-2 text-slate-400">{row.partition}</td>
              <td className={`px-3 py-2 font-bold ${row.lag > 100 ? 'text-red-400' : row.lag > 10 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                {formatNumber(row.lag)}
              </td>
              <td className="px-3 py-2">
                <Badge
                  status={row.lag > 100 ? 'FAILED' : row.lag > 10 ? 'PENDING' : 'COMPLETED'}
                  label={row.lag > 100 ? '위험' : row.lag > 10 ? '주의' : '정상'}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ServiceHealthPage() {
  const { data: services, isLoading: servicesLoading, refetch: refetchHealth } = useGetServicesHealthQuery(undefined, { pollingInterval: 15000 })
  const { data: kafkaLag, isLoading: kafkaLoading, refetch: refetchKafka } = useGetKafkaConsumerLagQuery(undefined, { pollingInterval: 15000 })

  const upCount = services?.filter(s => s.status === 'UP').length ?? 0
  const total = services?.length ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-[#3ea76e]" />
          <h2 className="text-[16px] font-bold text-white">서비스 헬스 체크</h2>
          <span className="text-[12px] text-slate-400">({upCount}/{total} 정상)</span>
        </div>
        <button onClick={() => { refetchHealth(); refetchKafka() }} className="text-slate-400 hover:text-slate-200 transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      {servicesLoading ? (
        <p className="text-slate-400 text-[13px]">서비스 상태 조회 중...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {services?.map(s => <ServiceCard key={s.serviceName} service={s} />)}
        </div>
      )}

      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-[15px] font-bold text-white mb-4">Kafka Consumer Lag</h3>
        <KafkaLagTable data={kafkaLag} isLoading={kafkaLoading} />
      </div>
    </div>
  )
}
