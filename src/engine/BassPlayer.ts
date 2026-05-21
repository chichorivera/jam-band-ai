import * as Tone from 'tone'
import { InstrumentPlayer } from './InstrumentPlayer'
import { audioEngine } from './AudioEngine'
import { ScaleEngine } from './ScaleEngine'
import type { Chord, BassMode } from '../types'
import { CHROMATIC_NOTES } from '../data/scales'

const GROOVE_PATTERNS: number[][] = [
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
  [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
]

export class BassPlayer extends InstrumentPlayer {
  private synth!: Tone.Synth
  private volumeNode!: Tone.Volume
  private scaleEngine: ScaleEngine
  private mode: BassMode = 'groove'
  private step = 0
  private groovePattern: number[] = GROOVE_PATTERNS[0]

  constructor(scaleEngine: ScaleEngine) {
    super()
    this.scaleEngine = scaleEngine
  }

  init() {
    this.loop?.stop()
    this.synth?.dispose()
    this.volumeNode?.dispose()
    this.volumeNode = new Tone.Volume(-3).connect(audioEngine.getBassOutput())

    this.synth = new Tone.Synth({
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.2 },
    }).connect(this.volumeNode)

    this.loop = new Tone.Sequence(
      (time) => {
        if (!this.isActive || !this.currentChord) return
        this.playStep(time, this.step)
        this.step = (this.step + 1) % 16
      },
      Array.from({ length: 16 }, (_, i) => i),
      '16n'
    )
  }

  private playStep(time: number, step: number) {
    const chord = this.currentChord!
    const vel = 0.5 + (this.intensity / 100) * 0.5

    if (this.mode === 'root') {
      if (step === 0 || step === 8) {
        this.synth.triggerAttackRelease(`${chord.root}2`, '8n', time, vel)
      }
    } else if (this.mode === 'groove') {
      if (this.groovePattern[step]) {
        const note = this.getGrooveNote(chord, step)
        this.synth.triggerAttackRelease(note, '16n', time, vel)
      }
    } else if (this.mode === 'walking') {
      if (step % 4 === 0) {
        const walkNote = this.getWalkingNote(chord, step / 4)
        this.synth.triggerAttackRelease(walkNote, '4n', time, vel)
      }
    } else if (this.mode === 'busy') {
      if (step % 2 === 0) {
        const note = this.scaleEngine.getRandomScaleNote(chord, [2, 3])
        this.synth.triggerAttackRelease(note, '8n', time, vel)
      }
    }
  }

  private getGrooveNote(chord: Chord, step: number): string {
    const root = `${chord.root}2`
    if (step < 4) return root
    const ri = CHROMATIC_NOTES.indexOf(chord.root)
    const fifth = CHROMATIC_NOTES[(ri + 7) % 12]
    if (step < 8) return `${fifth}2`
    if (step < 12) return root
    const oct = `${chord.root}3`
    return Math.random() < 0.5 ? oct : root
  }

  private getWalkingNote(chord: Chord, beat: number): string {
    const tones = this.scaleEngine.getChordTones(chord, 2)
    if (beat === 3) {
      const ri = CHROMATIC_NOTES.indexOf(chord.root)
      const approach = CHROMATIC_NOTES[(ri + 11) % 12]
      return `${approach}2`
    }
    return tones[beat % tones.length] ?? `${chord.root}2`
  }

  setMode(mode: BassMode) {
    this.mode = mode
    this.groovePattern = GROOVE_PATTERNS[Math.floor(Math.random() * GROOVE_PATTERNS.length)]
    this.step = 0
  }

  generatePattern(_chord: Chord, intensity: number) {
    this.intensity = intensity
    if (intensity > 75) this.mode = 'busy'
    else if (intensity > 50) this.mode = 'groove'
    else if (intensity > 25) this.mode = 'walking'
    else this.mode = 'root'
  }

  protected applyVolume(value: number) {
    this.volumeNode.volume.value = Tone.gainToDb(value)
  }

  dispose() {
    this.loop?.dispose()
    this.synth?.dispose()
    this.volumeNode.dispose()
  }
}
