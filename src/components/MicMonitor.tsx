import type { MicData } from '../types'

interface Props {
  micActive: boolean
  data: MicData
  onToggle: () => void
}

function EnergyBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-jp-dim w-8 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-jp-card2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-100 ${color}`}
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
      <span className="text-xs text-jp-dim w-8 text-right">{Math.round(value * 100)}%</span>
    </div>
  )
}

export function MicMonitor({ micActive, data, onToggle }: Props) {
  return (
    <div className="p-3 bg-jp-surface rounded-xl border border-jp-border flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🎤</span>
          <span className="text-sm font-semibold text-white">Micrófono</span>
          {micActive && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-jp-mint opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-jp-mint" />
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className={`px-3 py-1 text-xs rounded-full font-semibold transition-all ${
            micActive
              ? 'bg-red-900/30 border border-red-500/60 text-red-300 hover:bg-red-900/50'
              : 'bg-jp-card border border-jp-border text-jp-text hover:border-jp-mint/50'
          }`}
        >
          {micActive ? 'Desactivar' : 'Activar'}
        </button>
      </div>

      <EnergyBar label="LOW"  value={data.lowEnergy}  color="bg-jp-mint" />
      <EnergyBar label="MID"  value={data.midEnergy}  color="bg-jp-violet" />
      <EnergyBar label="HIGH" value={data.highEnergy} color="bg-jp-orange" />
      <EnergyBar label="RMS"  value={data.rms}        color="bg-jp-pink" />
    </div>
  )
}
