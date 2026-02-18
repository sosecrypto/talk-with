'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useSyncExternalStore } from 'react'

const legends = [
  { id: 'elon-musk', name: 'Elon Musk', color: 'from-blue-400 to-cyan-500' },
  { id: 'steve-jobs', name: 'Steve Jobs', color: 'from-gray-600 to-gray-800' },
  { id: 'vitalik-buterin', name: 'Vitalik Buterin', color: 'from-purple-400 to-indigo-600' },
  { id: 'jensen-huang', name: 'Jensen Huang', color: 'from-green-500 to-emerald-600' },
  { id: 'sam-altman', name: 'Sam Altman', color: 'from-orange-400 to-red-500' },
  { id: 'warren-buffett', name: 'Warren Buffett', color: 'from-amber-500 to-yellow-600' },
  { id: 'donald-trump', name: 'Donald Trump', color: 'from-red-500 to-rose-600' },
  { id: 'lee-jae-yong', name: '이재용', color: 'from-blue-600 to-indigo-700' },
  { id: 'bill-gates', name: 'Bill Gates', color: 'from-blue-500 to-sky-600' },
  { id: 'jeff-bezos', name: 'Jeff Bezos', color: 'from-orange-500 to-amber-600' },
  { id: 'larry-page', name: 'Larry Page', color: 'from-blue-500 to-green-500' },
  { id: 'sergey-brin', name: 'Sergey Brin', color: 'from-red-500 to-yellow-500' },
  { id: 'mark-zuckerberg', name: 'Mark Zuckerberg', color: 'from-blue-500 to-blue-700' },
]

// 배경에 배치될 인물 위치 (80% 내부, 인물별 강약)
// 주요 인물은 크게, 보조 인물은 작게 배치
const positions = [
  // Elon Musk - 주요 (좌상단)
  { top: '5%', left: '5%', size: 420, rotate: -8 },
  // Steve Jobs - 주요 (우상단)
  { top: '3%', left: '72%', size: 400, rotate: 6 },
  // Vitalik - 중간 (우측)
  { top: '25%', left: '78%', size: 280, rotate: -10 },
  // Jensen Huang - 중간 (좌측)
  { top: '30%', left: '8%', size: 300, rotate: 12 },
  // Sam Altman - 작은 (우측 중앙)
  { top: '48%', left: '82%', size: 240, rotate: -5 },
  // Warren Buffett - 주요 (좌하단)
  { top: '55%', left: '3%', size: 380, rotate: 8 },
  // Trump - 중간 (우하단)
  { top: '68%', left: '75%', size: 320, rotate: -12 },
  // 이재용 - 작은 (상단 중앙)
  { top: '8%', left: '38%', size: 220, rotate: 4 },
  // Bill Gates - 중간 (하단 중앙좌)
  { top: '75%', left: '20%', size: 300, rotate: -6 },
  // Jeff Bezos - 중간 (하단 중앙우)
  { top: '72%', left: '55%', size: 280, rotate: 7 },
  // Larry Page - 작은 (중앙 우측)
  { top: '40%', left: '68%', size: 200, rotate: -4 },
  // Sergey Brin - 작은 (중앙 좌측)
  { top: '45%', left: '15%', size: 200, rotate: 5 },
  // Mark Zuckerberg - 작은 (하단)
  { top: '82%', left: '42%', size: 220, rotate: -8 },
]

function FloatingSketch({
  legend,
  position,
  index
}: {
  legend: typeof legends[0]
  position: typeof positions[0]
  index: number
}) {
  const [imageError, setImageError] = useState(false)

  return (
    <div
      className="absolute animate-float-slow"
      style={{
        top: position.top,
        left: position.left,
        width: position.size,
        height: position.size,
        transform: `rotate(${position.rotate}deg)`,
        animationDelay: `${index * 0.8}s`,
        animationDuration: `${12 + index * 1.5}s`,
      }}
    >
      <div className="relative w-full h-full opacity-[0.6] dark:opacity-[0.7] hover:opacity-80 transition-opacity duration-500">
        {!imageError ? (
          <Image
            src={`/sketches/${legend.id}.png`}
            alt={legend.name}
            fill
            className="object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback: 이니셜 표시
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${legend.color} flex items-center justify-center`}>
            <span className="text-white font-bold text-2xl opacity-60">
              {legend.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Floating Sketches Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
          {legends.map((legend, index) => (
            <FloatingSketch
              key={legend.id}
              legend={legend}
              position={positions[index]}
              index={index}
            />
          ))}
        </div>

        {/* Gradient Overlay - 중앙 집중, 가장자리는 인물 강조 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_center,_rgba(255,255,255,0.95)_0%,_rgba(255,255,255,0.5)_50%,_rgba(255,255,255,0)_100%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_center,_rgba(10,10,10,0.95)_0%,_rgba(10,10,10,0.5)_50%,_rgba(10,10,10,0)_100%)] pointer-events-none" />

        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur-sm border border-gray-200/50 dark:border-white/10 mb-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              실시간 AI 대화 시뮬레이션
            </span>
          </div>

          {/* Main Title */}
          <h1
            className={`mb-6 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
              Talk With
            </span>
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient leading-tight pb-4">
              Legends
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6 leading-relaxed transition-all duration-1000 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            일론 머스크, 스티브 잡스, 워렌 버핏...
            <br />
            <span className="font-semibold text-gray-900 dark:text-white">
              세계를 이끄는 리더들과 지금 바로 대화하세요
            </span>
          </p>

          {/* CTA Button - 매력적인 애니메이션 */}
          <div
            className={`flex flex-col items-center gap-6 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <Link
              href="/chat"
              className="group relative"
            >
              {/* Simple glow on hover */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-70 transition-opacity duration-300" />

              {/* Button */}
              <div className="relative px-12 py-6 bg-gray-900 dark:bg-white rounded-2xl group-hover:scale-[1.02] transition-transform duration-300">
                <span className="relative z-10 flex items-center gap-3 text-xl font-bold text-white dark:text-gray-900">
                  💬
                  대화 시작하기
                  <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </div>
            </Link>

            <Link
              href="/login"
              className="text-gray-500 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
            >
              이미 계정이 있으신가요?
              <span className="underline">로그인</span>
            </Link>
          </div>

          {/* Stats */}
          <div
            className={`mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto transition-all duration-1000 delay-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900 dark:text-white">50+</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">인물</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900 dark:text-white">24/7</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">실시간</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-gray-900 dark:text-white">무료</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">체험</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Custom animations */}
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) rotate(var(--rotate, 0deg));
          }
          33% {
            transform: translateY(-25px) rotate(calc(var(--rotate, 0deg) + 3deg));
          }
          66% {
            transform: translateY(-12px) rotate(calc(var(--rotate, 0deg) - 2deg));
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .animate-float-slow {
          animation: float-slow 18s ease-in-out infinite;
        }

        .animate-gradient {
          animation: gradient 6s ease infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
