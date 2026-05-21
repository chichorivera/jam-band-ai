import * as Tone from 'tone'
import { InstrumentPlayer } from './InstrumentPlayer'
import { audioEngine } from './AudioEngine'
import type { Chord, DrumPattern } from '../types'

type Piece = 'kick' | 'snare' | 'hihat_c' | 'hihat_o' | 'crash' | 'ride' | 'tom_hi' | 'tom_floor'

const PATTERNS: Record<DrumPattern, Partial<Record<Piece, number[]>>> = {
  rock_basic: {
    kick:    [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    snare:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hihat_c: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
  },
  blues_shuffle: {
    kick:    [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,0],
    snare:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hihat_c: [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0],
    ride:    [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
  },
  jazz_ride: {
    kick:    [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],
    snare:   [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0],
    ride:    [1,0,0,1, 0,1,0,0, 1,0,0,1, 0,1,0,0],
    hihat_c: [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
  },
  funk_16th: {
    kick:    [1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0],
    snare:   [0,0,0,0, 1,0,0,0, 0,0,1,0, 1,0,0,0],
    hihat_c: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
    hihat_o: [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
  },
  clave_32: {
    kick:    [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,0],
    snare:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hihat_c: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    ride:    [1,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,0,0],
  },
  lofi_boom_bap: {
    kick:    [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    snare:   [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hihat_c: [1,0,1,0, 1,0,0,0, 1,0,1,0, 1,0,1,0],
  },
}

const FILL_PATTERNS: Partial<Record<Piece, number[]>> = {
  kick:      [1,0,0,1, 0,0,1,0, 1,0,0,0, 1,0,1,0],
  snare:     [0,0,1,0, 1,0,1,0, 1,1,0,1, 1,1,1,1],
  tom_hi:    [0,0,0,0, 0,0,0,0, 1,0,1,0, 0,0,0,0],
  tom_floor: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
  crash:     [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,1],
}

export class DrumPlayer extends InstrumentPlayer {
  private synths: Partial<Record<Piece, Tone.MembraneSynth | Tone.MetalSynth | Tone.NoiseSynth>> = {}
  private step = 0
  private pattern: DrumPattern = 'rock_basic'
  private activePattern: Partial<Record<Piece, number[]>> = {}
  private fillCounter = 0
  private isFilling = false
  private volumeNode!: Tone.Volume

  constructor() {
    super()
  }

  init() {
    this.loop?.stop()
    Object.values(this.synths).forEach(s => s?.dispose())
    this.synths = {}
    this.volumeNode?.dispose()
    this.volumeNode = new Tone.Volume(0).connect(audioEngine.getDrumOutput())

    this.synths.kick = new Tone.MembraneSynth({
      pitchDecay: 0.05, octaves: 6,
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
    }).connect(this.volumeNode)

    this.synths.snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 },
    }).connect(this.volumeNode)

    const hihatC = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
      harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5,
    }).connect(this.volumeNode)
    hihatC.frequency.value = 400
    this.synths.hihat_c = hihatC

    const hihatO = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.3, release: 0.1 },
      harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5,
    }).connect(this.volumeNode)
    hihatO.frequency.value = 400
    this.synths.hihat_o = hihatO

    const crash = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 1.5, release: 0.5 },
      harmonicity: 5.1, modulationIndex: 32, resonance: 3500, octaves: 1.5,
    }).connect(this.volumeNode)
    crash.frequency.value = 300
    this.synths.crash = crash

    const ride = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.25, release: 0.1 },
      harmonicity: 5.1, modulationIndex: 32, resonance: 5000, octaves: 1.5,
    }).connect(this.volumeNode)
    ride.frequency.value = 600
    this.synths.ride = ride

    this.synths.tom_hi = new Tone.MembraneSynth({
      pitchDecay: 0.02, octaves: 4,
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.05 },
    }).connect(this.volumeNode)

    this.synths.tom_floor = new Tone.MembraneSynth({
      pitchDecay: 0.04, octaves: 5,
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
    }).connect(this.volumeNode)

    this.activePattern = PATTERNS[this.pattern]

    this.loop = new Tone.Sequence(
      (time) => {
        if (!this.isActive) return
        this.playStep(time, this.step)
        this.step = (this.step + 1) % 16
        if (this.step === 0) {
          this.fillCounter++
          this.isFilling = false
          if (this.fillCounter % 8 === 7) this.isFilling = true
        }
      },
      Array.from({ length: 16 }, (_, i) => i),
      '16n'
    )
  }

  private playStep(time: number, step: number) {
    const pat = this.isFilling ? { ...this.activePattern, ...FILL_PATTERNS } : this.activePattern
    const vel = 0.6 + (this.intensity / 100) * 0.4

    for (const [piece, grid] of Object.entries(pat) as [Piece, number[]][]) {
      if (!grid[step]) continue
      const synth = this.synths[piece]
      if (!synth) continue

      if (synth instanceof Tone.MembraneSynth) {
        const pitches: Partial<Record<Piece, string>> = { kick: 'C1', tom_hi: 'G2', tom_floor: 'D2' }
        synth.triggerAttackRelease(pitches[piece] ?? 'C1', '8n', time, vel)
      } else if (synth instanceof Tone.NoiseSynth) {
        synth.triggerAttackRelease('16n', time, vel)
      } else if (synth instanceof Tone.MetalSynth) {
        synth.triggerAttackRelease('32n', time, vel * 0.5)
      }
    }
  }

  generatePattern(_chord: Chord, intensity: number) {
    this.intensity = intensity
  }

  setDrumPattern(pattern: DrumPattern) {
    this.pattern = pattern
    this.activePattern = PATTERNS[pattern]
    this.step = 0
  }

  triggerFill() {
    this.isFilling = true
  }

  protected applyVolume(value: number) {
    this.volumeNode.volume.value = Tone.gainToDb(value)
  }

  dispose() {
    this.loop?.dispose()
    Object.values(this.synths).forEach(s => s?.dispose())
    this.volumeNode.dispose()
  }
}
