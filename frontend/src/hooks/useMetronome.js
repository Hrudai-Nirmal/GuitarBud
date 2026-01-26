import { useRef, useEffect } from 'react'

// useMetronome(bpm, enabled, onTick)
// - creates an AudioContext and uses an oscillator for clicks
export default function useMetronome(bpm, enabled, onTick) {
  const ctxRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    if (!ctxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      ctxRef.current = new AudioContext()
    }
    const ctx = ctxRef.current

    function tick() {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 1000
      gain.gain.value = 0.0001
      osc.connect(gain)
      gain.connect(ctx.destination)
      const now = ctx.currentTime
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.5, now + 0.001)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)
      osc.start(now)
      osc.stop(now + 0.09)
      if (typeof onTick === 'function') onTick()
    }

    const interval = (60 / (bpm || 120)) * 1000
    tick()
    timerRef.current = setInterval(tick, interval)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [bpm, enabled, onTick])

  return { stop: () => { if (timerRef.current) clearInterval(timerRef.current) } }
}
