'use client'

import { Reveal } from './reveal'
import { projects, uniswapChat, arbitrumChat, type ChatMessage, type Project } from '@/app/protocol/data'

function ChatBubble({ msg, index, visible, project }: { msg: ChatMessage; index: number; visible: boolean; project: Project }) {
  return (
    <div
      className="transition-all duration-700"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        opacity: visible ? 1 : 0,
        transitionDelay: `${index * 150}ms`,
      }}
    >
      {msg.role === 'user' ? (
        <div className="flex justify-end mb-3">
          <div className="max-w-[80%] px-4 py-3 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] rounded-[16px] rounded-br-[4px] text-[13px] leading-[1.6]">
            {msg.text}
          </div>
        </div>
      ) : (
        <div className="flex gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-1">
            {project.photo ? (
              <img src={project.photo} alt={project.ceo} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: project.color }}>{project.avatar}</div>
            )}
          </div>
          <div className="max-w-[85%]">
            <div className="px-4 py-3 bg-[#f7f5f2] dark:bg-white/[0.06] rounded-[16px] rounded-bl-[4px] text-[13px] leading-[1.6] text-[#333] dark:text-[#ccc]">
              {msg.text}
            </div>
            {msg.source && (
              <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-[#aaa] dark:text-[#777] bg-white dark:bg-white/[0.04] px-2.5 py-1 rounded-full border border-black/[0.04] dark:border-white/[0.06]">
                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                {msg.source}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ChatWindow({ project, messages, chatStep }: { project: Project; messages: ChatMessage[]; chatStep: number }) {
  return (
    <div className="bg-white dark:bg-[#141414] rounded-[24px] border border-black/[0.06] dark:border-white/[0.06] shadow-[0_30px_80px_rgba(0,0,0,0.06)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.4)] overflow-hidden">
      <div className="px-5 py-4 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
          <img src={project.photo!} alt={project.ceo} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold tracking-tight">{project.ceo}</div>
          <div className="text-[11px] text-[#aaa] dark:text-[#666]">{project.title}, {project.name}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white dark:bg-[#1a1a1a] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src={project.logo} alt={project.symbol} className="w-5 h-5 object-contain" />
          </div>
          <div className="flex items-center gap-1">
            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute h-full w-full rounded-full bg-[#10B981] opacity-75" /><span className="relative rounded-full h-1.5 w-1.5 bg-[#10B981]" /></span>
          </div>
        </div>
      </div>
      <div className="p-5 min-h-[340px]">
        {messages.map((msg, i) => (
          <ChatBubble key={i} msg={msg} index={i} visible={i <= chatStep} project={project} />
        ))}
        {chatStep >= 0 && chatStep < messages.length - 1 && (
          <div className="flex gap-2.5 mt-3">
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0"><img src={project.photo!} alt={project.ceo} className="w-full h-full object-cover" /></div>
            <div className="px-4 py-3 bg-[#f7f5f2] dark:bg-white/[0.06] rounded-[16px] rounded-bl-[4px] inline-flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-[#bbb] dark:bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-[#bbb] dark:bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-[#bbb] dark:bg-[#666] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
      <div className="px-5 pb-5">
        <div className="flex items-center gap-2 px-4 py-3 bg-[#f7f5f2] dark:bg-white/[0.04] rounded-xl border border-black/[0.04] dark:border-white/[0.06]">
          <span className="text-[13px] text-[#bbb] dark:text-[#555] flex-1">Ask about {project.name}...</span>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: project.color }}>
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ChatDemoSection({ chatStep, chatRef }: { chatStep: number; chatRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <section className="py-32 px-6 bg-gradient-to-b from-[#FAF9F7] to-[#F3F1EE] dark:from-[#0a0a0a] dark:to-[#111]" ref={chatRef}>
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <p className="text-[13px] font-semibold text-[#7C3AED] uppercase tracking-[0.15em] mb-5">Live Demo</p>
            <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-black tracking-[-0.03em] leading-[1.15]">
              Every answer. Every source. Every language.
            </h2>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6">
          <Reveal delay={100}>
            <ChatWindow project={projects[1]} messages={uniswapChat} chatStep={chatStep} />
          </Reveal>
          <Reveal delay={300}>
            <ChatWindow project={projects[3]} messages={arbitrumChat} chatStep={chatStep} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
