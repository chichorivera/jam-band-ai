import type { Chord, Progression, Key, MusicStyle } from '../types'

const NOTE_OFFSETS: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
}

const CHROMATIC = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

export function transposeNote(note: string, semitones: number): string {
  const idx = NOTE_OFFSETS[note]
  if (idx === undefined) return note
  return CHROMATIC[(idx + semitones + 12) % 12]
}

interface ChordTemplate {
  degreeOffset: number
  quality: string
  extensions: string[]
  degree: string
  function: 'tonic' | 'subdominant' | 'dominant'
  duration: number
}

function buildChord(root: string, template: ChordTemplate): Chord {
  const chordRoot = transposeNote(root, template.degreeOffset)
  const qualitySymbols: Record<string, string> = {
    maj: '', min: 'm', dom7: '7', maj7: 'maj7', min7: 'm7',
    dim: 'dim', aug: 'aug', sus4: 'sus4', min7b5: 'm7b5',
    dom9: '9', maj9: 'maj9', min9: 'm9',
  }
  const extStr = template.extensions.join('')
  const qualStr = qualitySymbols[template.quality] ?? template.quality
  return {
    root: chordRoot,
    quality: template.quality,
    extensions: template.extensions,
    duration: template.duration,
    name: `${chordRoot}${qualStr}${extStr}`,
    degree: template.degree,
    function: template.function,
  }
}

