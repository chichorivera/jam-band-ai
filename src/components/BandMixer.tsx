import { InstrumentTrack } from './InstrumentTrack'

interface TrackState {
  isActive: boolean
  volume: number
  mode: string
  vu: number
  currentNote?: string
}

interface Props {
  drums: TrackState
  bass: TrackState
  guitar: TrackState
  keys: TrackState
  onDrums: (patch: Partial<TrackState>) => void
  onBass: (patch: Partial<TrackState>) => void
  onGuitar: (patch: Partial<TrackState>) => void
  onKeys: (patch: Partial<TrackState>) => void
}

export function BandMixer({ drums, bass, guitar, keys, onDrums, onBass, onGuitar, onKeys }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <InstrumentTrack
        name="Batería" icon="🥁"
        {...drums}
        modes={['rock_basic', 'blues_shuffle', 'jazz_ride', 'funk_16th', 'clave_32', 'lofi_boom_bap']}
        onToggle={() => onDrums({ isActive: !drums.isActive })}
        onVolumeChange={v => onDrums({ volume: v })}
        onModeChange={m => onDrums({ mode: m })}
      />
      <InstrumentTrack
        name="Bajo" icon="🎸"
        {...bass}
        modes={['root', 'groove', 'walking', 'busy']}
        onToggle={() => onBass({ isActive: !bass.isActive })}
        onVolumeChange={v => onBass({ volume: v })}
        onModeChange={m => onBass({ mode: m })}
      />
      <InstrumentTrack
        name="Guitarra" icon="🎵"
        {...guitar}
        modes={['rhythm', 'lead']}
        onToggle={() => onGuitar({ isActive: !guitar.isActive })}
        onVolumeChange={v => onGuitar({ volume: v })}
        onModeChange={m => onGuitar({ mode: m })}
      />
      <InstrumentTrack
        name="Teclados" icon="🎹"
        {...keys}
        modes={['piano', 'rhodes', 'synth_pad']}
        onToggle={() => onKeys({ isActive: !keys.isActive })}
        onVolumeChange={v => onKeys({ volume: v })}
        onModeChange={m => onKeys({ mode: m })}
      />
    </div>
  )
}
