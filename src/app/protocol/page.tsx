'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { projects, uniswapChat, arbitrumChat, features, amaPhases, type Project } from './data'
import { Reveal } from '@/components/protocol/reveal'
import { DashboardSection } from '@/components/protocol/dashboard-section'
import { ChatDemoSection } from '@/components/protocol/chat-demo-section'
import { HeroSection } from '@/components/protocol/hero-section'

/* ─────────────────── HOOKS ─────────────────── */

function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])
  return pos
}

/* ─────────────────── COMPONENTS ─────────────────── */

function Marquee({ children, speed = 30, reverse = false }: { children: React.ReactNode; speed?: number; reverse?: boolean }) {
  return (
    <div className="overflow-hidden whitespace-nowrap w-full">
      <div
        className="inline-flex w-max"
        style={{
          animation: `marquee ${speed}s linear infinite ${reverse ? 'reverse' : ''}`,
        }}
      >
        {children}
        {children}
      </div>
    </div>
  )
}

function LogoIcon({ project, size = 32 }: { project: Project; size?: number }) {
  if (project.logo) {
    return (
      <div className="rounded-full overflow-hidden flex items-center justify-center bg-white flex-shrink-0" style={{ width: size, height: size }}>
        <img src={project.logo} alt={project.name} width={size - 4} height={size - 4} className="object-contain" />
      </div>
    )
  }
  return (
    <div className="rounded-full flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0" style={{ backgroundColor: project.color, width: size, height: size, fontSize: size * 0.35 }}>
      {project.symbol.slice(0, 2)}
    </div>
  )
}

function LogoPill({ project }: { project: Project }) {
  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2.5 mx-2 bg-white/80 dark:bg-white/[0.06] backdrop-blur-sm rounded-full border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.04)] hover:-translate-y-1 transition-all duration-500 cursor-default select-none flex-shrink-0">
      <LogoIcon project={project} size={24} />
      <span className="text-[13px] font-semibold text-[#1a1a1a] dark:text-white/90 tracking-tight whitespace-nowrap">{project.symbol}</span>
    </div>
  )
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Reveal delay={index * 100}>
      <div
        className="group relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className="absolute -inset-[1px] rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
          style={{ background: `linear-gradient(135deg, ${project.color}40, ${project.color}10)` }}
        />
        <div className="relative bg-white dark:bg-white/[0.04] rounded-[28px] border border-black/[0.06] dark:border-white/[0.06] p-6 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500 h-full flex flex-col items-center text-center">
          {/* Photo */}
          <div className="relative mb-5">
            <div className="w-28 h-28 rounded-2xl overflow-hidden">
              {project.photo ? (
                <img src={project.photo} alt={project.ceo} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: project.color }}>
                  {project.avatar}
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-[#1a1a1a] border-2 border-white dark:border-[#1a1a1a] shadow-sm flex items-center justify-center overflow-hidden">
              {project.logo ? (
                <img src={project.logo} alt={project.symbol} className="w-6 h-6 rounded-full object-contain" />
              ) : (
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] text-white font-bold" style={{ backgroundColor: project.color }}>{project.symbol[0]}</div>
              )}
            </div>
          </div>
          {/* Info */}
          <div className="text-[17px] font-bold text-[#1a1a1a] dark:text-white tracking-tight">{project.ceo}</div>
          <div className="text-[13px] text-[#999] dark:text-[#777] mt-1">{project.title}</div>
          <div className="text-[13px] font-semibold mt-1.5" style={{ color: project.color }}>{project.name}</div>
          <div
            className="mt-5 h-[2px] rounded-full transition-all duration-700 w-full"
            style={{
              background: `linear-gradient(90deg, ${project.color}, ${project.color}30)`,
              width: hovered ? '100%' : '30%',
            }}
          />
        </div>
      </div>
    </Reveal>
  )
}

/* ─────────────────── MAIN PAGE ─────────────────── */

