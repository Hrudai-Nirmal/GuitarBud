import React, { useState, useMemo, useEffect, useCallback } from 'react'
import styles from './ScaleCharts.module.css'
import { SCALE_PATTERNS, SCALE_CATEGORIES, getScaleInKey, getAllScaleNames } from '../utils/scaleLibrary'

const ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'e']

// Scale diagram component - renders a fretboard with scale notes
function ScaleDiagram({ pattern, rootFret, size = 200, title }) {
  const fretCount = 5 // Show 5 frets at a time
  const startFret = Math.max(0, rootFret - 1)
  const width = size
  const height = size * 0.8
  const padding = 20
  const fretWidth = (width - padding * 2) / fretCount
  const stringSpacing = (height - padding * 2) / 5

  // Flatten all frets to find which ones to display
  const allFrets = pattern.flat()
  const minFret = Math.min(...allFrets.filter(f => f >= 0))
  const maxFret = Math.max(...allFrets)
  const displayStart = Math.max(0, minFret - 1)
  
  return (
    <svg width={width} height={height + 30} viewBox={`0 0 ${width} ${height + 30}`}>
      {/* Title */}
      <text x={width / 2} y={15} textAnchor="middle" className={styles.diagramTitle}>
        {title}
      </text>
      
      {/* Fret numbers */}
      {Array.from({ length: fretCount + 1 }, (_, i) => (
        <text
          key={`fret-${i}`}
          x={padding + i * fretWidth}
          y={height + 15}
          textAnchor="middle"
          className={styles.fretNumber}
        >
          {displayStart + i}
        </text>
      ))}

      {/* Nut (if starting at fret 0) */}
      {displayStart === 0 && (
        <rect
          x={padding - 2}
          y={padding + 15}
          width={4}
          height={stringSpacing * 5}
          fill="#fff"
        />
      )}

      {/* Frets */}
      {Array.from({ length: fretCount + 1 }, (_, i) => (
        <line
          key={`fret-line-${i}`}
          x1={padding + i * fretWidth}
          y1={padding + 15}
          x2={padding + i * fretWidth}
          y2={height - padding + 15}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={i === 0 && displayStart === 0 ? 3 : 1}
        />
      ))}

      {/* Strings */}
      {Array.from({ length: 6 }, (_, i) => (
        <g key={`string-${i}`}>
          <line
            x1={padding}
            y1={padding + 15 + i * stringSpacing}
            x2={width - padding}
            y2={padding + 15 + i * stringSpacing}
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={1 + (5 - i) * 0.3}
          />
          <text
            x={8}
            y={padding + 19 + i * stringSpacing}
            className={styles.stringName}
          >
            {STRING_NAMES[i]}
          </text>
        </g>
      ))}

      {/* Scale notes */}
      {pattern.map((stringFrets, stringIndex) =>
        stringFrets.map((fret, noteIndex) => {
          if (fret < displayStart || fret > displayStart + fretCount) return null
          const x = padding + (fret - displayStart) * fretWidth - fretWidth / 2
          const y = padding + 15 + stringIndex * stringSpacing
          const isRoot = fret === rootFret && (stringIndex === 0 || stringIndex === 5)
          
          return (
            <g key={`note-${stringIndex}-${noteIndex}`}>
              <circle
                cx={x}
                cy={y}
                r={8}
                fill={isRoot ? '#f97316' : '#6366f1'}
                stroke={isRoot ? '#fbbf24' : '#818cf8'}
                strokeWidth={2}
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                className={styles.noteText}
              >
                {fret}
              </text>
            </g>
          )
        })
      )}

      {/* Fret markers */}
      {[3, 5, 7, 9, 12, 15, 17, 19, 21].map(markerFret => {
        if (markerFret < displayStart || markerFret > displayStart + fretCount) return null
        const x = padding + (markerFret - displayStart) * fretWidth - fretWidth / 2
        const isDouble = markerFret === 12
        
        return (
          <g key={`marker-${markerFret}`}>
            {isDouble ? (
              <>
                <circle cx={x} cy={padding + 15 + stringSpacing * 1.5} r={3} fill="rgba(255,255,255,0.15)" />
                <circle cx={x} cy={padding + 15 + stringSpacing * 3.5} r={3} fill="rgba(255,255,255,0.15)" />
              </>
            ) : (
              <circle cx={x} cy={padding + 15 + stringSpacing * 2.5} r={3} fill="rgba(255,255,255,0.15)" />
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function ScaleCharts() {
  const [selectedRoot, setSelectedRoot] = useState('A')
  const [selectedScale, setSelectedScale] = useState('Minor Pentatonic')
  const [selectedCategory, setSelectedCategory] = useState('Pentatonic')
  const [zoomedPosition, setZoomedPosition] = useState(null)

  // Close zoomed scale on Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setZoomedPosition(null)
  }, [])

  useEffect(() => {
    if (zoomedPosition) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [zoomedPosition, handleKeyDown])

  const scaleData = useMemo(() => {
    return getScaleInKey(selectedScale, selectedRoot)
  }, [selectedScale, selectedRoot])

  const scalesInCategory = SCALE_CATEGORIES[selectedCategory] || []

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>🎼 Scale Charts</h1>
        <p className={styles.subtitle}>Learn scale patterns across the fretboard</p>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label>Root Note</label>
          <div className={styles.rootPicker}>
            {ROOTS.map(root => (
              <button
                key={root}
                className={`${styles.rootBtn} ${selectedRoot === root ? styles.active : ''}`}
                onClick={() => setSelectedRoot(root)}
              >
                {root}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.controlGroup}>
          <label>Category</label>
          <div className={styles.categoryPicker}>
            {Object.keys(SCALE_CATEGORIES).map(cat => (
              <button
                key={cat}
                className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.active : ''}`}
                onClick={() => {
                  setSelectedCategory(cat)
                  setSelectedScale(SCALE_CATEGORIES[cat][0])
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.controlGroup}>
          <label>Scale</label>
          <div className={styles.scalePicker}>
            {scalesInCategory.map(scale => (
              <button
                key={scale}
                className={`${styles.scaleBtn} ${selectedScale === scale ? styles.active : ''}`}
                onClick={() => setSelectedScale(scale)}
              >
                {scale}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scale Info */}
      {scaleData && (
        <div className={styles.scaleInfo}>
          <h2 className={styles.scaleName}>{scaleData.name}</h2>
          <div className={styles.intervals}>
            <span className={styles.intervalLabel}>Intervals:</span>
            {scaleData.intervals.map((interval, i) => (
              <span key={i} className={styles.interval}>
                {['R', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'][interval]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Scale Positions */}
      <div className={styles.positionsGrid}>
        {scaleData?.positions.map((position, index) => (
          <div 
            key={index} 
            className={styles.positionCard}
            onClick={() => setZoomedPosition({ position, scaleName: scaleData.name })}
          >
            <h3 className={styles.positionName}>{position.name}</h3>
            <ScaleDiagram
              pattern={position.actualFrets}
              rootFret={position.rootFret}
              size={280}
              title={`Frets ${position.rootFret}-${position.rootFret + 4}`}
            />
            <div className={styles.positionInfo}>
              <span>Root on string {position.rootString}</span>
              <span>Start at fret {position.rootFret}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Reference */}
      <div className={styles.quickRef}>
        <h3>Quick Reference</h3>
        <div className={styles.quickRefGrid}>
          <div className={styles.refItem}>
            <span className={styles.refDot} style={{ background: '#f97316' }}></span>
            <span>Root notes</span>
          </div>
          <div className={styles.refItem}>
            <span className={styles.refDot} style={{ background: '#6366f1' }}></span>
            <span>Scale notes</span>
          </div>
        </div>
        <p className={styles.tip}>
          💡 Tip: These patterns are moveable. Shift them up or down the neck to play in different keys.
        </p>
      </div>

      {/* Zoomed scale modal */}
      {zoomedPosition && (
        <div className={styles.zoomOverlay} onClick={() => setZoomedPosition(null)}>
          <div className={styles.zoomModal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.zoomTitle}>{zoomedPosition.scaleName}</h2>
            <h3 className={styles.zoomSubtitle}>{zoomedPosition.position.name}</h3>
            <ScaleDiagram
              pattern={zoomedPosition.position.actualFrets}
              rootFret={zoomedPosition.position.rootFret}
              size={450}
              title={`Frets ${zoomedPosition.position.rootFret}-${zoomedPosition.position.rootFret + 4}`}
            />
            <div className={styles.zoomInfo}>
              <span>Root on string {zoomedPosition.position.rootString}</span>
              <span>Start at fret {zoomedPosition.position.rootFret}</span>
            </div>
            <p className={styles.zoomHint}>Click outside or press Esc to close</p>
          </div>
        </div>
      )}
    </div>
  )
}
