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

interface PersonaQuality {
  personaName: string
  thumbsUpRate: number
  totalFeedback: number
}

interface QualityBarChartProps {
  data: PersonaQuality[]
}

export function QualityBarChart({ data }: QualityBarChartProps) {
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-gray-500">No quality data</div>
  }

  const formatted = data.slice(0, 15).map(d => ({
    name: d.personaName.length > 12 ? d.personaName.slice(0, 12) + '...' : d.personaName,
    fullName: d.personaName,
    rate: Math.round(d.thumbsUpRate * 100),
    totalFeedback: d.totalFeedback,
  }))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={formatted} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9CA3AF" unit="%" />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="#9CA3AF" width={80} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F9FAFB',
          }}
          formatter={(value, _name, props) => {
            const payload = props.payload as { fullName?: string; totalFeedback?: number }
            return [`${value}% (${payload.totalFeedback} feedbacks)`, payload.fullName ?? '']
          }}
        />
        <Bar dataKey="rate" fill="#10B981" radius={[0, 4, 4, 0]} name="Thumbs Up Rate" />
      </BarChart>
    </ResponsiveContainer>
  )
}
