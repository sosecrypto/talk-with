'use client'

import { useEffect, useState } from 'react'
import { TrendLineChart } from '@/components/admin/charts/TrendLineChart'
import { PersonaBarChart } from '@/components/admin/charts/PersonaBarChart'
import { TokenPieChart } from '@/components/admin/charts/TokenPieChart'
import { FeedbackChart } from '@/components/admin/charts/FeedbackChart'
import { QualityBarChart } from '@/components/admin/charts/QualityBarChart'
import { FeedbackTrendChart } from '@/components/admin/charts/FeedbackTrendChart'

interface PersonaStat {
  personaId: string
  name: string
  slug: string
  conversationCount: number
  avgRating: number | null
}

interface AnalyticsData {
  personaStats: PersonaStat[]
  dailyConversations: Array<{ date: string; count: number }>
  tokenStats: {
    totalInput: number
    totalOutput: number
    avgInput: number
    avgOutput: number
  }
  feedbackStats: {
    avgRating: number | null
    totalCount: number
    thumbsUpCount: number
    thumbsUpRate: number
    typeDistribution: Array<{ type: string; count: number }>
  }
  topUsers: Array<{
    id: string
    name: string | null
    email: string
    conversationCount: number
  }>
}

interface QualityData {
  overallQuality: {
    thumbsUpRate: number
    avgRating: number
    totalFeedbackCount: number
    thumbsUpCount: number
    thumbsDownCount: number
  }
  personaQuality: Array<{
    personaName: string
    thumbsUpRate: number
    totalFeedback: number
    avgRating: number | null
  }>
  feedbackTrend: Array<{
    date: string
    thumbsUpCount: number
    thumbsDownCount: number
    thumbsUpRate: number
  }>
  typeDistribution: Array<{ type: string; count: number }>
}

type Tab = 'overview' | 'personas' | 'tokens' | 'feedback' | 'quality'

const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'personas', label: 'Personas' },
  { key: 'tokens', label: 'Tokens' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'quality', label: 'Quality' },
]

const PERIODS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
]

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [qualityData, setQualityData] = useState<QualityData | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    let cancelled = false
    fetch(`/api/admin/analytics?period=${period}`)
      .then(res => res.json())
      .then(d => { if (!cancelled) setData(d) })
      .catch(console.error)
    return () => { cancelled = true }
  }, [period])

  useEffect(() => {
    if (activeTab !== 'quality') return
    let cancelled = false
    fetch(`/api/admin/quality?period=${period}`)
      .then(res => res.json())
      .then(d => { if (!cancelled) setQualityData(d) })
      .catch(console.error)
    return () => { cancelled = true }
  }, [activeTab, period])

  if (!data) return <div className="text-gray-500">Loading analytics...</div>

  const totalConversations = data.dailyConversations.reduce((sum, d) => sum + d.count, 0)
  const totalTokens = data.tokenStats.totalInput + data.tokenStats.totalOutput

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <select
          value={period}
          onChange={e => { setPeriod(e.target.value); setQualityData(null) }}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          {PERIODS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { if (tab.key === 'quality' && activeTab !== 'quality') setQualityData(null); setActiveTab(tab.key) }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Conversations" value={totalConversations} />
            <KPICard title="Total Tokens" value={totalTokens.toLocaleString()} />
            <KPICard title="Avg Rating" value={data.feedbackStats.avgRating?.toFixed(1) || '-'} />
            <KPICard title="Active Users" value={data.topUsers.length} />
          </div>

          {/* Daily Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Daily Conversations</h2>
            <TrendLineChart data={data.dailyConversations} label="Conversations" />
          </div>

          {/* Top Users */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top Users</h2>
            <div className="space-y-2">
              {data.topUsers.map((user, i) => (
                <div key={user.id} className="flex items-center gap-3 py-2">
                  <span className="text-sm text-gray-500 w-6">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.conversationCount} chats
                  </span>
                </div>
              ))}
              {data.topUsers.length === 0 && (
                <p className="text-gray-500 text-center py-4">No user data</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'personas' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Conversations by Persona</h2>
          {data.personaStats.length > 0 ? (
            <PersonaBarChart data={data.personaStats} />
          ) : (
            <p className="text-gray-500 text-center py-8">No conversation data yet</p>
          )}
        </div>
      )}

      {activeTab === 'tokens' && (
        <div className="space-y-6">
          {/* Token Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Input Tokens" value={data.tokenStats.totalInput.toLocaleString()} />
            <KPICard title="Output Tokens" value={data.tokenStats.totalOutput.toLocaleString()} />
            <KPICard title="Avg Input" value={data.tokenStats.avgInput.toLocaleString()} />
            <KPICard title="Avg Output" value={data.tokenStats.avgOutput.toLocaleString()} />
          </div>

          {/* Token Distribution Pie */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Input / Output Distribution</h2>
            <TokenPieChart inputTokens={data.tokenStats.totalInput} outputTokens={data.tokenStats.totalOutput} />
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="space-y-6">
          {/* Feedback Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Avg Rating" value={data.feedbackStats.avgRating?.toFixed(1) || '-'} />
            <KPICard title="Total Feedback" value={data.feedbackStats.totalCount} />
            <KPICard title="Thumbs Up" value={data.feedbackStats.thumbsUpCount} />
            <KPICard title="Thumbs Up Rate" value={`${data.feedbackStats.thumbsUpRate}%`} />
          </div>

          {/* Feedback Type Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Feedback Type Distribution</h2>
            <FeedbackChart typeDistribution={data.feedbackStats.typeDistribution} />
          </div>
        </div>
      )}

      {activeTab === 'quality' && (
        <div className="space-y-6">
          {!qualityData ? (
            <div className="text-gray-500">Loading quality data...</div>
          ) : (
            <>
              {/* Quality KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Thumbs Up Rate" value={`${Math.round(qualityData.overallQuality.thumbsUpRate * 100)}%`} />
                <KPICard title="Avg Rating" value={qualityData.overallQuality.avgRating > 0 ? qualityData.overallQuality.avgRating.toFixed(1) : '-'} />
                <KPICard title="Total Feedback" value={qualityData.overallQuality.totalFeedbackCount} />
                <KPICard title="Thumbs Up / Down" value={`${qualityData.overallQuality.thumbsUpCount} / ${qualityData.overallQuality.thumbsDownCount}`} />
              </div>

              {/* Feedback Trend */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Feedback Trend</h2>
                <FeedbackTrendChart data={qualityData.feedbackTrend} />
              </div>

              {/* Quality by Persona */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quality by Persona</h2>
                <QualityBarChart data={qualityData.personaQuality} />
              </div>

              {/* Type Distribution Table */}
              {qualityData.typeDistribution.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Feedback Categories</h2>
                  <div className="space-y-2">
                    {qualityData.typeDistribution.map(t => (
                      <div key={t.type} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{t.type}</span>
                        <span className="text-sm text-gray-500">{t.count} feedbacks</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function KPICard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  )
}
