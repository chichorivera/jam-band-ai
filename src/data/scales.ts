export type ScaleName =
  | 'major'
  | 'minor'
  | 'pentatonic_major'
  | 'pentatonic_minor'
  | 'blues'
  | 'dorian'
  | 'mixolydian'
  | 'lydian'
  | 'major_jazz'

export const SCALE_INTERVALS: Record<ScaleName, number[]> = {
  major:            [0, 2, 4, 5, 7, 9, 11],
  minor:            [0, 2, 3, 5, 7, 8, 10],
  pentatonic_major: [0, 2, 4, 7, 9],
  pentatonic_minor: [0, 3, 5, 7, 10],
  blues:            [0, 3, 5, 6, 7, 10],
  dorian:           [0, 2, 3, 5, 7, 9, 10],
  mixolydian:       [0, 2, 4, 5, 7, 9, 10],
  lydian:           [0, 2, 4, 6, 7, 9, 11],
  major_jazz:       [0, 2, 4, 5, 7, 9, 11],
}

export const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export function getScaleNotes(root: string, scaleName: ScaleName): string[] {
  const rootIndex = CHROMATIC_NOTES.indexOf(root.replace('b', '#').replace('Eb', 'D#').replace('Bb', 'A#').replace('Ab', 'G#'))
  if (rootIndex === -1) return []
  const intervals = SCALE_INTERVALS[scaleName]
  return intervals.map(i => CHROMATIC_NOTES[(rootIndex + i) % 12])
}

export function getScaleNotesWithOctave(root: string, scaleName: ScaleName, octave: number): string[] {
  const notes = getScaleNotes(root, scaleName)
  const rootIndex = CHROMATIC_NOTES.indexOf(root)
  return notes.map(note => {
    const noteIndex = CHROMATIC_NOTES.indexOf(note)
    const oct = noteIndex >= rootIndex ? octave : octave + 1
    return `${note}${oct}`
  })
}
