'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface PersonaStat {
  name: string
  conversationCount: number
  avgRating: number | null
}

interface PersonaBarChartProps {
  data: PersonaStat[]
}

export function PersonaBarChart({ data }: PersonaBarChartProps) {
  const truncated = data.slice(0, 15).map(d => ({
    ...d,
    name: d.name.length > 12 ? d.name.slice(0, 12) + '...' : d.name,
    fullName: d.name,
  }))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={truncated} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#9CA3AF" width={80} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F9FAFB',
          }}
          formatter={(value, _name, props) => {
            const payload = props.payload as { fullName?: string; avgRating?: number | null }
            const rating = payload.avgRating
            return [`${value} conversations${rating ? ` (${rating.toFixed(1)} rating)` : ''}`, payload.fullName ?? '']
          }}
        />
        <Bar dataKey="conversationCount" fill="#3B82F6" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
