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
    <div className="flex flex-wrap items-center gap-3 p-3 bg-jp-surface rounded-xl border border-jp-border">
      <div className="flex items-center gap-2">
        <span className="text-xs text-jp-dim uppercase tracking-wider">BPM</span>
        <button
          onClick={() => onBpmChange(Math.max(40, bpm - 1))}
          className="w-6 h-6 flex items-center justify-center rounded bg-jp-card border border-jp-border text-jp-text hover:border-jp-mint/60 text-sm"
        >−</button>
        <span className="w-10 text-center text-jp-mint font-mono font-bold">{bpm}</span>
        <button
          onClick={() => onBpmChange(Math.min(220, bpm + 1))}
          className="w-6 h-6 flex items-center justify-center rounded bg-jp-card border border-jp-border text-jp-text hover:border-jp-mint/60 text-sm"
        >+</button>
        <input
          type="range" min={40} max={220} value={bpm}
          onChange={e => onBpmChange(Number(e.target.value))}
          className="w-24 accent-[#00d4a1]"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-jp-dim uppercase tracking-wider">Tono</span>
        <select
          value={currentKey}
          onChange={e => onKeyChange(e.target.value as Key)}
          className="bg-jp-card border border-jp-border text-jp-text rounded px-2 py-1 text-sm"
        >
          {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-2 ml-auto flex-wrap">
        {!isPlaying ? (
          <button
            onClick={onPlay}
            className="px-4 py-2 bg-jp-mint/20 border border-jp-mint text-jp-mint rounded-lg font-bold text-sm transition-all hover:bg-jp-mint/30 glow-mint"
          >▶ PLAY</button>
        ) : (
          <button
            onClick={onStop}
            className="px-4 py-2 bg-red-900/40 border border-red-500 text-red-300 rounded-lg font-bold text-sm transition-all hover:bg-red-900/60"
          >■ STOP</button>
        )}
        <button onClick={onFill} disabled={!isPlaying}
          className="px-3 py-2 bg-jp-orange/10 border border-jp-orange/60 disabled:opacity-30 text-jp-orange rounded-lg text-xs font-bold transition-colors hover:bg-jp-orange/20">
          FILL
        </button>
        <button onClick={onBuildup} disabled={!isPlaying}
          className="px-3 py-2 bg-jp-violet/10 border border-jp-violet/60 disabled:opacity-30 text-jp-violet rounded-lg text-xs font-bold transition-colors hover:bg-jp-violet/20">
          BUILD UP
        </button>
        <button onClick={onBreakdown} disabled={!isPlaying}
          className="px-3 py-2 bg-jp-pink/10 border border-jp-pink/60 disabled:opacity-30 text-jp-pink rounded-lg text-xs font-bold transition-colors hover:bg-jp-pink/20">
          BREAK
        </button>
      </div>
    </div>
  )
}
