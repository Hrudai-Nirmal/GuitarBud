import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './Tuner.module.css'
import { MicrophoneIcon, StopIcon, LightbulbIcon } from './Icons'

// Standard guitar tuning frequencies (Hz)
const STANDARD_TUNING = [
  { note: 'E2', freq: 82.41, string: 6 },
  { note: 'A2', freq: 110.00, string: 5 },
  { note: 'D3', freq: 146.83, string: 4 },
  { note: 'G3', freq: 196.00, string: 3 },
  { note: 'B3', freq: 246.94, string: 2 },
  { note: 'E4', freq: 329.63, string: 1 },
]

// All chromatic notes with frequencies (A4 = 440Hz)
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Convert frequency to note info
function frequencyToNote(freq) {
  if (!freq || freq < 20) return null
  
  // Calculate semitones from A4 (440Hz)
  const semitones = 12 * Math.log2(freq / 440)
  const noteIndex = Math.round(semitones) + 69 // MIDI note number (A4 = 69)
  const cents = Math.round((semitones - Math.round(semitones)) * 100)
  
  const octave = Math.floor(noteIndex / 12) - 1
  const noteName = NOTE_NAMES[noteIndex % 12]
  
  // Calculate exact frequency for this note
  const exactFreq = 440 * Math.pow(2, (noteIndex - 69) / 12)
  
  return {
    note: noteName,
    octave,
    fullNote: `${noteName}${octave}`,
    cents,
    exactFreq,
    detected: freq
  }
}

// Find closest guitar string
function findClosestString(freq) {
  if (!freq) return null
  
  let closest = null
  let minDiff = Infinity
  
  for (const string of STANDARD_TUNING) {
    const diff = Math.abs(freq - string.freq)
    if (diff < minDiff) {
      minDiff = diff
      closest = string
    }
  }
  
  // Only return if within a reasonable range (within a major 3rd / ~26%)
  if (closest && minDiff < closest.freq * 0.26) {
    return closest
  }
  return null
}

// YIN algorithm for pitch detection (simplified)
function autoCorrelate(buffer, sampleRate) {
  const SIZE = buffer.length
  const MIN_SAMPLES = Math.floor(sampleRate / 500) // Max freq 500Hz
  const MAX_SAMPLES = Math.floor(sampleRate / 50)  // Min freq 50Hz
  
  // Check if signal is strong enough
  let rms = 0
  for (let i = 0; i < SIZE; i++) {
    rms += buffer[i] * buffer[i]
  }
  rms = Math.sqrt(rms / SIZE)
  
  if (rms < 0.01) return -1 // Too quiet
  
  // Autocorrelation
  let best = { correlation: 0, offset: 0 }
  
  for (let offset = MIN_SAMPLES; offset < MAX_SAMPLES && offset < SIZE; offset++) {
    let correlation = 0
    
    for (let i = 0; i < SIZE - offset; i++) {
      correlation += Math.abs(buffer[i] - buffer[i + offset])
    }
    
    correlation = 1 - (correlation / (SIZE - offset))
    
    if (correlation > best.correlation) {
      best = { correlation, offset }
    }
  }
  
  if (best.correlation > 0.9) {
    return sampleRate / best.offset
  }
  
  return -1
}

