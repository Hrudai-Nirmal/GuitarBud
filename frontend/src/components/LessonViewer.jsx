import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import styles from './LessonViewer.module.css'
import ChordDiagram from './ChordDiagram'
import useMetronome from '../hooks/useMetronome'
import { apiFetch } from '../api'

// Extract chords from content (ChordPro format [Chord])
function extractChords(content) {
  const matches = content?.match(/\[([^\]]+)\]/g) || []
  const unique = [...new Set(matches.map(m => m.slice(1, -1)))]
  return unique
}

// Parse time signature like "4/4" -> { beats: 4, noteValue: 4 }
function parseTimeSignature(ts) {
  const parts = (ts || '4/4').split('/')
  return { beats: parseInt(parts[0]) || 4, noteValue: parseInt(parts[1]) || 4 }
}

// Render content with chords above lyrics - DAW aligned
function renderContent(content, blocks) {
  // If blocks exist, render block-based content
  if (blocks && blocks.length > 0) {
    return blocks.map((block, idx) => {
      if (block.type === 'lyrics') {
        return (
          <div key={idx} className={styles.lyricsBlock}>
            <pre className={styles.lyricsText}>{renderChordProLine(block.data)}</pre>
          </div>
        )
      } else if (block.type === 'tabs') {
        return (
          <div key={idx} className={styles.tabsBlock}>
            <pre className={styles.tabsText}>{renderTabs(block.data)}</pre>
          </div>
        )
      }
      return null
    })
  }

  // Fallback: render ChordPro content with beat alignment
  if (!content) return null
  const lines = content.split('\n')
  return lines.map((line, i) => {
    // Extract chords and positions
    const chordRegex = /\[([^\]]+)\]/g
    let match
    const chords = []
    while ((match = chordRegex.exec(line)) !== null) {
      chords.push({ chord: match[1], index: match.index })
    }
    const textLine = line.replace(/\[([^\]]+)\]/g, '')
    
    // Check if this is a section header (like [Verse], [Chorus], etc)
    if (chords.length === 1 && textLine.trim() === '') {
      const sectionKeywords = ['intro', 'verse', 'chorus', 'bridge', 'outro', 'pre-chorus', 'interlude', 'solo', 'tab', 'riff']
      const isSection = sectionKeywords.some(k => chords[0].chord.toLowerCase().includes(k))
      if (isSection) {
        return <div key={i} className={styles.lyricLine} style={{ color: '#888', fontWeight: 600, marginTop: '16px' }}>[{chords[0].chord}]</div>
      }
    }
    
    if (chords.length === 0) {
      return <div key={i} className={styles.lyricLine}>{textLine || '\u00A0'}</div>
    }

    // Render chords with fixed-width spans for DAW grid alignment
    return (
      <div key={i} className={styles.lyricLine}>
        <div className={styles.chordLine}>
          {chords.map((c, ci) => (
            <span key={ci} className={styles.chordToken}>{c.chord}</span>
          ))}
        </div>
        <div>{textLine || '\u00A0'}</div>
      </div>
    )
  })
}

// Render ChordPro formatted line with chord tokens
function renderChordProLine(text) {
  if (!text) return null
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\[[^\]]+\])/)
    return (
      <span key={i}>
        {parts.map((part, pi) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            return <span key={pi} className={styles.chordToken}>{part.slice(1, -1)}</span>
          }
          return part
        })}
        {'\n'}
      </span>
    )
  })
}

// Render tabs from structured data or string
function renderTabs(data) {
  if (typeof data === 'string') return data
  if (Array.isArray(data)) {
    // Expect 6 strings for guitar
    return data.join('\n')
  }
  return JSON.stringify(data)
}

