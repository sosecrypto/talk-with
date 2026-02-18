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

interface TokenPieChartProps {
  inputTokens: number
  outputTokens: number
}

const COLORS = ['#3B82F6', '#10B981']

export function TokenPieChart({ inputTokens, outputTokens }: TokenPieChartProps) {
  const data = [
    { name: 'Input Tokens', value: inputTokens },
    { name: 'Output Tokens', value: outputTokens },
  ]

  const total = inputTokens + outputTokens
  if (total === 0) {
    return <div className="flex items-center justify-center h-[300px] text-gray-500">No token data</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={(props: PieLabelRenderProps) => `${props.name ?? ''}: ${(((props.percent as number) ?? 0) * 100).toFixed(0)}%`}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F9FAFB',
          }}
          formatter={(value) => (value ?? 0).toLocaleString()}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
