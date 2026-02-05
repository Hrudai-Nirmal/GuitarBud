import { useState, useEffect, useRef, useCallback } from 'react'
import { YIN } from 'pitchfinder'
import styles from './Tuner.module.css'
import { MicrophoneIcon, StopIcon, LightbulbIcon, EditIcon, SaveIcon, CloseIcon } from './Icons'
import { save, load } from '../utils/storage'

// All chromatic notes for selection
const ALL_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const OCTAVES = [1, 2, 3, 4, 5]

// Calculate frequency from note name and octave (A4 = 440Hz)
function noteToFreq(note, octave) {
  const noteIndex = ALL_NOTES.indexOf(note)
  if (noteIndex === -1) return 0
  // MIDI note number: C4 = 60, A4 = 69
  const midiNote = (octave + 1) * 12 + noteIndex
  return 440 * Math.pow(2, (midiNote - 69) / 12)
}

// Parse note string like "E2" to { note: 'E', octave: 2 }
function parseNote(noteStr) {
  const match = noteStr.match(/^([A-G]#?)(\d)$/)
  if (!match) return null
  return { note: match[1], octave: parseInt(match[2]) }
}

// Build tuning array from notes
function buildTuning(notes) {
  return notes.map((noteStr, idx) => {
    const parsed = parseNote(noteStr)
    if (!parsed) return null
    return {
      note: noteStr,
      freq: noteToFreq(parsed.note, parsed.octave),
      string: 6 - idx // String 6 is lowest (first in array)
    }
  }).filter(Boolean)
}

// Tuning presets
const TUNING_PRESETS = {
  'Standard': ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  'Drop D': ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
  'DADGAD': ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'],
  'Open G': ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'],
  'Open D': ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4'],
  'Open E': ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'],
  'Open A': ['E2', 'A2', 'E3', 'A3', 'C#4', 'E4'],
  'Open C': ['C2', 'G2', 'C3', 'G3', 'C4', 'E4'],
  'Drop C': ['C2', 'G2', 'C3', 'F3', 'A3', 'D4'],
  'Half Step Down': ['D#2', 'G#2', 'C#3', 'F#3', 'A#3', 'D#4'],
  'Full Step Down': ['D2', 'G2', 'C3', 'F3', 'A3', 'D4'],
  'Drop B': ['B1', 'F#2', 'B2', 'E3', 'G#3', 'C#4'],
  'Nashville': ['E3', 'A3', 'D4', 'G4', 'B3', 'E4'],
}

// Convert frequency to note info
function frequencyToNote(freq) {
  if (!freq || freq < 20 || freq > 2000) return null
  
  // Calculate semitones from A4 (440Hz)
  const semitones = 12 * Math.log2(freq / 440)
  const noteIndex = Math.round(semitones) + 69 // MIDI note number (A4 = 69)
  const cents = Math.round((semitones - Math.round(semitones)) * 100)
  
  const octave = Math.floor(noteIndex / 12) - 1
  const noteName = ALL_NOTES[((noteIndex % 12) + 12) % 12]
  
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

// Find closest guitar string from current tuning
function findClosestString(freq, tuning) {
  if (!freq || !tuning || tuning.length === 0) return null
  
  let closest = null
  let minDiff = Infinity
  
  for (const string of tuning) {
    const diff = Math.abs(freq - string.freq)
    if (diff < minDiff) {
      minDiff = diff
      closest = string
    }
  }
  
  // Only return if within a reasonable range (within ~26% / major 3rd)
  if (closest && minDiff < closest.freq * 0.26) {
    return closest
  }
  return null
}

export default function Tuner() {
  const [isListening, setIsListening] = useState(false)
  const [frequency, setFrequency] = useState(null)
  const [noteInfo, setNoteInfo] = useState(null)
  const [closestString, setClosestString] = useState(null)
  const [error, setError] = useState(null)
  const [volume, setVolume] = useState(0)
  
  // Tuning state
  const [selectedPreset, setSelectedPreset] = useState('Standard')
  const [customNotes, setCustomNotes] = useState(['E2', 'A2', 'D3', 'G3', 'B3', 'E4'])
  const [currentTuning, setCurrentTuning] = useState(buildTuning(['E2', 'A2', 'D3', 'G3', 'B3', 'E4']))
  const [showCustomEditor, setShowCustomEditor] = useState(false)
  const [savedCustomTunings, setSavedCustomTunings] = useState({})
  const [customTuningName, setCustomTuningName] = useState('')
  const [sensitivity, setSensitivity] = useState(3) // 1-5 scale, 3 = default
  
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)
  const animationRef = useRef(null)
  const bufferRef = useRef(null)
  const detectPitchRef = useRef(null)
  const gainNodeRef = useRef(null)

  // Load saved custom tunings on mount
  useEffect(() => {
    const saved = load('customTunings') || {}
    setSavedCustomTunings(saved)
  }, [])

  // Update tuning when preset changes
  useEffect(() => {
    if (selectedPreset === 'Custom') {
      setCurrentTuning(buildTuning(customNotes))
    } else if (TUNING_PRESETS[selectedPreset]) {
      const notes = TUNING_PRESETS[selectedPreset]
      setCustomNotes(notes)
      setCurrentTuning(buildTuning(notes))
    } else if (savedCustomTunings[selectedPreset]) {
      const notes = savedCustomTunings[selectedPreset]
      setCustomNotes(notes)
      setCurrentTuning(buildTuning(notes))
    }
  }, [selectedPreset, savedCustomTunings])

  // Update tuning when custom notes change (in custom mode)
  useEffect(() => {
    if (selectedPreset === 'Custom' || showCustomEditor) {
      setCurrentTuning(buildTuning(customNotes))
    }
  }, [customNotes, selectedPreset, showCustomEditor])
  const analyze = useCallback(() => {
    if (!analyserRef.current || !bufferRef.current || !detectPitchRef.current) return
    
    analyserRef.current.getFloatTimeDomainData(bufferRef.current)
    
    // Calculate volume (RMS) with sensitivity boost
    // Sensitivity: 1=low (x2), 2=medium-low (x4), 3=default (x8), 4=high (x16), 5=max (x32)
    const sensitivityMultiplier = Math.pow(2, sensitivity)
    let sum = 0
    for (let i = 0; i < bufferRef.current.length; i++) {
      sum += bufferRef.current[i] * bufferRef.current[i]
    }
    const rms = Math.sqrt(sum / bufferRef.current.length)
    setVolume(Math.min(rms * sensitivityMultiplier, 1))
    
    // Lower threshold for pitch detection - detect even quiet signals
    // RMS threshold: 0.001 for high sensitivity, 0.01 for low
    const rmsThreshold = 0.02 / sensitivity
    
    // Use pitchfinder YIN algorithm
    const freq = detectPitchRef.current(bufferRef.current)
    
    if (freq && freq > 50 && freq < 1000 && rms > rmsThreshold) {
      setFrequency(freq)
      const info = frequencyToNote(freq)
      setNoteInfo(info)
      setClosestString(findClosestString(freq, currentTuning))
    } else {
      setFrequency(null)
      setNoteInfo(null)
      setClosestString(null)
    }
    
    animationRef.current = requestAnimationFrame(analyze)
  }, [currentTuning, sensitivity])
  const startListening = useCallback(async () => {
    try {
      setError(null)
      
      // Request microphone access with settings optimized for instrument tuning
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          // Request high sensitivity settings
          channelCount: 1,
          sampleRate: 48000,
        } 
      })
      streamRef.current = stream
      
      // Create audio context with higher sample rate for better detection
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 48000
      })
      audioContextRef.current = audioContext
      
      // Create analyser with larger buffer for better low-frequency detection
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 4096
      analyser.smoothingTimeConstant = 0.1 // Less smoothing for faster response
      analyserRef.current = analyser
      
      // Create gain node for signal boost based on sensitivity
      const gainNode = audioContext.createGain()
      // Boost signal: sensitivity 1=1.5x, 2=2x, 3=3x, 4=5x, 5=8x
      const gainValues = [1.5, 2, 3, 5, 8]
      gainNode.gain.value = gainValues[sensitivity - 1] || 3
      gainNodeRef.current = gainNode
      
      // Create buffer
      bufferRef.current = new Float32Array(analyser.fftSize)
      
      // Initialize pitchfinder YIN detector with threshold for guitar
      detectPitchRef.current = YIN({ 
        sampleRate: audioContext.sampleRate,
        threshold: 0.1 // Lower threshold = more sensitive (default is 0.15)
      })
      
      // Connect: microphone -> gain -> analyser
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(gainNode)
      gainNode.connect(analyser)
      
      setIsListening(true)
      analyze()
      
    } catch (err) {
      console.error('Microphone error:', err)
      setError('Could not access microphone. Please allow microphone permissions.')
    }
  }, [analyze, sensitivity])

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

  // Update gain node when sensitivity changes while listening
  useEffect(() => {
    if (gainNodeRef.current && isListening) {
      const gainValues = [1.5, 2, 3, 5, 8]
      gainNodeRef.current.gain.value = gainValues[sensitivity - 1] || 3
    }
  }, [sensitivity, isListening])

  // Update custom note at index
  function updateCustomNote(index, note, octave) {
    const newNotes = [...customNotes]
    newNotes[index] = `${note}${octave}`
    setCustomNotes(newNotes)
  }

  // Save current custom tuning
  function saveCustomTuning() {
    if (!customTuningName.trim()) return
    const newSaved = { ...savedCustomTunings, [customTuningName]: customNotes }
    setSavedCustomTunings(newSaved)
    save('customTunings', newSaved)
    setSelectedPreset(customTuningName)
    setShowCustomEditor(false)
    setCustomTuningName('')
  }

  // Delete saved custom tuning
  function deleteCustomTuning(name) {
    const newSaved = { ...savedCustomTunings }
    delete newSaved[name]
    setSavedCustomTunings(newSaved)
    save('customTunings', newSaved)
    if (selectedPreset === name) {
      setSelectedPreset('Standard')
    }
  }

  // Calculate needle position (-50 to 50 degrees based on cents)
  const needleRotation = noteInfo ? Math.max(-50, Math.min(50, noteInfo.cents)) : 0
  
  // Tuning status
  const getTuningStatus = () => {
    if (!noteInfo) return { text: 'Play a note', color: '#666' }
    const cents = Math.abs(noteInfo.cents)
    if (cents <= 3) return { text: 'In Tune!', color: '#4ade80' }
    if (cents <= 10) return { text: 'Almost there', color: '#facc15' }
    if (noteInfo.cents < 0) return { text: 'Tune Up ↑', color: '#f87171' }
    return { text: 'Tune Down ↓', color: '#f87171' }
  }
  
  const status = getTuningStatus()

  // All preset names including saved custom ones
  const allPresets = [...Object.keys(TUNING_PRESETS), ...Object.keys(savedCustomTunings)]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Guitar Tuner</h2>
      </div>

      <div className={styles.tunerBody}>
        {/* Tuning selector */}
        <div className={styles.tuningSelector}>
          <label>Tuning:</label>
          <select 
            value={selectedPreset} 
            onChange={(e) => setSelectedPreset(e.target.value)}
            className={styles.tuningSelect}
          >
            {Object.keys(TUNING_PRESETS).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
            {Object.keys(savedCustomTunings).length > 0 && (
              <optgroup label="My Custom Tunings">
                {Object.keys(savedCustomTunings).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </optgroup>
            )}
          </select>
          <button 
            className={styles.customBtn}
            onClick={() => setShowCustomEditor(!showCustomEditor)}
            title="Create custom tuning"
          >
            <EditIcon size={16} />
          </button>
        </div>

        {/* Custom tuning editor */}
        {showCustomEditor && (
          <div className={styles.customEditor}>
            <h4>Custom Tuning</h4>
            <div className={styles.stringEditor}>
              {customNotes.map((noteStr, idx) => {
                const parsed = parseNote(noteStr)
                return (
                  <div key={idx} className={styles.stringRow}>
                    <span className={styles.stringLabel}>{6 - idx}</span>
                    <select 
                      value={parsed?.note || 'E'}
                      onChange={(e) => updateCustomNote(idx, e.target.value, parsed?.octave || 2)}
                    >
                      {ALL_NOTES.map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <select
                      value={parsed?.octave || 2}
                      onChange={(e) => updateCustomNote(idx, parsed?.note || 'E', parseInt(e.target.value))}
                    >
                      {OCTAVES.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                    <span className={styles.freqPreview}>
                      {buildTuning([noteStr])[0]?.freq.toFixed(1)} Hz
                    </span>
                  </div>
                )
              })}
            </div>
            <div className={styles.saveCustom}>
              <input
                type="text"
                placeholder="Tuning name..."
                value={customTuningName}
                onChange={(e) => setCustomTuningName(e.target.value)}
                className={styles.tuningNameInput}
              />
              <button 
                className={styles.saveBtn}
                onClick={saveCustomTuning}
                disabled={!customTuningName.trim()}
              >
                <SaveIcon size={14} /> Save
              </button>
              <button 
                className={styles.cancelBtn}
                onClick={() => {
                  setShowCustomEditor(false)
                  // Reset to current preset
                  if (TUNING_PRESETS[selectedPreset]) {
                    setCustomNotes(TUNING_PRESETS[selectedPreset])
                  }
                }}
              >
                <CloseIcon size={14} />
              </button>
            </div>
            {/* Show saved custom tunings for deletion */}
            {Object.keys(savedCustomTunings).length > 0 && (
              <div className={styles.savedList}>
                <h5>Saved Custom Tunings</h5>
                {Object.entries(savedCustomTunings).map(([name, notes]) => (
                  <div key={name} className={styles.savedItem}>
                    <span onClick={() => { setSelectedPreset(name); setShowCustomEditor(false) }}>
                      {name}: {notes.join(' ')}
                    </span>
                    <button onClick={() => deleteCustomTuning(name)} className={styles.deleteBtn}>
                      <CloseIcon size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* String indicators */}
        <div className={styles.strings}>
          {currentTuning.map((s) => (
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
        </div>        {/* Volume meter */}
        <div className={styles.volumeMeter}>
          <div className={styles.volumeLabel}>Input Level</div>
          <div className={styles.volumeBar}>
            <div 
              className={styles.volumeFill} 
              style={{ width: `${volume * 100}%` }}
            />
          </div>
        </div>

        {/* Sensitivity control */}
        <div className={styles.sensitivityControl}>
          <div className={styles.sensitivityLabel}>
            Mic Sensitivity: <span className={styles.sensitivityValue}>{['Low', 'Med-Low', 'Medium', 'High', 'Max'][sensitivity - 1]}</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={sensitivity}
            onChange={(e) => setSensitivity(Number(e.target.value))}
            className={styles.sensitivitySlider}
          />
          <div className={styles.sensitivityHint}>
            {sensitivity >= 4 ? '🎸 Great for acoustic guitars' : sensitivity <= 2 ? '🔌 Better for loud/amplified' : '⚖️ Balanced for most setups'}
          </div>
        </div>

        {/* Controls */}
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
            <li>Select your tuning from the dropdown or create a custom one</li>
            <li>Click "Start Tuning" and allow microphone access</li>
            <li>Play an open string on your guitar</li>
            <li>Watch the needle - center means in tune!</li>
          </ol>
          <p className={styles.tip}>
            <LightbulbIcon size={16} /> Tip: Tune in a quiet environment for best results
          </p>
        </div>
      </div>
    </div>
  )
}
