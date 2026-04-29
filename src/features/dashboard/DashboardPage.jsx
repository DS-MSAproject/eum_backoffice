import { useGetDashboardSummaryQuery } from '@/api/monitoringApi'
import { formatPrice, formatNumber } from '@/shared/utils/formatters'
import Spinner from '@/shared/components/Spinner'
import ProductSalesChart from './ProductSalesChart'
import { ShoppingCart, CreditCard, Package, AlertTriangle, TrendingUp, Activity } from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color = 'green' }) {
  const colorMap = {
    green: 'text-[#3ea76e] bg-[#3ea76e]/10',
    blue: 'text-blue-400 bg-blue-400/10',
    yellow: 'text-yellow-400 bg-yellow-400/10',
    red: 'text-red-400 bg-red-400/10',
  }
  return (
    <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-[28px] font-black text-white">{value}</p>
      <p className="text-[13px] font-bold text-slate-400 mt-1">{label}</p>
      {sub && <p className="text-[12px] text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const { data, isLoading } = useGetDashboardSummaryQuery(undefined, { pollingInterval: 30000 })

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size={32} />
      </div>
    )

  const s = data ?? {}

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-black text-white">시스템 현황</h2>
        <p className="text-[13px] text-slate-400 mt-0.5">30초마다 자동 갱신됩니다.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={ShoppingCart} label="오늘 주문" value={formatNumber(s.todayOrders)} sub={`총 ${formatNumber(s.totalOrders)}건`} color="blue" />
        <StatCard icon={CreditCard} label="오늘 결제" value={formatPrice(s.todayRevenue)} sub={`총 ${formatPrice(s.totalRevenue)}`} color="green" />
        <StatCard icon={Package} label="재고 부족" value={formatNumber(s.lowStockCount)} sub="10개 이하 품목" color={s.lowStockCount > 0 ? 'yellow' : 'green'} />
        <StatCard icon={AlertTriangle} label="실패 주문" value={formatNumber(s.failedOrders)} sub="Outbox 미처리" color={s.failedOrders > 0 ? 'red' : 'green'} />
        <StatCard icon={TrendingUp} label="결제 불일치" value={formatNumber(s.reconciliationIssues)} sub="정산 오류" color={s.reconciliationIssues > 0 ? 'yellow' : 'green'} />
        <StatCard icon={Activity} label="서비스 상태" value={`${s.healthyServices ?? 0}/${s.totalServices ?? 0}`} sub="정상 서비스" color={s.healthyServices === s.totalServices ? 'green' : 'red'} />
      </div>

      <ProductSalesChart />

      <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-[14px] font-bold text-white mb-4">최근 주문 상태 분포</h3>
        {s.orderStatusBreakdown ? (
          <div className="space-y-2">
            {Object.entries(s.orderStatusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-[13px] text-slate-400">{status}</span>
                <span className="text-[13px] font-bold text-white">{formatNumber(count)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-slate-500">데이터 없음</p>
        )}
      </div>
    </div>
  )
}
