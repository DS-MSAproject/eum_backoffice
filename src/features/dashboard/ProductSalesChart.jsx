import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { useGetProductSalesQuery } from '@/api/orderApi'
import { formatPrice, formatNumber } from '@/shared/utils/formatters'
import Spinner from '@/shared/components/Spinner'

const QUANTITY_COLOR = '#3ea76e'
const REVENUE_COLOR  = '#3b82f6'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const isRevenue = payload[0].dataKey === 'totalRevenue'
  return (
    <div className="bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-[12px]">
      <p className="text-slate-200 font-bold mb-1">{d.fullName}</p>
      <p style={{ color: payload[0].fill }}>
        {isRevenue ? formatPrice(d.totalRevenue) : `${formatNumber(d.totalQuantity)}개`}
      </p>
    </div>
  )
}

export default function ProductSalesChart() {
  const [metric, setMetric] = useState('quantity')
  const { data = [], isLoading } = useGetProductSalesQuery({ limit: 15 })

  const chartData = data.map((d) => ({
    name: d.productName?.length > 9 ? d.productName.slice(0, 9) + '…' : (d.productName ?? '-'),
    fullName: d.productName ?? '-',
    totalQuantity: d.totalQuantity ?? 0,
    totalRevenue: d.totalRevenue ?? 0,
  }))

  const isRevenue = metric === 'revenue'
  const dataKey   = isRevenue ? 'totalRevenue' : 'totalQuantity'
  const barColor  = isRevenue ? REVENUE_COLOR : QUANTITY_COLOR

  return (
    <div className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-bold text-white">제품별 판매 현황 (완료 주문 기준)</h3>
        <div className="flex gap-1">
          {[
            { key: 'quantity', label: '판매량', color: 'emerald' },
            { key: 'revenue',  label: '매출액', color: 'blue' },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setMetric(key)}
              className={`px-3 py-1 text-[11px] rounded-lg font-bold transition-colors ${
                metric === key
                  ? `bg-${color}-500/20 text-${color}-400`
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : chartData.length === 0 ? (
        <p className="text-[13px] text-slate-500 py-12 text-center">완료된 주문 데이터가 없습니다.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 64, left: 8 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              angle={-40}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickFormatter={isRevenue ? (v) => `${Math.round(v / 10000)}만` : formatNumber}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} maxBarSize={44}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={barColor} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
