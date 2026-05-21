import { useRef } from 'react'
import type { Chord } from '../types'

interface Props {
  upcoming: Chord[]
  currentIndex: number
  progress: number
}

const FUNCTION_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  tonic:       { bg: 'bg-violet-900/60',  border: 'border-violet-500',  text: 'text-violet-200' },
  subdominant: { bg: 'bg-emerald-900/60', border: 'border-emerald-500', text: 'text-emerald-200' },
  dominant:    { bg: 'bg-amber-900/60',   border: 'border-amber-500',   text: 'text-amber-200' },
}

export function ChordTimeline({ upcoming, currentIndex, progress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  if (upcoming.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 bg-zinc-900/50 rounded-xl border border-zinc-800 text-zinc-500 text-sm">
        Presiona PLAY para ver la línea de tiempo
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden bg-zinc-950 rounded-xl border border-zinc-800 h-28">
      <div className="absolute inset-y-0 left-1/2 w-px bg-white/20 z-10" />
      <div className="absolute inset-y-0 left-1/2 w-16 -translate-x-8 bg-white/5 z-0" />

      <div
        ref={containerRef}
        className="flex items-center h-full px-4 gap-3 transition-transform duration-100 ease-linear"
        style={{ transform: `translateX(calc(50% - ${progress * 120}px - ${currentIndex * 136}px))` }}
      >
        {upcoming.map((chord, i) => {
          const isCurrent = i === currentIndex
          const isPast = i < currentIndex
          const colors = FUNCTION_COLORS[chord.function] ?? FUNCTION_COLORS.tonic

          return (
            <div
              key={i}
              className={`
                flex-shrink-0 w-28 h-20 rounded-lg border flex flex-col items-center justify-center gap-1
                transition-all duration-200
                ${colors.bg} ${colors.border}
                ${isCurrent ? 'scale-110 shadow-lg ring-2 ring-white/30' : ''}
                ${isPast ? 'opacity-30' : ''}
              `}
            >
              <span className={`text-lg font-bold ${colors.text}`}>{chord.name}</span>
              <span className="text-xs text-zinc-400">{chord.degree}</span>
              {isCurrent && (
                <div className="w-full px-3">
                  <div className="h-1 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white/60 rounded-full transition-all"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="absolute left-0 inset-y-0 w-16 bg-gradient-to-r from-zinc-950 to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-16 bg-gradient-to-l from-zinc-950 to-transparent z-20 pointer-events-none" />
    </div>
  )
}
