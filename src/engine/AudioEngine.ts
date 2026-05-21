import * as Tone from 'tone'

export type EffectChain = {
  reverb: Tone.Reverb
  compressor: Tone.Compressor
  eq: Tone.EQ3
}

class AudioEngine {
  private started = false
  private masterVol: Tone.Volume

  drumEffects!: { compressor: Tone.Compressor; reverb: Tone.Reverb; eq: Tone.EQ3 }
  bassEffects!: { chorus: Tone.Chorus; compressor: Tone.Compressor; eq: Tone.EQ3 }
  guitarEffects!: { distortion: Tone.Distortion; flanger: Tone.FeedbackDelay; delay: Tone.FeedbackDelay; reverb: Tone.Reverb }
  keysEffects!: { chorus: Tone.Chorus; reverb: Tone.Reverb; eq: Tone.EQ3 }

  constructor() {
    this.masterVol = new Tone.Volume(-6).toDestination()
    this.buildEffectChains()
  }

  private buildEffectChains() {
    this.drumEffects = {
      compressor: new Tone.Compressor(-20, 4),
      eq: new Tone.EQ3(2, 0, -2),
      reverb: new Tone.Reverb({ decay: 0.8, wet: 0.15 }),
    }
    this.drumEffects.compressor.connect(this.drumEffects.eq)
    this.drumEffects.eq.connect(this.drumEffects.reverb)
    this.drumEffects.reverb.connect(this.masterVol)

    this.bassEffects = {
      chorus: new Tone.Chorus(3, 2.5, 0.5).start(),
      eq: new Tone.EQ3(-2, 4, -4),
      compressor: new Tone.Compressor(-18, 4),
    }
    this.bassEffects.chorus.connect(this.bassEffects.eq)
    this.bassEffects.eq.connect(this.bassEffects.compressor)
    this.bassEffects.compressor.connect(this.masterVol)

    this.guitarEffects = {
      distortion: new Tone.Distortion(0.3),
      flanger: new Tone.FeedbackDelay('32n', 0.3),
      delay: new Tone.FeedbackDelay('8n', 0.2),
      reverb: new Tone.Reverb({ decay: 1.5, wet: 0.25 }),
    }
    this.guitarEffects.distortion.connect(this.guitarEffects.flanger)
    this.guitarEffects.flanger.connect(this.guitarEffects.delay)
    this.guitarEffects.delay.connect(this.guitarEffects.reverb)
    this.guitarEffects.reverb.connect(this.masterVol)

    this.keysEffects = {
      chorus: new Tone.Chorus(4, 2, 0.4).start(),
      eq: new Tone.EQ3(0, 2, 0),
      reverb: new Tone.Reverb({ decay: 2, wet: 0.3 }),
    }
    this.keysEffects.chorus.connect(this.keysEffects.eq)
    this.keysEffects.eq.connect(this.keysEffects.reverb)
    this.keysEffects.reverb.connect(this.masterVol)
  }

  async start() {
    if (this.started) return
    await Tone.start()
    this.started = true
  }

  isStarted() { return this.started }

  startTransport() {
    if (Tone.getTransport().state !== 'started') {
      Tone.getTransport().start()
    }
  }

  stopTransport() {
    Tone.getTransport().stop()
  }

  setBPM(bpm: number) {
    Tone.getTransport().bpm.value = bpm
  }

  getBPM(): number {
    return Tone.getTransport().bpm.value
  }

  setMasterVolume(db: number) {
    this.masterVol.volume.value = db
  }

  getDrumOutput(): Tone.ToneAudioNode {
    return this.drumEffects.compressor
  }

  getBassOutput(): Tone.ToneAudioNode {
    return this.bassEffects.chorus
  }

  getGuitarOutput(): Tone.ToneAudioNode {
    return this.guitarEffects.distortion
  }

  getKeysOutput(): Tone.ToneAudioNode {
    return this.keysEffects.chorus
  }

  dispose() {
    Object.values(this.drumEffects).forEach(e => e.dispose())
    Object.values(this.bassEffects).forEach(e => e.dispose())
    Object.values(this.guitarEffects).forEach(e => e.dispose())
    Object.values(this.keysEffects).forEach(e => e.dispose())
    this.masterVol.dispose()
  }
}

export const audioEngine = new AudioEngine()
