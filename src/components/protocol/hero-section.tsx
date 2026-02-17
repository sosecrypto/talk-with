'use client'

import React from 'react'

export function HeroSection({ mounted, parallax, heroRef }: { mounted: boolean; parallax: (factor: number) => React.CSSProperties; heroRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-32 overflow-hidden">
      {/* Gradient Mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full opacity-[0.07] dark:opacity-[0.15]" style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 70%)', ...parallax(0.02) }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full opacity-[0.05] dark:opacity-[0.12]" style={{ background: 'radial-gradient(circle, #F43F5E 0%, transparent 70%)', ...parallax(-0.015) }} />
        <div className="absolute top-[30%] right-[20%] w-[40vw] h-[40vw] rounded-full opacity-[0.04] dark:opacity-[0.1]" style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)', ...parallax(0.01) }} />
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${20 + i * 12}px`,
              height: `${20 + i * 12}px`,
              top: `${15 + i * 14}%`,
              left: `${8 + i * 16}%`,
              background: `linear-gradient(135deg, ${['#7C3AED', '#F43F5E', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'][i]}30, transparent)`,
              animation: `float-orb ${8 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * -1.5}s`,
              ...parallax(0.03 + i * 0.005),
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Eyebrow */}
        <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/[0.06] backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
            </span>
            <span className="text-[13px] font-medium text-[#666] dark:text-[#aaa] tracking-wide">Web3 AI Communication Layer</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className={`mt-10 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="block text-[clamp(2.8rem,7vw,5.5rem)] font-black tracking-[-0.04em] leading-[1.05] text-[#1a1a1a] dark:text-white">
            Your Protocol Speaks.
          </span>
          <span className="block text-[clamp(2.8rem,7vw,5.5rem)] font-black tracking-[-0.04em] leading-[1.15] pb-2 bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#F43F5E] bg-clip-text text-transparent" style={{ backgroundSize: '200% 200%', animation: 'gradient-shift 4s ease infinite', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            24/7. Every Language.
          </span>
        </h1>

        {/* Subheadline */}
        <p className={`mt-8 text-[clamp(1rem,2vw,1.25rem)] text-[#777] dark:text-[#888] max-w-2xl mx-auto leading-[1.7] font-normal transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          AI trained on your project&apos;s official docs answers every community question
          <br className="hidden sm:block" />
          instantly &mdash; in any language, with source citations, around the clock.
        </p>

        {/* CTA */}
        <div className={`mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <button className="group relative px-8 py-4 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] font-semibold rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_60px_rgba(124,58,237,0.25)] hover:scale-[1.02]">
            <span className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#F43F5E] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative flex items-center gap-2.5 text-[15px]">
              Get Early Access
              <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </span>
          </button>
          <button className="px-8 py-4 text-[#777] dark:text-[#aaa] font-semibold text-[15px] rounded-2xl border border-black/[0.08] dark:border-white/[0.1] hover:bg-white dark:hover:bg-white/[0.06] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-black/[0.12] dark:hover:border-white/[0.15] transition-all duration-500">
            Watch Demo
          </button>
        </div>

        {/* Stats */}
        <div className={`mt-20 grid grid-cols-4 gap-6 sm:gap-10 max-w-2xl mx-auto transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {[
            { val: '24/7', label: 'Always On' },
            { val: '50+', label: 'Languages' },
            { val: '<2s', label: 'Response' },
            { val: '90%', label: 'Cost Cut' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-black tracking-[-0.03em] bg-gradient-to-b from-[#1a1a1a] to-[#1a1a1a]/60 dark:from-white dark:to-white/50 bg-clip-text text-transparent">{s.val}</div>
              <div className="text-[11px] sm:text-[12px] font-semibold text-[#aaa] dark:text-[#666] uppercase tracking-[0.12em] mt-2">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-6 h-10 rounded-full border-2 border-[#ddd] dark:border-[#444] flex items-start justify-center p-1.5">
          <div className="w-1 h-2.5 rounded-full bg-[#bbb] dark:bg-[#666] animate-bounce" />
        </div>
      </div>
    </section>
  )
}
