import { useRef } from 'react'
import type { Chord } from '../types'

interface Props {
  upcoming: Chord[]
  currentIndex: number
  progress: number
}

const FUNCTION_STYLES: Record<string, { bg: string; border: string; text: string; sub: string }> = {
  tonic:       { bg: 'bg-[#0d1e2e]',  border: 'border-[#00d4a1]', text: 'text-[#00d4a1]', sub: 'text-[#007a5e]' },
  subdominant: { bg: 'bg-[#15102a]',  border: 'border-[#8b5cf6]', text: 'text-[#8b5cf6]', sub: 'text-[#5b3cb6]' },
  dominant:    { bg: 'bg-[#1e1200]',  border: 'border-[#ff6b35]', text: 'text-[#ff6b35]', sub: 'text-[#994020]' },
}

export function ChordTimeline({ upcoming, currentIndex, progress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  if (upcoming.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 bg-jp-surface rounded-xl border border-jp-border text-jp-dim text-sm">
        Presiona PLAY para ver la línea de tiempo
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-jp-surface rounded-xl border border-jp-border h-28">
      {/* Center marker */}
      <div className="absolute inset-y-0 left-1/2 w-px bg-jp-mint/30 z-10" />
      <div className="absolute inset-y-0 left-1/2 w-16 -translate-x-8 bg-jp-mint/5 z-0" />

      <div
        ref={containerRef}
        className="flex items-center h-full px-4 gap-3 transition-transform duration-100 ease-linear"
        style={{ transform: `translateX(calc(50% - ${progress * 120}px - ${currentIndex * 136}px))` }}
      >
        {upcoming.map((chord, i) => {
          const isCurrent = i === currentIndex
          const isPast = i < currentIndex
          const s = FUNCTION_STYLES[chord.function] ?? FUNCTION_STYLES.tonic

          return (
            <div
              key={i}
              className={`
                flex-shrink-0 w-28 h-20 rounded-lg border flex flex-col items-center justify-center gap-1
                transition-all duration-200
                ${s.bg} ${s.border}
                ${isCurrent ? 'scale-110 ring-1 ring-white/10' : ''}
                ${isPast ? 'opacity-25' : ''}
              `}
              style={isCurrent ? { boxShadow: `0 0 16px 2px ${chord.function === 'tonic' ? 'rgba(0,212,161,0.3)' : chord.function === 'dominant' ? 'rgba(255,107,53,0.3)' : 'rgba(139,92,246,0.3)'}` } : {}}
            >
              <span className={`text-lg font-bold ${s.text}`}>{chord.name}</span>
              <span className={`text-xs ${s.sub}`}>{chord.degree}</span>
              {isCurrent && (
                <div className="w-full px-3">
                  <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${s.text.replace('text-', 'bg-')}`}
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="absolute left-0 inset-y-0 w-16 bg-gradient-to-r from-jp-surface to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-16 bg-gradient-to-l from-jp-surface to-transparent z-20 pointer-events-none" />
    </div>
  )
}
