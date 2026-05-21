import type { Chord } from '../types'

export abstract class InstrumentPlayer {
  isActive = true
  volume = 0.8
  intensity = 50
  currentChord: Chord | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected loop: any | null = null

  abstract init(): void
  abstract generatePattern(chord: Chord, intensity: number): void
  abstract dispose(): void

  setChord(chord: Chord) {
    this.currentChord = chord
    if (this.loop && this.isActive) {
      this.generatePattern(chord, this.intensity)
    }
  }

  setIntensity(value: number) {
    this.intensity = Math.max(0, Math.min(100, value))
  }

  setVolume(value: number) {
    this.volume = Math.max(0, Math.min(1, value))
    this.applyVolume(value)
  }

  protected abstract applyVolume(value: number): void

  start() {
    this.isActive = true
    if (this.loop && this.loop.state !== 'started') {
      this.loop.start(0)
    }
  }

  stop() {
    this.isActive = false
    if (this.loop && this.loop.state === 'started') {
      this.loop.stop()
    }
  }
}
