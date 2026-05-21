import * as Tone from 'tone'
import { InstrumentPlayer } from './InstrumentPlayer'
import { audioEngine } from './AudioEngine'
import { ScaleEngine } from './ScaleEngine'
import type { Chord, GuitarMode } from '../types'

export class GuitarPlayer extends InstrumentPlayer {
  private poly!: Tone.PolySynth
  private volumeNode!: Tone.Volume
  private scaleEngine: ScaleEngine
  private mode: GuitarMode = 'rhythm'
  private step = 0

  constructor(scaleEngine: ScaleEngine) {
    super()
    this.scaleEngine = scaleEngine
  }

  init() {
    this.loop?.stop()
    this.poly?.dispose()
    this.volumeNode?.dispose()
    this.volumeNode = new Tone.Volume(-6).connect(audioEngine.getGuitarOutput())

    this.poly = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.5 },
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
    const vel = 0.4 + (this.intensity / 100) * 0.4

    if (this.mode === 'rhythm') {
      this.playRhythm(chord, step, time, vel)
    } else {
      this.playLead(chord, step, time, vel)
    }
  }

  private playRhythm(chord: Chord, step: number, time: number, vel: number) {
    const strumBeats = [0, 4, 8, 12]
    if (!strumBeats.includes(step)) return

    const notes = this.scaleEngine.getChordTones(chord, 3)
    for (let i = 0; i < notes.length; i++) {
      const offset = i * 0.02
      Tone.getDraw().schedule(() => {}, time + offset)
      this.poly.triggerAttackRelease(notes[i], '8n', time + offset, vel)
    }
  }

  private playLead(chord: Chord, step: number, time: number, vel: number) {
    if (step % 2 !== 0) return
    if (Math.random() < 0.3) return

    const note = this.scaleEngine.getRandomScaleNote(chord, [4, 5])
    this.poly.triggerAttackRelease(note, '16n', time, vel * 0.7)
  }

  setMode(mode: GuitarMode) {
    this.mode = mode
    this.step = 0
  }

  generatePattern(_chord: Chord, intensity: number) {
    this.intensity = intensity
    this.mode = intensity > 60 ? 'lead' : 'rhythm'
  }

  protected applyVolume(value: number) {
    this.volumeNode.volume.value = Tone.gainToDb(value)
  }

  dispose() {
    this.loop?.dispose()
    this.poly?.dispose()
    this.volumeNode.dispose()
  }
}