export default function ProtocolLanding() {
  const [mounted, setMounted] = useState(false)
  const [chatStep, setChatStep] = useState(-1)
  const [isDark, setIsDark] = useState(false)
  const mouse = useMousePosition()
  const heroRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const [chatVisible, setChatVisible] = useState(false)

  // Initialize theme from localStorage (default: light)
  useEffect(() => {
    const stored = localStorage.getItem('twp-theme')
    if (stored === 'dark') {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    } else {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    }
    setMounted(true)
  }, [])

  // Chat animation
  useEffect(() => {
    if (!chatVisible) return
    const maxLen = Math.max(uniswapChat.length, arbitrumChat.length)
    const timers = Array.from({ length: maxLen }, (_, i) => setTimeout(() => setChatStep(i), (i + 1) * 1400))
    return () => timers.forEach(clearTimeout)
  }, [chatVisible])

  useEffect(() => {
    const el = chatRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setChatVisible(true) }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const toggleTheme = useCallback(() => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('twp-theme', next ? 'dark' : 'light')
  }, [isDark])

  const parallax = useCallback((factor: number) => {
    if (typeof window === 'undefined') return {}
    return {
      transform: `translate(${(mouse.x - window.innerWidth / 2) * factor}px, ${(mouse.y - window.innerHeight / 2) * factor}px)`,
      transition: 'transform 0.3s ease-out',
    }
  }, [mouse])

  return (
    <div className="min-h-screen bg-[#FAF9F7] dark:bg-[#0a0a0a] text-[#1a1a1a] dark:text-white overflow-x-hidden selection:bg-[#7C3AED]/20 selection:text-[#7C3AED]">

      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.025]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat', backgroundSize: '128px 128px' }} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-4 mt-4">
          <div className="max-w-6xl mx-auto bg-white/70 dark:bg-[#1a1a1a]/70 backdrop-blur-2xl rounded-2xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="px-6 h-14 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] dark:bg-white flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" className="fill-white dark:fill-[#1a1a1a]" opacity="0.9"/><path d="M2 17l10 5 10-5" className="stroke-white dark:stroke-[#1a1a1a]" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12l10 5 10-5" className="stroke-white dark:stroke-[#1a1a1a]" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span className="font-bold text-[15px] tracking-tight">Talk With Protocol</span>
              </div>
              <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#888]">
                <a href="#personas" className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors duration-300">Personas</a>
                <a href="#features" className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors duration-300">Features</a>
                <a href="#ama" className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors duration-300">AMA 2.0</a>
                <a href="#pricing" className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors duration-300">Pricing</a>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className="w-9 h-9 rounded-xl bg-[#f7f5f2] dark:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center hover:bg-[#eee] dark:hover:bg-white/[0.15] transition-all duration-300"
                  aria-label="Toggle theme"
                >
                  {isDark ? (
                    <svg className="w-4 h-4 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                  ) : (
                    <svg className="w-4 h-4 text-[#666]" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                  )}
                </button>
                <button className="px-5 py-2 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] text-[13px] font-semibold rounded-xl hover:bg-[#333] dark:hover:bg-[#e0e0e0] transition-all duration-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                  Early Access
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <HeroSection mounted={mounted} parallax={parallax} heroRef={heroRef} />

      {/* ═══════════════ MARQUEE ═══════════════ */}
      <section className="py-6 border-y border-black/[0.04] dark:border-white/[0.04]">
        <Marquee speed={40}>
          {projects.map((p) => <LogoPill key={p.symbol} project={p} />)}
        </Marquee>
      </section>

      {/* ═══════════════ PROBLEM ═══════════════ */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="max-w-3xl">
              <p className="text-[13px] font-semibold text-[#F43F5E] uppercase tracking-[0.15em] mb-5">The Problem</p>
              <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-black tracking-[-0.03em] leading-[1.15]">
                Your community has questions.
                <br />
                <span className="text-[#bbb] dark:text-[#555]">Your team can&apos;t keep up.</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5 mt-16">
            {[
              { num: '500+', title: 'Same questions daily', desc: 'Discord and Telegram flooded with repeated questions. 3-5 community managers can\'t cover 24 hours across timezones.', icon: '01' },
              { num: '15+', title: 'Languages in your community', desc: 'Korean, Japanese, Chinese, French, Turkish communities all asking in their own language. Hiring multilingual staff isn\'t scalable.', icon: '02' },
              { num: '0', title: 'Insights from questions', desc: 'Messages flow through Discord and vanish. No data on what your community actually cares about. No feedback loop.', icon: '03' },
            ].map((item, i) => (
              <Reveal key={item.icon} delay={i * 120}>
                <div className="group p-8 bg-white dark:bg-white/[0.04] rounded-[24px] border border-black/[0.06] dark:border-white/[0.06] hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500 h-full">
                  <div className="text-[11px] font-mono font-bold text-[#ccc] dark:text-[#555] mb-6">{item.icon}</div>
                  <div className="text-[2.5rem] font-black tracking-tight leading-none">{item.num}</div>
                  <div className="text-[15px] font-bold mt-3">{item.title}</div>
                  <p className="text-[14px] text-[#888] leading-[1.7] mt-3">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CHAT DEMO ═══════════════ */}
      <ChatDemoSection chatStep={chatStep} chatRef={chatRef} />

      {/* ═══════════════ PERSONAS ═══════════════ */}
      <section className="py-32 px-6" id="personas">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <p className="text-[13px] font-semibold text-[#7C3AED] uppercase tracking-[0.15em] mb-5">Personas</p>
              <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-black tracking-[-0.03em] leading-[1.15]">
                The founders your community wants to hear from.
              </h2>
              <p className="mt-5 text-[17px] text-[#888] max-w-xl mx-auto leading-[1.7]">
                AI trained on each founder&apos;s interviews, AMAs, Twitter threads, and conference talks.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {projects.map((p, i) => (
              <ProjectCard key={p.symbol} project={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES (BENTO) ═══════════════ */}
      <section className="py-32 px-6 bg-[#F3F1EE] dark:bg-[#111]" id="features">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <p className="text-[13px] font-semibold text-[#7C3AED] uppercase tracking-[0.15em] mb-5">Features</p>
              <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-black tracking-[-0.03em] leading-[1.15]">
                Built for crypto. Built for scale.
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <Reveal key={f.icon} delay={i * 80}>
                <div className="group relative bg-white dark:bg-white/[0.04] rounded-[24px] border border-black/[0.06] dark:border-white/[0.06] p-8 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500 hover:-translate-y-1 h-full">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#f7f5f2] dark:bg-white/[0.06] flex items-center justify-center text-[13px] font-mono font-bold text-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white transition-all duration-300">
                      {f.icon}
                    </div>
                    <h3 className="text-[17px] font-bold tracking-tight">{f.title}</h3>
                  </div>
                  <p className="text-[14px] text-[#888] leading-[1.7]">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ AMA 2.0 ═══════════════ */}
      <section className="py-32 px-6 bg-[#0F0F0F] text-white relative overflow-hidden" id="ama">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-20">
              <p className="text-[13px] font-semibold text-[#F43F5E] uppercase tracking-[0.15em] mb-5">AMA 2.0</p>
              <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-black tracking-[-0.03em] leading-[1.15]">
                The AMA that never ends.
              </h2>
              <p className="mt-5 text-[17px] text-[#666] max-w-2xl mx-auto leading-[1.7]">
                Traditional AMAs: 1 hour, 20 questions, then it&apos;s gone.
                <br />
                Talk With Protocol: AI carries it forward. Permanently.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5">
            {amaPhases.map((phase, i) => (
              <Reveal key={phase.phase} delay={i * 150}>
                <div className="relative group h-full">
                  <div className="absolute -inset-[1px] rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${phase.color}40, transparent)` }} />
                  <div className="relative bg-white/[0.04] backdrop-blur-sm rounded-[24px] border border-white/[0.06] p-8 h-full hover:bg-white/[0.08] transition-all duration-500">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[13px] font-bold" style={{ backgroundColor: `${phase.color}20`, color: phase.color }}>
                        {phase.phase}
                      </div>
                      <div>
                        <div className="text-[15px] font-bold">{phase.label}</div>
                      </div>
                    </div>

                    <p className="text-[14px] text-[#888] leading-[1.8]">{phase.desc}</p>

                    <div className="mt-6 h-[2px] rounded-full bg-white/[0.06]">
                      <div className="h-full rounded-full transition-all duration-1000 group-hover:w-full w-0" style={{ backgroundColor: phase.color }} />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* AMA flow arrow */}
          <Reveal delay={500}>
            <div className="hidden md:flex items-center justify-center mt-12 gap-3">
              {['Pre-Questions', '', 'Live Answers', '', 'AI Forever'].map((label, i) => (
                i % 2 === 0 ? (
                  <span key={i} className="text-[12px] font-medium text-[#555]">{label}</span>
                ) : (
                  <svg key={i} className="w-5 h-5 text-[#555]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                )
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ DASHBOARD ═══════════════ */}
      <DashboardSection />

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="py-32 px-6 bg-[#F3F1EE] dark:bg-[#111]">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-20">
              <p className="text-[13px] font-semibold text-[#7C3AED] uppercase tracking-[0.15em] mb-5">How It Works</p>
              <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-black tracking-[-0.03em] leading-[1.15]">
                Live in 4 steps. Under an hour.
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-4 gap-5">
            {[
              { n: '01', title: 'Upload Docs', desc: 'Whitepaper, documentation, blog posts, AMA transcripts. Drop files or connect URLs.' },
              { n: '02', title: 'AI Learns', desc: 'RAG pipeline chunks, embeds, and indexes everything. Your AI persona is ready in under an hour.' },
              { n: '03', title: 'Go Live', desc: 'Deploy as a chat page, website widget, Discord bot, or Telegram bot. Your choice.' },
              { n: '04', title: 'Get Insights', desc: 'Real-time dashboard shows question trends, sentiment, and unanswered gaps. Weekly reports auto-generated.' },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 120}>
                <div className="group bg-white dark:bg-white/[0.04] rounded-[24px] border border-black/[0.06] dark:border-white/[0.06] p-8 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all duration-500 h-full">
                  <div className="w-12 h-12 rounded-2xl bg-[#7C3AED] flex items-center justify-center text-white text-[14px] font-bold group-hover:scale-110 group-hover:shadow-[0_8px_24px_rgba(124,58,237,0.3)] transition-all duration-500">
                    {step.n}
                  </div>
                  <h3 className="mt-6 text-[17px] font-bold tracking-tight">{step.title}</h3>
                  <p className="mt-3 text-[14px] text-[#888] leading-[1.7]">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ PRICING ═══════════════ */}
      <section className="py-32 px-6" id="pricing">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <p className="text-[13px] font-semibold text-[#7C3AED] uppercase tracking-[0.15em] mb-5">Pricing</p>
              <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-black tracking-[-0.03em] leading-[1.15]">
                Scale with your community.
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5 items-start">
            {[
              { name: 'Starter', price: '$500', period: '/mo', desc: 'AI chatbot for your community', features: ['Unlimited AI conversations', 'Up to 100 documents', 'Multi-language auto-response', 'Basic analytics', 'Source citations'], highlight: false },
              { name: 'Pro', price: '$2,000', period: '/mo', desc: 'Full communication suite', features: ['Everything in Starter', 'AMA 2.0 (4x/month)', 'Intelligence dashboard', 'Token gating (Privy)', 'Weekly auto-reports', 'Widget SDK', 'CEO persona'], highlight: true },
              { name: 'Enterprise', price: 'Custom', period: '', desc: 'For top-tier protocols', features: ['Everything in Pro', 'Dedicated infrastructure', 'Custom AI fine-tuning', 'Full API access', 'On-chain data integration', 'Dedicated support', 'SLA guarantee'], highlight: false },
            ].map((tier, i) => (
              <Reveal key={tier.name} delay={i * 120}>
                <div className={`relative rounded-[28px] border p-9 transition-all duration-500 ${tier.highlight ? 'bg-[#0F0F0F] text-white border-[#333] shadow-[0_40px_100px_rgba(0,0,0,0.2)] scale-[1.03] z-10' : 'bg-white dark:bg-white/[0.04] border-black/[0.06] dark:border-white/[0.06] hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]'}`}>
                  {tier.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <div className="px-4 py-1.5 bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] rounded-full text-[11px] font-bold text-white shadow-[0_4px_12px_rgba(124,58,237,0.4)]">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-[12px] font-bold uppercase tracking-[0.15em]" style={{ color: '#7C3AED' }}>{tier.name}</div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-[2.5rem] font-black tracking-tight">{tier.price}</span>
                    <span className={`text-[14px] ${tier.highlight ? 'text-[#666]' : 'text-[#aaa] dark:text-[#666]'}`}>{tier.period}</span>
                  </div>
                  <p className={`mt-2 text-[14px] ${tier.highlight ? 'text-[#666]' : 'text-[#888]'}`}>{tier.desc}</p>

                  <div className="mt-8 space-y-3">
                    {tier.features.map((f) => (
                      <div key={f} className="flex items-start gap-2.5">
                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        <span className={`text-[14px] ${tier.highlight ? 'text-[#aaa]' : 'text-[#666] dark:text-[#999]'}`}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <button className={`mt-8 w-full py-3.5 rounded-xl text-[14px] font-semibold transition-all duration-300 ${tier.highlight ? 'bg-white text-[#0F0F0F] hover:bg-[#f0f0f0] shadow-[0_4px_12px_rgba(255,255,255,0.1)]' : 'bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] hover:bg-[#333] dark:hover:bg-[#e0e0e0]'}`}>
                    {tier.name === 'Starter' ? 'Get Started' : tier.name === 'Pro' ? 'Contact Us' : 'Talk to Sales'}
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="relative rounded-[32px] overflow-hidden">
              {/* BG */}
              <div className="absolute inset-0 bg-[#0F0F0F]" />
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #7C3AED 0%, transparent 50%), radial-gradient(circle at 80% 50%, #F43F5E 0%, transparent 50%)' }} />
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

              <div className="relative px-8 py-20 md:px-16 text-center">
                <h2 className="text-[clamp(2rem,4vw,3rem)] font-black text-white tracking-[-0.03em] leading-[1.15]">
                  Stop repeating yourself.
                  <br />
                  <span className="bg-gradient-to-r from-[#A855F7] to-[#F43F5E] bg-clip-text text-transparent">Let AI speak for your protocol.</span>
                </h2>
                <p className="mt-6 text-[17px] text-[#666] max-w-lg mx-auto leading-[1.7]">
                  Early Access includes 3 months free. Limited to 50 projects.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button className="group px-8 py-4 bg-white text-[#0F0F0F] font-semibold rounded-2xl hover:shadow-[0_20px_60px_rgba(255,255,255,0.15)] transition-all duration-500 hover:scale-[1.02]">
                    <span className="flex items-center gap-2 text-[15px]">
                      Get Early Access
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </span>
                  </button>
                  <button className="px-8 py-4 text-white/70 font-semibold rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-[15px]">
                    Schedule Demo
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="py-12 px-6 border-t border-black/[0.04] dark:border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-[#1a1a1a] dark:bg-white flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" className="fill-white dark:fill-[#1a1a1a]" opacity="0.9"/><path d="M2 17l10 5 10-5" className="stroke-white dark:stroke-[#1a1a1a]" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12l10 5 10-5" className="stroke-white dark:stroke-[#1a1a1a]" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span className="text-[14px] font-bold tracking-tight">Talk With Protocol</span>
            </div>
            <div className="flex items-center gap-8 text-[13px] text-[#aaa] dark:text-[#666]">
              <a href="#" className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors">Discord</a>
              <a href="#" className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors">Docs</a>
              <a href="#" className="hover:text-[#1a1a1a] dark:hover:text-white transition-colors">Blog</a>
            </div>
            <div className="text-[13px] text-[#bbb] dark:text-[#555]">&copy; 2026 Talk With Protocol</div>
          </div>
        </div>
      </footer>

      {/* ═══════════════ GLOBAL STYLES ═══════════════ */}
      <style jsx global>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes float-orb {
          0%, 100% { transform: translateY(0) scale(1); }
          33% { transform: translateY(-20px) scale(1.05); }
          66% { transform: translateY(-10px) scale(0.97); }
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar - light */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #bbb;
        }

        /* Custom scrollbar - dark */
        .dark ::-webkit-scrollbar-thumb {
          background: #333;
        }
        .dark ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  )
}
