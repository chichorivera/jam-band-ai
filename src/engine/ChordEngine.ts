import { getFlatProgression } from '../data/chords'
import type { Chord, Key, MusicStyle } from '../types'

export class ChordEngine {
  private progression: Chord[] = []
  private currentIndex = 0
  private style: MusicStyle = 'rock'
  private key: Key = 'C'
  private onChordChange: ((chord: Chord, index: number) => void) | null = null

  setStyle(style: MusicStyle) {
    this.style = style
    this.regenerate()
  }

  setKey(key: Key) {
    this.key = key
    this.regenerate()
  }

  regenerate() {
    this.progression = getFlatProgression(this.style, this.key)
    this.currentIndex = 0
  }

  getProgression(): Chord[] {
    return this.progression
  }

  getCurrentChord(): Chord {
    return this.progression[this.currentIndex] ?? this.progression[0]
  }

  getUpcomingChords(count = 8): Chord[] {
    const result: Chord[] = []
    for (let i = 0; i < count; i++) {
      result.push(this.progression[(this.currentIndex + i) % this.progression.length])
    }
    return result
  }

  advance() {
    this.currentIndex = (this.currentIndex + 1) % this.progression.length
    if (this.onChordChange) {
      this.onChordChange(this.getCurrentChord(), this.currentIndex)
    }
    return this.getCurrentChord()
  }

  onChordChanged(cb: (chord: Chord, index: number) => void) {
    this.onChordChange = cb
  }

  reset() {
    this.currentIndex = 0
  }
}
