import type { Key } from '../types'

const KEYS: Key[] = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

interface Props {
  bpm: number
  currentKey: Key
  isPlaying: boolean
  onBpmChange: (bpm: number) => void
  onKeyChange: (key: Key) => void
  onPlay: () => void
  onStop: () => void
  onFill: () => void
  onBuildup: () => void
  onBreakdown: () => void
}

export function MasterControls({
  bpm, currentKey, isPlaying,
  onBpmChange, onKeyChange, onPlay, onStop, onFill, onBuildup, onBreakdown,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800">
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-400 uppercase tracking-wider">BPM</span>
        <button
          onClick={() => onBpmChange(Math.max(40, bpm - 1))}
          className="w-6 h-6 flex items-center justify-center rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-sm"
        >−</button>
        <span className="w-10 text-center text-white font-mono font-bold">{bpm}</span>
        <button
          onClick={() => onBpmChange(Math.min(220, bpm + 1))}
          className="w-6 h-6 flex items-center justify-center rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-sm"
        >+</button>
        <input
          type="range" min={40} max={220} value={bpm}
          onChange={e => onBpmChange(Number(e.target.value))}
          className="w-24 accent-violet-500"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-400 uppercase tracking-wider">Tono</span>
        <select
          value={currentKey}
          onChange={e => onKeyChange(e.target.value as Key)}
          className="bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1 text-sm"
        >
          {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {!isPlaying ? (
          <button
            onClick={onPlay}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm transition-colors"
          >▶ PLAY</button>
        ) : (
          <button
            onClick={onStop}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-lg font-bold text-sm transition-colors"
          >■ STOP</button>
        )}
        <button
          onClick={onFill}
          disabled={!isPlaying}
          className="px-3 py-2 bg-amber-700 hover:bg-amber-600 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-colors"
        >FILL</button>
        <button
          onClick={onBuildup}
          disabled={!isPlaying}
          className="px-3 py-2 bg-orange-700 hover:bg-orange-600 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-colors"
        >BUILD UP</button>
        <button
          onClick={onBreakdown}
          disabled={!isPlaying}
          className="px-3 py-2 bg-blue-800 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-colors"
        >BREAK</button>
      </div>
    </div>
  )
}
