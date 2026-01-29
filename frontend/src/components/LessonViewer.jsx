import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import styles from './LessonViewer.module.css'
import ChordDiagram from './ChordDiagram'
import useMetronome from '../hooks/useMetronome'
import { apiFetch } from '../api'
import { PlayIcon, PauseIcon, ArrowLeftIcon, ArrowRightIcon } from './Icons'

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

// Render content with chords above lyrics - DAW aligned with bar-based grid
function renderContent(content, blocks, { timeSig, showGrid, compactMode, currentBar, currentBeat, lineRefs }) {
  const elements = []
  
  // Add count-in bar (bar 0) at the start
  elements.push(
    <div 
      key="count-in" 
      ref={el => lineRefs.current[-1] = el}
      className={`${styles.barLine} ${styles.countInBar} ${currentBar === -1 ? styles.activeBar : ''} ${compactMode ? styles.compactBar : ''}`}
    >
      {showGrid && (
        compactMode ? (
          <div className={styles.barNumber}>0</div>
        ) : (
          <div className={styles.beatGridWithBar}>
            <div className={styles.barNumberSmall}>0</div>
            <div className={styles.beatGrid}>
              {Array.from({ length: timeSig.beats }, (_, b) => (
                <div 
                  key={b} 
                  className={`${styles.beatCell} ${currentBar === -1 && b === currentBeat ? styles.activeBeat : ''}`}
                >
                  {b + 1}
                </div>
              ))}
            </div>
          </div>
        )
      )}
      <div className={styles.barContent}>
        <div className={styles.countInText}>Count in...</div>
      </div>
    </div>
  )
  
  // If blocks exist, render block-based content
  if (blocks && blocks.length > 0) {
    let barIndex = 0
    blocks.forEach((block, idx) => {
      if (block.type === 'lyrics') {
        const lines = (block.data || '').split('\n')
        lines.forEach((line, li) => {
          const thisBar = barIndex++
          elements.push(
            <div 
              key={`${idx}-${li}`} 
              ref={el => lineRefs.current[thisBar] = el}
              className={`${styles.barLine} ${thisBar === currentBar ? styles.activeBar : ''} ${compactMode ? styles.compactBar : ''}`}
            >
              {showGrid && (
                compactMode ? (
                  <div className={styles.barNumber}>{thisBar + 1}</div>
                ) : (
                  <div className={styles.beatGridWithBar}>
                    <div className={styles.barNumberSmall}>{thisBar + 1}</div>
                    <div className={styles.beatGrid}>
                      {Array.from({ length: timeSig.beats }, (_, b) => (
                        <div 
                          key={b} 
                          className={`${styles.beatCell} ${thisBar === currentBar && b === currentBeat ? styles.activeBeat : ''}`}
                        >
                          {b + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
              <div className={styles.barContent}>
                <pre className={styles.lyricsText}>{renderChordProLine(line)}</pre>
              </div>
            </div>
          )
        })
      } else if (block.type === 'tabs') {
        const thisBar = barIndex++
        elements.push(
          <div 
            key={idx} 
            ref={el => lineRefs.current[thisBar] = el}
            className={`${styles.barLine} ${thisBar === currentBar ? styles.activeBar : ''} ${compactMode ? styles.compactBar : ''}`}
          >
            {showGrid && (
              compactMode ? (
                <div className={styles.barNumber}>{thisBar + 1}</div>
              ) : (
                <div className={styles.beatGridWithBar}>
                  <div className={styles.barNumberSmall}>{thisBar + 1}</div>
                  <div className={styles.beatGrid}>
                    {Array.from({ length: timeSig.beats }, (_, b) => (
                      <div 
                        key={b} 
                        className={`${styles.beatCell} ${thisBar === currentBar && b === currentBeat ? styles.activeBeat : ''}`}
                      >
                        {b + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
            <div className={styles.barContent}>
              <pre className={styles.tabsText}>{renderTabs(block.data)}</pre>
            </div>
          </div>
        )
      }
    })
    return elements
  }
  // Fallback: render ChordPro content with beat alignment
  if (!content) return elements
  const lines = content.split('\n')
  let barIndex = 0
  
  lines.forEach((line, i) => {
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
        elements.push(<div key={i} className={styles.sectionHeader}>[{chords[0].chord}]</div>)
        return
      }
    }
    
    // Skip empty lines from bar counting
    if (!line.trim()) {
      elements.push(<div key={i} className={styles.emptyLine}>&nbsp;</div>)
      return
    }
    
    const thisBar = barIndex++

    elements.push(
      <div 
        key={i} 
        ref={el => lineRefs.current[thisBar] = el}
        className={`${styles.barLine} ${thisBar === currentBar ? styles.activeBar : ''} ${compactMode ? styles.compactBar : ''}`}
      >
        {showGrid && (
          compactMode ? (
            <div className={styles.barNumber}>{thisBar + 1}</div>
          ) : (
            <div className={styles.beatGridWithBar}>
              <div className={styles.barNumberSmall}>{thisBar + 1}</div>
              <div className={styles.beatGrid}>
                {Array.from({ length: timeSig.beats }, (_, b) => (
                  <div 
                    key={b} 
                    className={`${styles.beatCell} ${thisBar === currentBar && b === currentBeat ? styles.activeBeat : ''}`}
                  >
                    {b + 1}
                  </div>
                ))}
              </div>
            </div>
          )
        )}
        <div className={styles.barContent}>
          {chords.length > 0 && (
            <div className={styles.chordLine}>
              {chords.map((c, ci) => (
                <span key={ci} className={styles.chordToken}>{c.chord}</span>
              ))}
            </div>
          )}
          <div className={styles.lyricText}>{textLine || '\u00A0'}</div>
        </div>
      </div>
    )
  })
  
  return elements
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
  const [currentBar, setCurrentBar] = useState(-1) // Start at -1 for count-in bar (bar 0)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [showGrid, setShowGrid] = useState(true) // Show grid by default
  const [compactMode, setCompactMode] = useState(true) // Compact: just bar numbers
  
  const contentRef = useRef(null)
  const lineRefs = useRef([])

  const timeSig = parseTimeSignature(version?.timeSignature)
  const chords = extractChords(version?.content || '')
  
  // Count total lines/bars in content
  const totalBars = useMemo(() => {
    const content = version?.content || ''
    return content.split('\n').filter(l => l.trim()).length
  }, [version?.content])

  // Update BPM when version changes
  useEffect(() => {
    if (version?.bpm) setBpm(version.bpm)
  }, [version])
  // Reset beat/bar when autoscroll starts/stops
  useEffect(() => {
    if (!autoscroll) {
      setCurrentBeat(0)
      setCurrentBar(-1) // Reset to count-in bar
    }
  }, [autoscroll])

  // Metronome with bar-based beat tracking
  useMetronome(bpm, metronomeOn || autoscroll, useCallback(() => {
    setCurrentBeat(b => {
      const nextBeat = b + 1
      if (nextBeat >= timeSig.beats) {
        // Move to next bar
        setCurrentBar(bar => bar + 1)
        return 0
      }
      return nextBeat
    })
  }, [timeSig.beats]))

  // Scroll to current bar when it changes
  useEffect(() => {
    if (autoscroll && contentRef.current && lineRefs.current[currentBar]) {
      lineRefs.current[currentBar].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [currentBar, autoscroll])
  function jumpBars(delta) {
    setCurrentBar(b => Math.max(-1, Math.min(totalBars - 1, b + delta))) // -1 is count-in bar
    setCurrentBeat(0)
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
      </header>      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <button 
            className={`${styles.controlBtn} ${showGrid ? styles.active : ''}`}
            onClick={() => setShowGrid(!showGrid)}
          >
            Bars {showGrid ? 'ON' : 'OFF'}
          </button>
          {showGrid && (
            <button 
              className={`${styles.controlBtn} ${!compactMode ? styles.active : ''}`}
              onClick={() => setCompactMode(!compactMode)}
            >
              {compactMode ? 'Beats' : 'Compact'}
            </button>
          )}          <button 
            className={`${styles.controlBtn} ${metronomeOn ? styles.active : ''}`}
            onClick={() => setMetronomeOn(!metronomeOn)}
          >
            Metronome {metronomeOn ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
          </button>
          <button 
            className={`${styles.controlBtn} ${autoscroll ? styles.active : ''}`}
            onClick={() => setAutoscroll(!autoscroll)}
          >
            Autoscroll {autoscroll ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
          </button>
          <label className={styles.speedLabel}>
            Speed:
            <input
              type="range" 
              min={0.5} max={3} step={0.1} 
              value={scrollSpeed}
              onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
            />
          </label>        </div>        <div className={styles.controlGroup}>
          <button className={styles.controlBtn} onClick={() => jumpBars(-1)}>
            <ArrowLeftIcon size={14} /> Bar
          </button>
          <span className={styles.barIndicator}>
            Bar {currentBar === -1 ? '0 (count-in)' : currentBar + 1} / Beat {currentBeat + 1}
          </span>
          <button className={styles.controlBtn} onClick={() => jumpBars(1)}>
            Bar <ArrowRightIcon size={14} />
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
        </div>      )}      {/* Content with bar-based grid */}
      <div className={styles.contentWrapper}>
        <div ref={contentRef} className={styles.content}>
          <div className={styles.sheetContent}>
            {renderContent(version.content, version.blocks, { 
              timeSig, 
              showGrid,
              compactMode,
              currentBar, 
              currentBeat, 
              lineRefs 
            })}
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
