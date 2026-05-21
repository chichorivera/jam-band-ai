import { useEffect, useRef } from 'react'

interface Props {
  name: string
  icon: string
  isActive: boolean
  volume: number
  mode: string
  modes: string[]
  currentNote?: string
  vu: number
  onToggle: () => void
  onVolumeChange: (v: number) => void
  onModeChange: (mode: string) => void
}

export function InstrumentTrack({
  name, icon, isActive, volume, mode, modes, currentNote, vu,
  onToggle, onVolumeChange, onModeChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const barCount = 12
    const barW = Math.floor(canvas.width / barCount) - 1
    const threshold = vu * barCount

    for (let i = 0; i < barCount; i++) {
      const x = i * (barW + 1)
      const active = i < threshold
      if (active) {
        const ratio = i / barCount
        ctx.fillStyle = ratio < 0.6
          ? `hsl(${120 - ratio * 60}, 80%, 50%)`
          : ratio < 0.85
            ? `hsl(45, 90%, 55%)`
            : `hsl(0, 90%, 55%)`
      } else {
        ctx.fillStyle = '#27272a'
      }
      ctx.fillRect(x, 0, barW, canvas.height)
    }
  }, [vu])

  return (
    <div
      className={`
        flex flex-col gap-2 p-3 rounded-xl border transition-all cursor-pointer select-none
        ${isActive
          ? 'bg-zinc-800/80 border-zinc-600 shadow-lg'
          : 'bg-zinc-900/50 border-zinc-800 opacity-60'}
      `}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-bold text-white">{name}</span>
        </div>
        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-zinc-600'}`} />
      </div>

      <canvas ref={canvasRef} width={120} height={12} className="w-full rounded" />

      {currentNote && (
        <div className="text-center text-xs font-mono text-violet-300 bg-zinc-900 rounded px-1">
          {currentNote}
        </div>
      )}

      <div onClick={e => e.stopPropagation()} className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 w-6">Vol</span>
          <input
            type="range" min={0} max={100} value={Math.round(volume * 100)}
            onChange={e => onVolumeChange(Number(e.target.value) / 100)}
            className="flex-1 accent-violet-500 h-1.5"
          />
          <span className="text-xs text-zinc-400 w-8 text-right">{Math.round(volume * 100)}%</span>
        </div>

        <select
          value={mode}
          onChange={e => onModeChange(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded px-2 py-1"
        >
          {modes.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
    </div>
  )
}
