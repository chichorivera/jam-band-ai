import { useState, useEffect, useRef, useCallback } from 'react'
import * as Tone from 'tone'

import { audioEngine } from './engine/AudioEngine'
import { ChordEngine } from './engine/ChordEngine'
import { ScaleEngine } from './engine/ScaleEngine'
import { DrumPlayer } from './engine/DrumPlayer'
import { BassPlayer } from './engine/BassPlayer'
import { GuitarPlayer } from './engine/GuitarPlayer'
import { KeysPlayer } from './engine/KeysPlayer'
import { MicAnalyser } from './engine/MicAnalyser'
import { AIDirector } from './engine/AIDirector'

import { StyleSelector } from './components/StyleSelector'
import { MasterControls } from './components/MasterControls'
import { ChordTimeline } from './components/ChordTimeline'
import { BandMixer } from './components/BandMixer'
import { MicMonitor } from './components/MicMonitor'
import { AIStatusLog } from './components/AIStatusLog'

import { STYLES } from './data/styles'
import type { MusicStyle, Key, Chord, AIDecision, MicData, BassMode, KeysMode, DrumPattern } from './types'

// --- engine singletons ---
const scaleEngine  = new ScaleEngine()
const chordEngine  = new ChordEngine()
const drumPlayer   = new DrumPlayer()
const bassPlayer   = new BassPlayer(scaleEngine)
const guitarPlayer = new GuitarPlayer(scaleEngine)
const keysPlayer   = new KeysPlayer(scaleEngine)
const micAnalyser  = new MicAnalyser()
const aiDirector   = new AIDirector()

interface TrackState {
  isActive: boolean
  volume: number
  mode: string
  vu: number
  currentNote?: string
}

interface LogEntry { id: number; decision: AIDecision; time: string }

