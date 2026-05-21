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
        if (ratio < 0.6)       ctx.fillStyle = '#00d4a1'
        else if (ratio < 0.85) ctx.fillStyle = '#ff6b35'
        else                   ctx.fillStyle = '#e040fb'
      } else {
        ctx.fillStyle = '#1a1a38'
      }
      ctx.fillRect(x, 0, barW, canvas.height)
    }
  }, [vu])

  return (
    <div
      className={`flex flex-col gap-2 p-3 rounded-xl border transition-all cursor-pointer select-none ${
        isActive
          ? 'bg-jp-card border-jp-border2 shadow-lg'
          : 'bg-jp-surface border-jp-border opacity-50'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-bold text-white">{name}</span>
        </div>
        <div className={`w-3 h-3 rounded-full transition-all ${
          isActive ? 'bg-jp-mint shadow-[0_0_6px_2px_rgba(0,212,161,0.6)]' : 'bg-jp-border'
        }`} />
      </div>

      <canvas ref={canvasRef} width={120} height={10} className="w-full rounded" />

      {currentNote && (
        <div className="text-center text-xs font-mono text-jp-mint bg-jp-surface rounded px-1">
          {currentNote}
        </div>
      )}

      <div onClick={e => e.stopPropagation()} className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-jp-dim w-6">Vol</span>
          <input
            type="range" min={0} max={100} value={Math.round(volume * 100)}
            onChange={e => onVolumeChange(Number(e.target.value) / 100)}
            className="flex-1 accent-[#00d4a1] h-1.5"
          />
          <span className="text-xs text-jp-dim w-8 text-right">{Math.round(volume * 100)}%</span>
        </div>

        <select
          value={mode}
          onChange={e => onModeChange(e.target.value)}
          className="bg-jp-surface border border-jp-border text-jp-text text-xs rounded px-2 py-1"
        >
          {modes.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
    </div>
  )
}
