'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface TrendLineChartProps {
  data: Array<{ date: string; count: number }>
  color?: string
  label?: string
}

export function TrendLineChart({ data, color = '#3B82F6', label = 'Count' }: TrendLineChartProps) {
  const formatted = data.map(d => ({
    ...d,
    date: d.date.slice(5), // "02-15" format
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
        <Line
          type="monotone"
          dataKey="count"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 3 }}
          name={label}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
