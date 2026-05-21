import { SCALE_INTERVALS, CHROMATIC_NOTES, type ScaleName } from '../data/scales'
import type { Chord } from '../types'

export class ScaleEngine {
  private root: string = 'C'
  private scaleName: ScaleName = 'major'

  setRoot(root: string) { this.root = root }
  setScale(name: ScaleName) { this.scaleName = name }

  private rootIndex(): number {
    return CHROMATIC_NOTES.indexOf(this.root)
  }

  getScaleNotes(octave = 4): string[] {
    const ri = this.rootIndex()
    if (ri === -1) return []
    return SCALE_INTERVALS[this.scaleName].map(i => {
      const noteIdx = (ri + i) % 12
      const oct = noteIdx >= ri ? octave : octave + 1
      return `${CHROMATIC_NOTES[noteIdx]}${oct}`
    })
  }

  getChordTones(chord: Chord, octave = 3): string[] {
    const ri = CHROMATIC_NOTES.indexOf(chord.root.replace('b', '#'))
    if (ri === -1) return [`${chord.root}${octave}`]

    const intervals: number[] = []
    const q = chord.quality

    if (q === 'maj')      intervals.push(0, 4, 7)
    else if (q === 'min') intervals.push(0, 3, 7)
    else if (q === 'dom7') intervals.push(0, 4, 7, 10)
    else if (q === 'maj7') intervals.push(0, 4, 7, 11)
    else if (q === 'min7') intervals.push(0, 3, 7, 10)
    else if (q === 'dim')  intervals.push(0, 3, 6)
    else if (q === 'aug')  intervals.push(0, 4, 8)
    else if (q === 'sus4') intervals.push(0, 5, 7)
    else if (q === 'dom9') intervals.push(0, 4, 7, 10, 14)
    else if (q === 'maj9') intervals.push(0, 4, 7, 11, 14)
    else if (q === 'min9') intervals.push(0, 3, 7, 10, 14)
    else                   intervals.push(0, 4, 7)

    return intervals.map(i => {
      const noteIdx = (ri + i) % 12
      const extraOct = Math.floor((ri + i) / 12)
      return `${CHROMATIC_NOTES[noteIdx]}${octave + extraOct}`
    })
  }

  getRandomScaleNote(chord: Chord, octaveRange: [number, number] = [3, 5]): string {
    const [minOct, maxOct] = octaveRange
    const oct = minOct + Math.floor(Math.random() * (maxOct - minOct + 1))
    const notes = this.getScaleNotes(oct)
    if (notes.length === 0) return `${chord.root}${oct}`
    return notes[Math.floor(Math.random() * notes.length)]
  }

  getMelodicPhrase(chord: Chord, length: number, octave = 4): string[] {
    const tones = this.getChordTones(chord, octave)
    const scale = this.getScaleNotes(octave)
    const pool = [...new Set([...tones, ...scale])]
    const phrase: string[] = []
    for (let i = 0; i < length; i++) {
      const prev = phrase[phrase.length - 1]
      if (!prev) {
        phrase.push(tones[0])
        continue
      }
      const prevIdx = pool.indexOf(prev)
      const step = Math.random() < 0.6
        ? (Math.random() < 0.5 ? 1 : -1)
        : Math.floor((Math.random() - 0.5) * 5)
      const nextIdx = Math.max(0, Math.min(pool.length - 1, prevIdx + step))
      phrase.push(pool[nextIdx])
    }
    return phrase
  }
}
