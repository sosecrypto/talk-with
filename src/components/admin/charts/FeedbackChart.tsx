'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  type PieLabelRenderProps,
} from 'recharts'

interface FeedbackChartProps {
  typeDistribution: Array<{ type: string; count: number }>
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

const TYPE_LABELS: Record<string, string> = {
  accuracy: 'Accuracy',
  style: 'Style',
  helpfulness: 'Helpfulness',
  other: 'Other',
}

export function FeedbackChart({ typeDistribution }: FeedbackChartProps) {
  const data = typeDistribution.map(d => ({
    name: TYPE_LABELS[d.type] || d.type,
    value: d.count,
  }))

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-gray-500">No feedback data</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={(props: PieLabelRenderProps) => `${props.name ?? ''}: ${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F9FAFB',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