function App() {
  const [style, setStyle]       = useState<MusicStyle>('rock')
  const [key, setKey]           = useState<Key>('C')
  const [bpm, setBpm]           = useState(110)
  const [isPlaying, setIsPlaying] = useState(false)
  const [chordProgress, setChordProgress] = useState(0)
  const [timelineChords, setTimelineChords] = useState<Chord[]>([])
  const [timelineIndex]         = useState(0)
  const [micActive, setMicActive] = useState(false)
  const [micData, setMicData]   = useState<MicData>({ rms: 0, lowEnergy: 0, midEnergy: 0, highEnergy: 0, transients: 0, smoothedEnergy: 0 })
  const [aiLog, setAiLog]       = useState<LogEntry[]>([])
  const [aiAutonomy, setAiAutonomy]     = useState(70)
  const [aiReactivity, setAiReactivity] = useState(60)
  const [engineReady, setEngineReady]   = useState(false)

  const [drums,  setDrums]  = useState<TrackState>({ isActive: true, volume: 0.8,  mode: 'rock_basic', vu: 0 })
  const [bass,   setBass]   = useState<TrackState>({ isActive: true, volume: 0.75, mode: 'groove',     vu: 0 })
  const [guitar, setGuitar] = useState<TrackState>({ isActive: true, volume: 0.6,  mode: 'rhythm',     vu: 0 })
  const [keys,   setKeys]   = useState<TrackState>({ isActive: true, volume: 0.65, mode: 'piano',      vu: 0 })

  const logIdRef         = useRef(0)
  const loopRef          = useRef<Tone.Loop | null>(null)
  const beatRef          = useRef(0)
  const chordBeatsRef    = useRef(0)

  const updateTimeline = useCallback(() => {
    const upcoming = chordEngine.getUpcomingChords(12)
    setTimelineChords(upcoming)
  }, [])

  const handleAIDecision = useCallback((decision: AIDecision) => {
    if (decision.type === 'trigger_fill') drumPlayer.triggerFill()
    if (decision.type === 'intensity_up' || decision.type === 'intensity_down') {
      const v = aiDirector.getCurrentIntensity()
      ;[drumPlayer, bassPlayer, guitarPlayer, keysPlayer].forEach(p => p.setIntensity(v))
    }
    if (decision.type === 'tempo_up') {
      setBpm(prev => { const next = Math.min(220, prev + decision.bpm); audioEngine.setBPM(next); return next })
    }
    if (decision.type === 'tempo_down') {
      setBpm(prev => { const next = Math.max(40, prev - decision.bpm); audioEngine.setBPM(next); return next })
    }
    if (decision.type === 'solo') {
      guitarPlayer.setIntensity(decision.instrument === 'guitar' ? 90 : 40)
      keysPlayer.setIntensity(decision.instrument === 'keys' ? 90 : 40)
    }
    if (decision.type === 'breakdown') {
      ;[drumPlayer, bassPlayer, guitarPlayer, keysPlayer].forEach((p, i) => p.setIntensity([20, 20, 10, 10][i]))
    }
    if (decision.type === 'buildup') {
      ;[drumPlayer, bassPlayer, guitarPlayer, keysPlayer].forEach((p, i) => p.setIntensity([85, 80, 75, 70][i]))
    }
  }, [])

  // initialize players once
  useEffect(() => {
    drumPlayer.init()
    bassPlayer.init()
    guitarPlayer.init()
    keysPlayer.init()

    chordEngine.setStyle(style)
    chordEngine.setKey(key)
    scaleEngine.setRoot(key)
    updateTimeline()

    micAnalyser.setOnUpdate(data => setMicData(data))

    aiDirector.setOnDecision(decision => {
      setAiLog(prev => {
        const now = new Date()
        const time = `${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
        return [...prev, { id: logIdRef.current++, decision, time }]
      })
      handleAIDecision(decision)
    })

    return () => {
      drumPlayer.dispose()
      bassPlayer.dispose()
      guitarPlayer.dispose()
      keysPlayer.dispose()
      loopRef.current?.dispose()
      micAnalyser.stop()
      audioEngine.dispose()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handlePlay() {
    await audioEngine.start()
    setEngineReady(true)
    audioEngine.setBPM(bpm)

    chordEngine.regenerate()
    updateTimeline()

    const firstChord = chordEngine.getCurrentChord()
    ;[drumPlayer, bassPlayer, guitarPlayer, keysPlayer].forEach(p => {
      p.setChord(firstChord)
      if (p.isActive) p.start()
    })

    beatRef.current = 0
    chordBeatsRef.current = 0

    loopRef.current = new Tone.Loop((time) => {
      beatRef.current++
      chordBeatsRef.current++

      const chord = chordEngine.getCurrentChord()
      const dur = chord.duration

      if (chordBeatsRef.current >= dur) {
        chordBeatsRef.current = 0
        const next = chordEngine.advance()
        ;[drumPlayer, bassPlayer, guitarPlayer, keysPlayer].forEach(p => p.setChord(next))

        Tone.getDraw().schedule(() => { updateTimeline() }, time)
      }

      const progressRatio = chordBeatsRef.current / dur
      Tone.getDraw().schedule(() => { setChordProgress(progressRatio) }, time)

      if (beatRef.current % 8 === 0) {
        aiDirector.onLoopComplete(micAnalyser.isActive() ? micAnalyser.getData() : null)
      }
    }, '4n')

    loopRef.current.start(0)
    audioEngine.startTransport()
    setIsPlaying(true)
  }

  function handleStop() {
    audioEngine.stopTransport()
    loopRef.current?.stop()
    ;[drumPlayer, bassPlayer, guitarPlayer, keysPlayer].forEach(p => p.stop())
    beatRef.current = 0
    chordBeatsRef.current = 0
    chordEngine.reset()
    setIsPlaying(false)
    setChordProgress(0)
    updateTimeline()
  }

  async function handleMicToggle() {
    if (micActive) {
      micAnalyser.stop()
      setMicActive(false)
    } else {
      const ok = await micAnalyser.start()
      setMicActive(ok)
    }
  }

  function handleStyleChange(newStyle: MusicStyle) {
    setStyle(newStyle)
    const cfg = STYLES[newStyle]
    setBpm(cfg.defaultBPM)
    audioEngine.setBPM(cfg.defaultBPM)
    chordEngine.setStyle(newStyle)
    chordEngine.setKey(key)
    drumPlayer.setDrumPattern(cfg.drumPattern)
    bassPlayer.setMode(cfg.bassStyle as BassMode)
    keysPlayer.setMode(cfg.keysStyle as KeysMode)
    updateTimeline()
  }

  function handleKeyChange(newKey: Key) {
    setKey(newKey)
    scaleEngine.setRoot(newKey)
    chordEngine.setKey(newKey)
    updateTimeline()
  }

  function handleBpmChange(newBpm: number) {
    setBpm(newBpm)
    audioEngine.setBPM(newBpm)
  }

  // Apply track state changes to engine
  useEffect(() => {
    if (!engineReady) return
    drums.isActive ? drumPlayer.start() : drumPlayer.stop()
    drumPlayer.setVolume(drums.volume)
    drumPlayer.setDrumPattern(drums.mode as DrumPattern)
  }, [drums, engineReady])

  useEffect(() => {
    if (!engineReady) return
    bass.isActive ? bassPlayer.start() : bassPlayer.stop()
    bassPlayer.setVolume(bass.volume)
    bassPlayer.setMode(bass.mode as BassMode)
  }, [bass, engineReady])

  useEffect(() => {
    if (!engineReady) return
    guitar.isActive ? guitarPlayer.start() : guitarPlayer.stop()
    guitarPlayer.setVolume(guitar.volume)
  }, [guitar, engineReady])

  useEffect(() => {
    if (!engineReady) return
    keys.isActive ? keysPlayer.start() : keysPlayer.stop()
    keysPlayer.setVolume(keys.volume)
    keysPlayer.setMode(keys.mode as KeysMode)
  }, [keys, engineReady])

  useEffect(() => { aiDirector.setAutonomy(aiAutonomy) }, [aiAutonomy])
  useEffect(() => { aiDirector.setReactivity(aiReactivity) }, [aiReactivity])

  // VU meter simulation
  useEffect(() => {
    if (!isPlaying) return
    const id = setInterval(() => {
      const next = (vu: number, active: boolean) =>
        active ? Math.min(1, Math.max(0, vu + (Math.random() - 0.42) * 0.25)) : 0
      setDrums(p  => ({ ...p, vu: next(p.vu, p.isActive) }))
      setBass(p   => ({ ...p, vu: next(p.vu, p.isActive) }))
      setGuitar(p => ({ ...p, vu: next(p.vu, p.isActive) }))
      setKeys(p   => ({ ...p, vu: next(p.vu, p.isActive) }))
    }, 80)
    return () => clearInterval(id)
  }, [isPlaying])

  const patchDrums  = (p: Partial<TrackState>) => setDrums(prev  => ({ ...prev, ...p }))
  const patchBass   = (p: Partial<TrackState>) => setBass(prev   => ({ ...prev, ...p }))
  const patchGuitar = (p: Partial<TrackState>) => setGuitar(prev => ({ ...prev, ...p }))
  const patchKeys   = (p: Partial<TrackState>) => setKeys(prev   => ({ ...prev, ...p }))

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-3 md:p-5 flex flex-col gap-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            🎵 AI Jam Band
          </h1>
          <p className="text-xs text-zinc-500">Tu banda de IA en tiempo real</p>
        </div>
        <StyleSelector currentStyle={style} onChange={handleStyleChange} />
      </div>

      {/* Master Controls */}
      <MasterControls
        bpm={bpm}
        currentKey={key}
        isPlaying={isPlaying}
        onBpmChange={handleBpmChange}
        onKeyChange={handleKeyChange}
        onPlay={handlePlay}
        onStop={handleStop}
        onFill={() => drumPlayer.triggerFill()}
        onBuildup={() => handleAIDecision({ type: 'buildup', reason: 'Buildup manual' })}
        onBreakdown={() => handleAIDecision({ type: 'breakdown', reason: 'Breakdown manual' })}
      />

      {/* Chord Timeline */}
      <ChordTimeline
        upcoming={timelineChords}
        currentIndex={timelineIndex}
        progress={chordProgress}
      />

      {/* Band Mixer */}
      <BandMixer
        drums={drums} bass={bass} guitar={guitar} keys={keys}
        onDrums={patchDrums} onBass={patchBass} onGuitar={patchGuitar} onKeys={patchKeys}
      />

      {/* Bottom row: Mic + AI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MicMonitor micActive={micActive} data={micData} onToggle={handleMicToggle} />
        <AIStatusLog
          log={aiLog}
          autonomy={aiAutonomy}
          reactivity={aiReactivity}
          onAutonomyChange={setAiAutonomy}
          onReactivityChange={setAiReactivity}
        />
      </div>
    </div>
  )
}

export default App
