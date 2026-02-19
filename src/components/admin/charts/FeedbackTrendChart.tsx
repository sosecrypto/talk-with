'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface TrendData {
  date: string
  thumbsUpCount: number
  thumbsDownCount: number
  thumbsUpRate: number
}

interface FeedbackTrendChartProps {
  data: TrendData[]
}

export function FeedbackTrendChart({ data }: FeedbackTrendChartProps) {
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-gray-500">No trend data</div>
  }

  const formatted = data.map(d => ({
    ...d,
    date: String(d.date).slice(5, 10),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
        <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F9FAFB',
          }}
        />
        <Area
          type="monotone"
          dataKey="thumbsUpCount"
          stackId="1"
          stroke="#10B981"
          fill="#10B981"
          fillOpacity={0.6}
          name="Thumbs Up"
        />
        <Area
          type="monotone"
          dataKey="thumbsDownCount"
          stackId="1"
          stroke="#EF4444"
          fill="#EF4444"
          fillOpacity={0.6}
          name="Thumbs Down"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
