import { STYLES } from '../data/styles'
import type { MusicStyle } from '../types'

interface Props {
  currentStyle: MusicStyle
  onChange: (style: MusicStyle) => void
}

export function StyleSelector({ currentStyle, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {Object.entries(STYLES).map(([key, cfg]) => (
        <button
          key={key}
          onClick={() => onChange(key as MusicStyle)}
          className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
            currentStyle === key
              ? 'bg-violet-600 border-violet-400 text-white shadow-lg shadow-violet-900/40'
              : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-violet-500 hover:text-white'
          }`}
        >
          {cfg.icon} {cfg.name}
        </button>
      ))}
    </div>
  )
}
