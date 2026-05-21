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
              ? 'bg-jp-mint/15 border-jp-mint text-jp-mint glow-mint'
              : 'bg-jp-card border-jp-border text-jp-dim hover:border-jp-mint/50 hover:text-jp-text'
          }`}
        >
          {cfg.icon} {cfg.name}
        </button>
      ))}
    </div>
  )
}
