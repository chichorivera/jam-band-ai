import * as Tone from 'tone'
import { InstrumentPlayer } from './InstrumentPlayer'
import { audioEngine } from './AudioEngine'
import { ScaleEngine } from './ScaleEngine'
import type { Chord, KeysMode } from '../types'

export class KeysPlayer extends InstrumentPlayer {
  private poly!: Tone.PolySynth
  private volumeNode!: Tone.Volume
  private scaleEngine: ScaleEngine
  private mode: KeysMode = 'piano'
  private step = 0

  constructor(scaleEngine: ScaleEngine) {
    super()
    this.scaleEngine = scaleEngine
  }

  init() {
    this.loop?.stop()
    this.poly?.dispose()
    this.volumeNode?.dispose()
    this.volumeNode = new Tone.Volume(-4).connect(audioEngine.getKeysOutput())
    this.buildSynth()

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

  private buildSynth() {
    this.poly?.dispose()
    if (this.mode === 'rhodes') {
      this.poly = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3,
        modulationIndex: 10,
        envelope: { attack: 0.01, decay: 0.5, sustain: 0.3, release: 0.8 },
        modulation: { type: 'sine' },
        modulationEnvelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.3 },
      }).connect(this.volumeNode)
    } else if (this.mode === 'synth_pad') {
      this.poly = new Tone.PolySynth(Tone.AMSynth, {
        harmonicity: 2,
        envelope: { attack: 0.5, decay: 0.1, sustain: 0.8, release: 1.5 },
        modulation: { type: 'sine' },
        modulationEnvelope: { attack: 0.5, decay: 0.1, sustain: 0.8, release: 1.5 },
      }).connect(this.volumeNode)
    } else {
      this.poly = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.5, sustain: 0.4, release: 1 },
      }).connect(this.volumeNode)
    }
  }

  private playStep(time: number, step: number) {
    const chord = this.currentChord!
    const vel = 0.4 + (this.intensity / 100) * 0.4

    if (this.mode === 'synth_pad') {
      if (step === 0) {
        const notes = this.scaleEngine.getChordTones(chord, 4)
        this.poly.triggerAttackRelease(notes, '2n', time, vel * 0.6)
      }
      return
    }

    if (step === 0 || step === 8) {
      const notes = this.scaleEngine.getChordTones(chord, 4)
      const dur = step === 0 ? '4n' : '8n'
      this.poly.triggerAttackRelease(notes, dur, time, vel)
    }

    if (this.intensity > 60 && step % 4 === 2) {
      const note = this.scaleEngine.getRandomScaleNote(chord, [4, 5])
      this.poly.triggerAttackRelease(note, '16n', time, vel * 0.5)
    }
  }

  setMode(mode: KeysMode) {
    this.mode = mode
    this.buildSynth()
    this.step = 0
  }

  generatePattern(_chord: Chord, intensity: number) {
    this.intensity = intensity
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
