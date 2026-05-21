export interface Chord {
  root: string
  quality: string
  extensions: string[]
  duration: number
  name: string
  degree: string
  function: 'tonic' | 'subdominant' | 'dominant'
}

export interface Progression {
  name: string
  chords: Chord[]
  beatsPerChord: number
}

export type MusicStyle = 'rock' | 'blues' | 'jazz' | 'funk' | 'latin' | 'lofi'
export type Key = 'C' | 'C#' | 'D' | 'Eb' | 'E' | 'F' | 'F#' | 'G' | 'Ab' | 'A' | 'Bb' | 'B'

export type BassMode = 'root' | 'groove' | 'walking' | 'busy'
export type GuitarMode = 'rhythm' | 'lead'
export type KeysMode = 'piano' | 'rhodes' | 'synth_pad'
export type DrumPattern = 'rock_basic' | 'blues_shuffle' | 'jazz_ride' | 'funk_16th' | 'clave_32' | 'lofi_boom_bap'

export type AIDecision =
  | { type: 'intensity_up'; amount: number; reason: string }
  | { type: 'intensity_down'; amount: number; reason: string }
  | { type: 'tempo_up'; bpm: number; reason: string }
  | { type: 'tempo_down'; bpm: number; reason: string }
  | { type: 'trigger_fill'; reason: string }
  | { type: 'change_section'; section: 'verse' | 'chorus' | 'bridge'; reason: string }
  | { type: 'change_pattern'; style: string; reason: string }
  | { type: 'solo'; instrument: 'guitar' | 'keys' | 'bass'; reason: string }
  | { type: 'breakdown'; reason: string }
  | { type: 'buildup'; reason: string }

export interface MicData {
  rms: number
  lowEnergy: number
  midEnergy: number
  highEnergy: number
  transients: number
  smoothedEnergy: number
}

export interface StyleConfig {
  name: string
  icon: string
  bpmRange: [number, number]
  defaultBPM: number
  scale: string
  progressions: string[]
  drumPattern: DrumPattern
  bassStyle: BassMode
  guitarStyle: string
  keysStyle: KeysMode
}
