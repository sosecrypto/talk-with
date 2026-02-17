'use client'

import { Reveal } from './reveal'

export function DashboardSection() {
  return (
    <section className="py-32 px-6 bg-[#0F0F0F] text-white relative overflow-hidden">
      {/* Subtle grid bg */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-0 left-[20%] w-[40vw] h-[40vw] rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)' }} />

      <div className="relative max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <p className="text-[13px] font-semibold text-[#A855F7] uppercase tracking-[0.15em] mb-5">Intelligence</p>
            <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-black tracking-[-0.03em] leading-[1.15]">
              Your community is a goldmine of data.
            </h2>
            <p className="mt-5 text-[17px] text-[#666] max-w-xl mx-auto leading-[1.7]">
              Every question becomes an insight. Every trend becomes a strategy.
            </p>
          </div>
        </Reveal>

        {/* Bento Dashboard Grid */}
        <div className="grid md:grid-cols-12 gap-4">

          {/* Top Stats Row */}
          <Reveal delay={0} className="md:col-span-3">
            <div className="bg-white/[0.04] backdrop-blur-sm rounded-[20px] border border-white/[0.06] p-6 hover:bg-white/[0.08] transition-all duration-500 h-full">
              <div className="text-[11px] font-bold text-[#666] uppercase tracking-[0.15em] mb-3">Total Questions</div>
              <div className="text-4xl font-black text-white">12,847</div>
              <div className="flex items-center gap-1 mt-2">
                <svg className="w-3.5 h-3.5 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                <span className="text-[12px] font-semibold text-[#10B981]">+23% this week</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={80} className="md:col-span-3">
            <div className="bg-white/[0.04] backdrop-blur-sm rounded-[20px] border border-white/[0.06] p-6 hover:bg-white/[0.08] transition-all duration-500 h-full">
              <div className="text-[11px] font-bold text-[#666] uppercase tracking-[0.15em] mb-3">Auto-Resolved</div>
              <div className="text-4xl font-black text-[#10B981]">94.2%</div>
              <div className="mt-2 h-[4px] bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#10B981]" style={{ width: '94.2%' }} />
              </div>
            </div>
          </Reveal>
          <Reveal delay={160} className="md:col-span-3">
            <div className="bg-white/[0.04] backdrop-blur-sm rounded-[20px] border border-white/[0.06] p-6 hover:bg-white/[0.08] transition-all duration-500 h-full">
              <div className="text-[11px] font-bold text-[#666] uppercase tracking-[0.15em] mb-3">Sentiment</div>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-3xl font-black text-[#10B981]">62%</span>
                <span className="text-[13px] text-[#666] mb-1">positive</span>
              </div>
              <div className="flex gap-1 mt-3">
                {[62, 28, 10].map((v, i) => (
                  <div key={i} className="h-[6px] rounded-full" style={{ width: `${v}%`, backgroundColor: ['#10B981', '#F59E0B', '#EF4444'][i] }} />
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={240} className="md:col-span-3">
            <div className="bg-white/[0.04] backdrop-blur-sm rounded-[20px] border border-white/[0.06] p-6 hover:bg-white/[0.08] transition-all duration-500 h-full">
              <div className="text-[11px] font-bold text-[#666] uppercase tracking-[0.15em] mb-3">Active Regions</div>
              <div className="text-4xl font-black text-white">23</div>
              <div className="flex flex-wrap gap-1 mt-2">
                {['KR 35%', 'US 25%', 'JP 15%', 'EU 12%'].map((r) => (
                  <span key={r} className="text-[10px] font-medium text-[#888] bg-white/[0.06] px-2 py-0.5 rounded-full">{r}</span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Question Trends Chart */}
          <Reveal delay={100} className="md:col-span-7">
            <div className="bg-white/[0.04] backdrop-blur-sm rounded-[20px] border border-white/[0.06] p-6 hover:bg-white/[0.08] transition-all duration-500 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="text-[11px] font-bold text-[#666] uppercase tracking-[0.15em]">Question Trends</div>
                <div className="flex gap-2">
                  {['1W', '1M', '3M'].map((t, i) => (
                    <button key={t} className={`text-[11px] font-semibold px-3 py-1 rounded-lg ${i === 0 ? 'bg-[#7C3AED] text-white' : 'text-[#666] hover:text-white'} transition-colors`}>{t}</button>
                  ))}
                </div>
              </div>
              {/* Mini bar chart */}
              <div className="flex items-end gap-1.5 h-[140px]">
                {[45, 62, 38, 71, 55, 89, 67, 92, 78, 85, 95, 88, 102, 110].map((v, i) => {
                  const h = Math.round((v / 110) * 100)
                  return (
                    <div key={i} className="flex-1 group/bar relative cursor-pointer h-full flex items-end">
                      {/* Tooltip */}
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        <div className="bg-white text-[#1a1a1a] text-[10px] font-bold px-2 py-1 rounded-md shadow-lg whitespace-nowrap">{v}</div>
                      </div>
                      <div
                        className="w-full rounded-t-md transition-all duration-700 hover:opacity-90"
                        style={{
                          height: `${h}%`,
                          background: i >= 12
                            ? 'linear-gradient(180deg, #7C3AED, #A855F7)'
                            : i >= 10
                              ? 'linear-gradient(180deg, rgba(124,58,237,0.5), rgba(168,85,247,0.3))'
                              : 'linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,255,255,0.12))',
                        }}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between mt-3 text-[10px] text-[#555]">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </Reveal>

          {/* Top Categories */}
          <Reveal delay={200} className="md:col-span-5">
            <div className="bg-white/[0.04] backdrop-blur-sm rounded-[20px] border border-white/[0.06] p-6 hover:bg-white/[0.08] transition-all duration-500 h-full">
              <div className="text-[11px] font-bold text-[#666] uppercase tracking-[0.15em] mb-5">Top Categories</div>
              <div className="space-y-4">
                {[
                  { topic: 'Tokenomics', pct: 32, color: '#7C3AED', delta: '+5%' },
                  { topic: 'Roadmap', pct: 28, color: '#A855F7', delta: '+12%' },
                  { topic: 'Technical', pct: 20, color: '#3B82F6', delta: '-3%' },
                  { topic: 'Security', pct: 12, color: '#F59E0B', delta: '+8%' },
                  { topic: 'Partnerships', pct: 8, color: '#10B981', delta: '+2%' },
                ].map((item) => (
                  <div key={item.topic}>
                    <div className="flex justify-between text-[13px] mb-1.5">
                      <span className="font-semibold text-[#ccc]">{item.topic}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-medium ${item.delta.startsWith('+') ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>{item.delta}</span>
                        <span className="font-mono text-[#666] text-[12px]">{item.pct}%</span>
                      </div>
                    </div>
                    <div className="h-[5px] bg-white/[0.06] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Hot Questions */}
          <Reveal delay={150} className="md:col-span-6">
            <div className="bg-gradient-to-br from-[#F59E0B]/10 to-transparent backdrop-blur-sm rounded-[20px] border border-[#F59E0B]/20 p-6 h-full">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                <div className="text-[11px] font-bold text-[#F59E0B] uppercase tracking-[0.15em]">Needs Your Attention</div>
              </div>
              <div className="space-y-2.5">
                {[
                  { q: 'v2 migration timeline?', n: 87, trend: 'rising' },
                  { q: 'Token unlock schedule change?', n: 64, trend: 'rising' },
                  { q: 'L2 expansion plans?', n: 51, trend: 'stable' },
                  { q: 'New partnership announcements?', n: 38, trend: 'new' },
                ].map((item) => (
                  <div key={item.q} className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-xl border border-white/[0.04] hover:bg-white/[0.08] transition-all">
                    <span className="text-[12px] font-bold text-[#F59E0B] bg-[#F59E0B]/15 px-2.5 py-1 rounded-lg font-mono flex-shrink-0">{item.n}x</span>
                    <span className="text-[13px] text-[#aaa] flex-1">{item.q}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${item.trend === 'rising' ? 'text-[#EF4444] bg-[#EF4444]/10' : item.trend === 'new' ? 'text-[#3B82F6] bg-[#3B82F6]/10' : 'text-[#666] bg-white/[0.06]'}`}>{item.trend}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Weekly Report Preview */}
          <Reveal delay={250} className="md:col-span-6">
            <div className="bg-white/[0.04] backdrop-blur-sm rounded-[20px] border border-white/[0.06] p-6 h-full hover:bg-white/[0.08] transition-all duration-500">
              <div className="flex items-center justify-between mb-5">
                <div className="text-[11px] font-bold text-[#888] uppercase tracking-[0.15em]">Auto-Generated Weekly Report</div>
                <span className="text-[10px] font-medium text-[#555] bg-white/[0.06] px-3 py-1 rounded-full">Feb 3 - Feb 9</span>
              </div>
              <div className="space-y-3 text-[13px] text-[#888] leading-[1.7]">
                <div className="flex gap-2"><span className="text-[#A855F7]">&#x2022;</span> Community sentiment improved by <span className="text-white font-semibold">+8%</span> following v2 announcement</div>
                <div className="flex gap-2"><span className="text-[#F59E0B]">&#x2022;</span> <span className="text-[#F59E0B] font-semibold">87 unanswered questions</span> about migration timeline detected</div>
                <div className="flex gap-2"><span className="text-[#10B981]">&#x2022;</span> Korean community grew <span className="text-white font-semibold">+35%</span> &mdash; consider Korean AMA session</div>
                <div className="flex gap-2"><span className="text-[#3B82F6]">&#x2022;</span> Top new topic: <span className="text-white font-semibold">&ldquo;L2 expansion&rdquo;</span> appeared in 12% of conversations</div>
              </div>
              <button className="mt-5 text-[12px] font-semibold text-[#888] hover:text-white transition-colors flex items-center gap-1">
                View Full Report
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
