import { useEffect, useRef } from 'react'
import type { AIDecision } from '../types'

interface LogEntry {
  id: number
  decision: AIDecision
  time: string
}

interface Props {
  log: LogEntry[]
  autonomy: number
  reactivity: number
  onAutonomyChange: (v: number) => void
  onReactivityChange: (v: number) => void
}

function decisionIcon(d: AIDecision): string {
  switch (d.type) {
    case 'intensity_up':   return '📈'
    case 'intensity_down': return '📉'
    case 'tempo_up':       return '⏩'
    case 'tempo_down':     return '⏪'
    case 'trigger_fill':   return '🥁'
    case 'solo':           return '🎸'
    case 'buildup':        return '🔥'
    case 'breakdown':      return '🌊'
    case 'change_section': return '🔄'
    case 'change_pattern': return '🎵'
    default:               return '🤖'
  }
}

export function AIStatusLog({ log, autonomy, reactivity, onAutonomyChange, onReactivityChange }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [log.length])

  return (
    <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-base">🤖</span>
        <span className="text-sm font-semibold text-zinc-300">Director IA</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 w-20 shrink-0">Autonomía</span>
          <input
            type="range" min={0} max={100} value={autonomy}
            onChange={e => onAutonomyChange(Number(e.target.value))}
            className="flex-1 accent-violet-500"
          />
          <span className="text-xs text-zinc-400 w-8 text-right">{autonomy}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 w-20 shrink-0">Reactividad</span>
          <input
            type="range" min={0} max={100} value={reactivity}
            onChange={e => onReactivityChange(Number(e.target.value))}
            className="flex-1 accent-violet-500"
          />
          <span className="text-xs text-zinc-400 w-8 text-right">{reactivity}%</span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex flex-col gap-1 max-h-32 overflow-y-auto scrollbar-hide"
      >
        {log.length === 0 ? (
          <p className="text-xs text-zinc-600 italic">La IA hablará cuando empiece a tocar...</p>
        ) : (
          log.slice(-20).map(entry => (
            <div key={entry.id} className="flex items-start gap-2 text-xs">
              <span className="shrink-0 text-zinc-500">{entry.time}</span>
              <span>{decisionIcon(entry.decision)}</span>
              <span className="text-zinc-300">{entry.decision.reason}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
