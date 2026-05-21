import type { MicData } from '../types'

export class MicAnalyser {
  private analyser: AnalyserNode | null = null
  private audioCtx: AudioContext | null = null
  private source: MediaStreamAudioSourceNode | null = null
  private stream: MediaStream | null = null
  private rafId = 0
  private data: MicData = { rms: 0, lowEnergy: 0, midEnergy: 0, highEnergy: 0, transients: 0, smoothedEnergy: 0 }
  private smoothing = 0.9
  private active = false
  private onUpdate: ((data: MicData) => void) | null = null

  setOnUpdate(cb: (data: MicData) => void) { this.onUpdate = cb }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      this.audioCtx = new AudioContext()
      this.source = this.audioCtx.createMediaStreamSource(this.stream)
      this.analyser = this.audioCtx.createAnalyser()
      this.analyser.fftSize = 2048
      this.analyser.smoothingTimeConstant = 0.8
      this.source.connect(this.analyser)
      this.active = true
      this.tick()
      return true
    } catch {
      return false
    }
  }

  stop() {
    this.active = false
    cancelAnimationFrame(this.rafId)
    this.stream?.getTracks().forEach(t => t.stop())
    this.audioCtx?.close()
    this.data = { rms: 0, lowEnergy: 0, midEnergy: 0, highEnergy: 0, transients: 0, smoothedEnergy: 0 }
    this.onUpdate?.(this.data)
  }

  isActive() { return this.active }

  getData(): MicData { return this.data }

  private tick() {
    if (!this.active || !this.analyser || !this.audioCtx) return
    this.rafId = requestAnimationFrame(() => this.tick())

    const buf = new Float32Array(this.analyser.fftSize)
    this.analyser.getFloatTimeDomainData(buf)

    let sum = 0
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i]
    const rms = Math.sqrt(sum / buf.length)

    const freqBuf = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(freqBuf)

    const sr = this.audioCtx.sampleRate
    const binHz = sr / this.analyser.fftSize
    const lowEnd = Math.floor(300 / binHz)
    const midEnd = Math.floor(3000 / binHz)

    let low = 0, mid = 0, high = 0
    for (let i = 1; i < lowEnd; i++) low += freqBuf[i]
    for (let i = lowEnd; i < midEnd; i++) mid += freqBuf[i]
    for (let i = midEnd; i < freqBuf.length; i++) high += freqBuf[i]

    const norm = (v: number, count: number) => Math.min(1, (v / count) / 128)

    const prevSmoothed = this.data.smoothedEnergy
    const newSmoothed = prevSmoothed * this.smoothing + rms * (1 - this.smoothing)
    const transients = Math.max(0, rms - prevSmoothed)

    this.data = {
      rms: Math.min(1, rms * 5),
      lowEnergy: norm(low, lowEnd),
      midEnergy: norm(mid, midEnd - lowEnd),
      highEnergy: norm(high, freqBuf.length - midEnd),
      transients: Math.min(1, transients * 10),
      smoothedEnergy: newSmoothed,
    }

    this.onUpdate?.(this.data)
  }
}
