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

function SliderRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-jp-dim w-20 shrink-0">{label}</span>
      <input
        type="range" min={0} max={100} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 accent-[#00d4a1]"
      />
      <span className="text-xs text-jp-dim w-8 text-right">{value}%</span>
    </div>
  )
}

export function AIStatusLog({ log, autonomy, reactivity, onAutonomyChange, onReactivityChange }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [log.length])

  return (
    <div className="p-3 bg-jp-surface rounded-xl border border-jp-border flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-base">🤖</span>
        <span className="text-sm font-semibold text-white">Director IA</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <SliderRow label="Autonomía"   value={autonomy}   onChange={onAutonomyChange} />
        <SliderRow label="Reactividad" value={reactivity} onChange={onReactivityChange} />
      </div>

      <div ref={scrollRef} className="flex flex-col gap-1 max-h-32 overflow-y-auto scrollbar-hide">
        {log.length === 0 ? (
          <p className="text-xs text-jp-dim italic">La IA hablará cuando empiece a tocar...</p>
        ) : (
          log.slice(-20).map(entry => (
            <div key={entry.id} className="flex items-start gap-2 text-xs">
              <span className="shrink-0 text-jp-dim font-mono">{entry.time}</span>
              <span>{decisionIcon(entry.decision)}</span>
              <span className="text-jp-text">{entry.decision.reason}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