const PROGRESSIONS: Record<MusicStyle, ChordTemplate[][]> = {
  rock: [
    [
      { degreeOffset: 0,  quality: 'maj',  extensions: [], degree: 'I',   function: 'tonic',       duration: 4 },
      { degreeOffset: 5,  quality: 'maj',  extensions: [], degree: 'IV',  function: 'subdominant', duration: 4 },
      { degreeOffset: 7,  quality: 'maj',  extensions: [], degree: 'V',   function: 'dominant',    duration: 4 },
      { degreeOffset: 5,  quality: 'maj',  extensions: [], degree: 'IV',  function: 'subdominant', duration: 4 },
    ],
    [
      { degreeOffset: 0,  quality: 'maj',  extensions: [], degree: 'I',   function: 'tonic',       duration: 4 },
      { degreeOffset: 7,  quality: 'maj',  extensions: [], degree: 'V',   function: 'dominant',    duration: 4 },
      { degreeOffset: 9,  quality: 'min',  extensions: [], degree: 'vi',  function: 'tonic',       duration: 4 },
      { degreeOffset: 5,  quality: 'maj',  extensions: [], degree: 'IV',  function: 'subdominant', duration: 4 },
    ],
  ],
  blues: [
    [
      { degreeOffset: 0,  quality: 'dom7', extensions: [], degree: 'I7',  function: 'tonic',       duration: 4 },
      { degreeOffset: 0,  quality: 'dom7', extensions: [], degree: 'I7',  function: 'tonic',       duration: 4 },
      { degreeOffset: 0,  quality: 'dom7', extensions: [], degree: 'I7',  function: 'tonic',       duration: 4 },
      { degreeOffset: 0,  quality: 'dom7', extensions: [], degree: 'I7',  function: 'tonic',       duration: 4 },
      { degreeOffset: 5,  quality: 'dom7', extensions: [], degree: 'IV7', function: 'subdominant', duration: 4 },
      { degreeOffset: 5,  quality: 'dom7', extensions: [], degree: 'IV7', function: 'subdominant', duration: 4 },
      { degreeOffset: 0,  quality: 'dom7', extensions: [], degree: 'I7',  function: 'tonic',       duration: 4 },
      { degreeOffset: 0,  quality: 'dom7', extensions: [], degree: 'I7',  function: 'tonic',       duration: 4 },
      { degreeOffset: 7,  quality: 'dom7', extensions: [], degree: 'V7',  function: 'dominant',    duration: 4 },
      { degreeOffset: 5,  quality: 'dom7', extensions: [], degree: 'IV7', function: 'subdominant', duration: 4 },
      { degreeOffset: 0,  quality: 'dom7', extensions: [], degree: 'I7',  function: 'tonic',       duration: 4 },
      { degreeOffset: 7,  quality: 'dom7', extensions: [], degree: 'V7',  function: 'dominant',    duration: 4 },
    ],
  ],
  jazz: [
    [
      { degreeOffset: 2,  quality: 'min7', extensions: [], degree: 'ii7',   function: 'subdominant', duration: 4 },
      { degreeOffset: 7,  quality: 'dom7', extensions: [], degree: 'V7',    function: 'dominant',    duration: 4 },
      { degreeOffset: 0,  quality: 'maj7', extensions: [], degree: 'Imaj7', function: 'tonic',       duration: 4 },
      { degreeOffset: 0,  quality: 'maj7', extensions: [], degree: 'Imaj7', function: 'tonic',       duration: 4 },
    ],
    [
      { degreeOffset: 0,  quality: 'maj7', extensions: [], degree: 'Imaj7', function: 'tonic',       duration: 4 },
      { degreeOffset: 9,  quality: 'min7', extensions: [], degree: 'vi7',   function: 'tonic',       duration: 4 },
      { degreeOffset: 2,  quality: 'min7', extensions: [], degree: 'ii7',   function: 'subdominant', duration: 4 },
      { degreeOffset: 7,  quality: 'dom7', extensions: [], degree: 'V7',    function: 'dominant',    duration: 4 },
    ],
  ],
  funk: [
    [
      { degreeOffset: 0,  quality: 'dom9', extensions: ['9'], degree: 'I9',  function: 'tonic',       duration: 8 },
      { degreeOffset: 5,  quality: 'dom7', extensions: [],    degree: 'IV7', function: 'subdominant', duration: 8 },
    ],
    [
      { degreeOffset: 0,  quality: 'dom7', extensions: [], degree: 'I7',  function: 'tonic',       duration: 16 },
    ],
  ],
  latin: [
    [
      { degreeOffset: 0,  quality: 'maj',  extensions: [], degree: 'I',  function: 'tonic',       duration: 4 },
      { degreeOffset: 5,  quality: 'maj',  extensions: [], degree: 'IV', function: 'subdominant', duration: 4 },
      { degreeOffset: 7,  quality: 'maj',  extensions: [], degree: 'V',  function: 'dominant',    duration: 4 },
      { degreeOffset: 0,  quality: 'maj',  extensions: [], degree: 'I',  function: 'tonic',       duration: 4 },
    ],
    [
      { degreeOffset: 0,  quality: 'maj7', extensions: [], degree: 'Imaj7',  function: 'tonic',       duration: 4 },
      { degreeOffset: 5,  quality: 'maj7', extensions: [], degree: 'IVmaj7', function: 'subdominant', duration: 4 },
      { degreeOffset: 7,  quality: 'dom7', extensions: [], degree: 'V7',     function: 'dominant',    duration: 4 },
      { degreeOffset: 0,  quality: 'maj7', extensions: [], degree: 'Imaj7',  function: 'tonic',       duration: 4 },
    ],
  ],
  lofi: [
    [
      { degreeOffset: 0,  quality: 'maj7', extensions: [], degree: 'Imaj7',  function: 'tonic',       duration: 4 },
      { degreeOffset: 4,  quality: 'min7', extensions: [], degree: 'iii7',   function: 'tonic',       duration: 4 },
      { degreeOffset: 5,  quality: 'maj7', extensions: [], degree: 'IVmaj7', function: 'subdominant', duration: 4 },
      { degreeOffset: 2,  quality: 'min7', extensions: [], degree: 'ii7',    function: 'subdominant', duration: 4 },
    ],
  ],
}

export function getProgression(style: MusicStyle, key: Key): Progression {
  const templates = PROGRESSIONS[style]
  const idx = Math.floor(Math.random() * templates.length)
  const chords = templates[idx].map(t => buildChord(key, t))
  return { name: `${style} progression`, chords, beatsPerChord: 4 }
}

export function getFlatProgression(style: MusicStyle, key: Key): Chord[] {
  const prog = getProgression(style, key)
  return prog.chords
}