export default function LessonViewer({ song, version, allVersions, onSelectVersion, token }) {
  const [bpm, setBpm] = useState(version?.bpm || 120)
  const [metronomeOn, setMetronomeOn] = useState(false)
  const [autoscroll, setAutoscroll] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState(1)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [showGrid, setShowGrid] = useState(false)
  
  const contentRef = useRef(null)
  const scrollIntervalRef = useRef(null)

  const timeSig = parseTimeSignature(version?.timeSignature)
  const chords = extractChords(version?.content || '')
  
  // Calculate number of beats to show based on content length
  const totalBeats = useMemo(() => {
    const content = version?.content || ''
    // Rough estimate: ~4 beats per line
    const lines = content.split('\n').length
    return Math.max(32, lines * 4)
  }, [version?.content])

  // Update BPM when version changes
  useEffect(() => {
    if (version?.bpm) setBpm(version.bpm)
  }, [version])

  // Metronome
  useMetronome(bpm, metronomeOn, useCallback(() => {
    setCurrentBeat(b => b + 1)
  }, []))

  // Autoscroll
  useEffect(() => {
    if (autoscroll && contentRef.current) {
      const pxPerBeat = scrollSpeed * 2 // pixels per beat
      const msPerBeat = (60 / bpm) * 1000
      scrollIntervalRef.current = setInterval(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop += pxPerBeat
        }
      }, msPerBeat)
    }
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current)
    }
  }, [autoscroll, bpm, scrollSpeed])

  function jumpBeats(delta) {
    if (!contentRef.current) return
    const pxPerBeat = scrollSpeed * 2
    contentRef.current.scrollTop += delta * pxPerBeat
    setCurrentBeat(b => Math.max(0, b + delta))
  }

  // YouTube embed
  function getYouTubeId(url) {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    return match ? match[1] : null
  }

  const youtubeId = getYouTubeId(version?.youtubeUrl)

  // Rating display
  function renderRating(rating) {
    const r = parseFloat(rating) || 0
    return (
      <span className={styles.rating}>
        <span className={styles.star}>★</span>
        <span>{r.toFixed(2)}</span>
      </span>
    )
  }

  if (!version) return null

  return (
    <div className={styles.viewer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.songTitle}>{song?.title || 'Untitled'}</h1>
          <h2 className={styles.artistName}>{song?.artist || 'Unknown Artist'}</h2>
        </div>
        <div className={styles.meta}>
          <span className={styles.metaItem}>Key: <strong>{version.key || 'C'}</strong></span>
          <span className={styles.metaItem}>
            BPM: <input 
              type="number" 
              className={styles.bpmInput}
              value={bpm} 
              onChange={(e) => setBpm(Number(e.target.value) || 120)}
              min={40} max={240}
            />
          </span>
          {version.capo > 0 && (
            <span className={styles.metaItem}>Capo: <strong>{version.capo}</strong></span>
          )}
          <span className={styles.metaItem}>Time: <strong>{version.timeSignature || '4/4'}</strong></span>
        </div>
      </header>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <button 
            className={`${styles.controlBtn} ${showGrid ? styles.active : ''}`}
            onClick={() => setShowGrid(!showGrid)}
          >
            Grid {showGrid ? 'ON' : 'OFF'}
          </button>
          <button 
            className={`${styles.controlBtn} ${metronomeOn ? styles.active : ''}`}
            onClick={() => setMetronomeOn(!metronomeOn)}
          >
            Metronome {metronomeOn ? '⏸' : '▶'}
          </button>
          <button 
            className={`${styles.controlBtn} ${autoscroll ? styles.active : ''}`}
            onClick={() => setAutoscroll(!autoscroll)}
          >
            Autoscroll {autoscroll ? '⏸' : '▶'}
          </button>
          <label className={styles.speedLabel}>
            Speed:
            <input 
              type="range" 
              min={0.5} max={3} step={0.1} 
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
            />
          </label>
        </div>
        <div className={styles.controlGroup}>
          <button className={styles.controlBtn} onClick={() => jumpBeats(-timeSig.beats)}>
            ◀ {timeSig.beats} beats
          </button>
          <button className={styles.controlBtn} onClick={() => jumpBeats(timeSig.beats)}>
            {timeSig.beats} beats ▶
          </button>
        </div>
      </div>

      {/* Media row */}
      <div className={styles.mediaRow}>
        {version.backingTrackUrl && (
          <div className={styles.audioPlayer}>
            <span>Backing Track:</span>
            <audio controls src={version.backingTrackUrl} />
          </div>
        )}
        {youtubeId && (
          <div className={styles.videoEmbed}>
            <iframe
              width="320"
              height="180"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title="YouTube video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* Chord strip */}
      {chords.length > 0 && (
        <div className={styles.chordStrip}>
          {chords.map((chord, i) => (
            <div key={i} className={styles.chordCard}>
              <ChordDiagram token={chord} size={80} />
              <span className={styles.chordName}>{chord}</span>
            </div>
          ))}
        </div>
      )}      {/* Content with DAW-style grid */}
      <div className={styles.contentWrapper}>
        {/* Beat header - shows beat numbers */}
        {showGrid && (
          <div className={styles.beatHeader}>
            {Array.from({ length: totalBeats }, (_, i) => (
              <div 
                key={i} 
                className={`${styles.beatMarker} ${(i % timeSig.beats === 0) ? styles.major : ''}`}
              >
                {(i % timeSig.beats === 0) ? `${Math.floor(i / timeSig.beats) + 1}` : (i % timeSig.beats) + 1}
              </div>
            ))}
          </div>
        )}
        
        <div ref={contentRef} className={styles.content}>
          <div className={styles.contentInner}>
            {/* Beat grid - vertical lines */}
            {showGrid && (
              <div className={styles.beatGrid}>
                {Array.from({ length: totalBeats }, (_, i) => (
                  <div 
                    key={i} 
                    className={`${styles.beatLine} ${(i % timeSig.beats === 0) ? styles.major : ''} ${i === currentBeat ? styles.current : ''}`}
                  />
                ))}
              </div>
            )}
            
            {/* Sheet content */}
            <div className={styles.sheetContent}>
              {renderContent(version.content, version.blocks)}
            </div>
          </div>
        </div>
      </div>

      {/* Other versions */}
      {allVersions && allVersions.length > 1 && (
        <div className={styles.otherVersions}>
          <h3>Other Versions</h3>
          <div className={styles.versionList}>
            {allVersions
              .filter(v => v._id !== version._id)
              .map(v => (
                <button
                  key={v._id}
                  className={styles.versionItem}
                  onClick={() => onSelectVersion(v)}
                >
                  <span className={styles.versionTeacher}>{v.teacherName}</span>
                  {renderRating(v.rating)}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
