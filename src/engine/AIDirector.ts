import type { AIDecision, MicData } from '../types'

interface AIState {
  energy: number
  energyTrend: 'rising' | 'falling' | 'stable'
  loopsCompleted: number
  currentIntensity: number
  lastFillLoop: number
  lastPatternChange: number
  lastTempoChange: number
  highEnergyStreak: number
  lowEnergyStreak: number
  isSoloing: boolean
  soloStartLoop: number
}

export class AIDirector {
  private state: AIState = {
    energy: 0,
    energyTrend: 'stable',
    loopsCompleted: 0,
    currentIntensity: 50,
    lastFillLoop: 0,
    lastPatternChange: 0,
    lastTempoChange: 0,
    highEnergyStreak: 0,
    lowEnergyStreak: 0,
    isSoloing: false,
    soloStartLoop: 0,
  }

  private autonomy = 70
  private reactivity = 60
  private onDecision: ((decision: AIDecision) => void) | null = null
  private energyHistory: number[] = []

  setAutonomy(v: number) { this.autonomy = v }
  setReactivity(v: number) { this.reactivity = v }
  setOnDecision(cb: (d: AIDecision) => void) { this.onDecision = cb }

  onLoopComplete(micData: MicData | null) {
    const s = this.state
    s.loopsCompleted++

    const energy = micData
      ? micData.smoothedEnergy * (this.reactivity / 100) + s.currentIntensity / 100 * (1 - this.reactivity / 100)
      : s.currentIntensity / 100

    this.energyHistory.push(energy)
    if (this.energyHistory.length > 8) this.energyHistory.shift()

    const avg = this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length
    const prevAvg = this.energyHistory.slice(0, -1).reduce((a, b) => a + b, 0) / (this.energyHistory.length - 1)

    s.energy = avg
    s.energyTrend = avg > prevAvg + 0.05 ? 'rising' : avg < prevAvg - 0.05 ? 'falling' : 'stable'

    if (avg > 0.65) s.highEnergyStreak++; else s.highEnergyStreak = 0
    if (avg < 0.25) s.lowEnergyStreak++; else s.lowEnergyStreak = 0

    const roll = Math.random() * 100
    if (roll > this.autonomy) return

    this.evaluate(s)
  }

  private evaluate(s: AIState) {
    if (s.isSoloing && s.loopsCompleted - s.soloStartLoop >= 4) {
      s.isSoloing = false
      this.emit({ type: 'intensity_down', amount: 15, reason: 'Solo terminado, volviendo al groove base' })
      return
    }

    if (s.highEnergyStreak >= 4 && !s.isSoloing) {
      s.isSoloing = true
      s.soloStartLoop = s.loopsCompleted
      const inst = Math.random() < 0.5 ? 'guitar' : 'keys'
      this.emit({ type: 'solo', instrument: inst, reason: `Alta energía sostenida — solo de ${inst === 'guitar' ? 'guitarra' : 'teclados'}` })
      return
    }

    if (s.lowEnergyStreak >= 4) {
      this.emit({ type: 'breakdown', reason: 'Energía baja por mucho tiempo — creando espacio musical' })
      s.lowEnergyStreak = 0
      return
    }

    if (s.energyTrend === 'rising' && s.currentIntensity < 90) {
      const amount = 10 + Math.floor(Math.random() * 10)
      s.currentIntensity = Math.min(100, s.currentIntensity + amount)
      this.emit({ type: 'intensity_up', amount, reason: 'Energía en ascenso — subiendo intensidad' })
    } else if (s.energyTrend === 'falling' && s.currentIntensity > 20) {
      const amount = 8 + Math.floor(Math.random() * 8)
      s.currentIntensity = Math.max(0, s.currentIntensity - amount)
      this.emit({ type: 'intensity_down', amount, reason: 'Energía bajando — reduciendo densidad' })
    }

    if (s.loopsCompleted - s.lastFillLoop >= 8 && Math.random() < 0.4) {
      s.lastFillLoop = s.loopsCompleted
      this.emit({ type: 'trigger_fill', reason: 'Fill automático cada 8 compases' })
    }

    if (s.loopsCompleted - s.lastTempoChange >= 16 && Math.random() < 0.15) {
      s.lastTempoChange = s.loopsCompleted
      const up = s.energyTrend === 'rising'
      const bpmDelta = (3 + Math.floor(Math.random() * 5)) * (up ? 1 : -1)
      if (up) {
        this.emit({ type: 'tempo_up', bpm: bpmDelta, reason: 'Subiendo tempo levemente para seguir la energía' })
      } else {
        this.emit({ type: 'tempo_down', bpm: -bpmDelta, reason: 'Relajando el tempo' })
      }
    }
  }

  private emit(decision: AIDecision) {
    this.onDecision?.(decision)
  }

  getCurrentIntensity() { return this.state.currentIntensity }
}
