import type { MicData } from '../types'

interface Props {
  micActive: boolean
  data: MicData
  onToggle: () => void
}

function EnergyBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500 w-8 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-100 ${color}`}
          style={{ width: `${Math.round(value * 100)}%` }}
        />
      </div>
      <span className="text-xs text-zinc-500 w-8 text-right">{Math.round(value * 100)}%</span>
    </div>
  )
}

export function MicMonitor({ micActive, data, onToggle }: Props) {
  return (
    <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🎤</span>
          <span className="text-sm font-semibold text-zinc-300">Micrófono</span>
          {micActive && (
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className={`px-3 py-1 text-xs rounded-full font-semibold transition-colors ${
            micActive
              ? 'bg-red-800 border border-red-600 text-red-200 hover:bg-red-700'
              : 'bg-zinc-800 border border-zinc-600 text-zinc-300 hover:border-violet-500'
          }`}
        >
          {micActive ? 'Desactivar' : 'Activar'}
        </button>
      </div>

      <EnergyBar label="LOW"  value={data.lowEnergy}  color="bg-emerald-500" />
      <EnergyBar label="MID"  value={data.midEnergy}  color="bg-yellow-500" />
      <EnergyBar label="HIGH" value={data.highEnergy} color="bg-violet-500" />
      <EnergyBar label="RMS"  value={data.rms}        color="bg-red-400" />
    </div>
  )
}