export default function Tuner() {
  const [isListening, setIsListening] = useState(false)
  const [frequency, setFrequency] = useState(null)
  const [noteInfo, setNoteInfo] = useState(null)
  const [closestString, setClosestString] = useState(null)
  const [error, setError] = useState(null)
  const [volume, setVolume] = useState(0)
  
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)
  const animationRef = useRef(null)
  const bufferRef = useRef(null)

  const analyze = useCallback(() => {
    if (!analyserRef.current || !bufferRef.current) return
    
    analyserRef.current.getFloatTimeDomainData(bufferRef.current)
    
    // Calculate volume (RMS)
    let sum = 0
    for (let i = 0; i < bufferRef.current.length; i++) {
      sum += bufferRef.current[i] * bufferRef.current[i]
    }
    const rms = Math.sqrt(sum / bufferRef.current.length)
    setVolume(Math.min(rms * 5, 1)) // Normalize to 0-1
    
    const freq = autoCorrelate(bufferRef.current, audioContextRef.current.sampleRate)
    
    if (freq > 0) {
      setFrequency(freq)
      const info = frequencyToNote(freq)
      setNoteInfo(info)
      setClosestString(findClosestString(freq))
    } else {
      setFrequency(null)
      setNoteInfo(null)
      setClosestString(null)
    }
    
    animationRef.current = requestAnimationFrame(analyze)
  }, [])

  const startListening = useCallback(async () => {
    try {
      setError(null)
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      })
      streamRef.current = stream
      
      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      audioContextRef.current = audioContext
      
      // Create analyser
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 4096
      analyserRef.current = analyser
      
      // Create buffer
      bufferRef.current = new Float32Array(analyser.fftSize)
      
      // Connect microphone to analyser
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      
      setIsListening(true)
      analyze()
      
    } catch (err) {
      console.error('Microphone error:', err)
      setError('Could not access microphone. Please allow microphone permissions.')
    }
  }, [analyze])

  const stopListening = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    
    setIsListening(false)
    setFrequency(null)
    setNoteInfo(null)
    setClosestString(null)
    setVolume(0)
  }, [])

  useEffect(() => {
    return () => stopListening()
  }, [stopListening])

  // Calculate needle position (-50 to 50 degrees based on cents)
  const needleRotation = noteInfo ? Math.max(-50, Math.min(50, noteInfo.cents)) : 0
  
  // Tuning status
  const getTuningStatus = () => {
    if (!noteInfo) return { text: 'Play a note', color: '#666' }
    const cents = Math.abs(noteInfo.cents)
    if (cents <= 3) return { text: 'In Tune!', color: '#4ade80' }
    if (cents <= 10) return { text: 'Almost there', color: '#facc15' }
    if (noteInfo.cents < 0) return { text: 'Tune Up', color: '#f87171' }
    return { text: 'Tune Down', color: '#f87171' }
  }
  
  const status = getTuningStatus()
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Guitar Tuner</h2>
      </div>

      <div className={styles.tunerBody}>
        {/* String indicators */}
        <div className={styles.strings}>
          {STANDARD_TUNING.map((s) => (
            <div 
              key={s.string} 
              className={`${styles.stringIndicator} ${closestString?.string === s.string ? styles.active : ''}`}
            >
              <span className={styles.stringNumber}>{s.string}</span>
              <span className={styles.stringNote}>{s.note}</span>
            </div>
          ))}
        </div>

        {/* Main tuner display */}
        <div className={styles.tunerDisplay}>
          {/* Dial background */}
          <div className={styles.dial}>
            {/* Scale marks */}
            <div className={styles.scaleMarks}>
              {[-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50].map(val => (
                <div 
                  key={val} 
                  className={`${styles.mark} ${val === 0 ? styles.centerMark : ''}`}
                  style={{ transform: `rotate(${val}deg)` }}
                />
              ))}
            </div>
            
            {/* Needle */}
            <div 
              className={styles.needle}
              style={{ transform: `rotate(${needleRotation}deg)` }}
            />
            
            {/* Center dot */}
            <div className={styles.centerDot} />
          </div>

          {/* Note display */}
          <div className={styles.noteDisplay}>
            <span className={styles.noteName}>
              {noteInfo ? noteInfo.note : '--'}
            </span>
            <span className={styles.noteOctave}>
              {noteInfo ? noteInfo.octave : ''}
            </span>
          </div>

          {/* Frequency */}
          <div className={styles.frequency}>
            {frequency ? `${frequency.toFixed(1)} Hz` : '-- Hz'}
          </div>

          {/* Cents deviation */}
          <div className={styles.cents}>
            {noteInfo ? `${noteInfo.cents > 0 ? '+' : ''}${noteInfo.cents} cents` : ''}
          </div>

          {/* Status */}
          <div className={styles.status} style={{ color: status.color }}>
            {status.text}
          </div>
        </div>

        {/* Volume meter */}
        <div className={styles.volumeMeter}>
          <div className={styles.volumeLabel}>Input Level</div>
          <div className={styles.volumeBar}>
            <div 
              className={styles.volumeFill} 
              style={{ width: `${volume * 100}%` }}
            />
          </div>
        </div>        {/* Controls */}
        <div className={styles.controls}>
          {!isListening ? (
            <button className={styles.startBtn} onClick={startListening}>
              <MicrophoneIcon size={16} /> Start Tuning
            </button>
          ) : (
            <button className={styles.stopBtn} onClick={stopListening}>
              <StopIcon size={16} /> Stop
            </button>
          )}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {/* Instructions */}
        <div className={styles.instructions}>
          <h4>How to use:</h4>
          <ol>
            <li>Click "Start Tuning" and allow microphone access</li>
            <li>Play an open string on your guitar</li>
            <li>Watch the needle - center means in tune!</li>
            <li>Green = perfect, Yellow = close, Red = needs adjustment</li>
          </ol>
          <p className={styles.tip}>
            <LightbulbIcon size={16} /> Tip: Tune in a quiet environment for best results
          </p>
        </div>
      </div>
    </div>
  )
}
