import React from 'react'
import { getChordData } from '../utils/chordLibrary'

// SVG chord diagram renderer using chord library
export default function ChordDiagram({ token, size = 120 }) {
  const chordData = getChordData(token)
    const strings = 6
  const numFrets = 4
  const nutHeight = 6
  const width = size
  const height = Math.round(size * 1.1)
  const margin = 14
  const topMargin = 8
  const stringSpacing = (width - margin * 2) / (strings - 1)
  const fretHeight = (height - topMargin - margin - nutHeight) / numFrets

  // Default to empty/unknown chord
  const frets = chordData?.frets || [-1, -1, -1, -1, -1, -1]
  const fingers = chordData?.fingers || [0, 0, 0, 0, 0, 0]
  const barres = chordData?.barres || []
  const baseFret = chordData?.baseFret || 1

  // Calculate display frets (normalized to diagram position)
  const displayFrets = frets.map(f => {
    if (f === -1 || f === 'x') return -1
    if (f === 0) return 0
    return f - baseFret + 1
  })

  // Find minimum fret for positioning
  const minFret = Math.min(...frets.filter(f => f > 0))
  const showNut = baseFret === 1

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block' }}
    >      {/* Background */}
      <rect x="0" y="0" width="100%" height="100%" fill="transparent" />

      {/* Fret position indicator (if not at nut) */}
      {!showNut && baseFret > 1 && (
        <text 
          x={margin - 10} 
          y={topMargin + nutHeight + fretHeight / 2 + 4} 
          textAnchor="middle" 
          fill="#888" 
          fontSize="10"
        >
          {baseFret}
        </text>
      )}

      {/* Nut or fret position line */}
      {showNut ? (
        <rect 
          x={margin} 
          y={topMargin} 
          width={width - margin * 2} 
          height={nutHeight} 
          fill="#ddd" 
          rx={2}
        />
      ) : (
        <line 
          x1={margin} 
          y1={topMargin + nutHeight / 2} 
          x2={width - margin} 
          y2={topMargin + nutHeight / 2} 
          stroke="#555" 
          strokeWidth={2}
        />
      )}

      {/* Frets */}
      {[...Array(numFrets)].map((_, f) => {
        const y = topMargin + nutHeight + (f + 1) * fretHeight
        return (
          <line 
            key={`fret-${f}`} 
            x1={margin} 
            y1={y} 
            x2={width - margin} 
            y2={y} 
            stroke="#444" 
            strokeWidth={1.5}
          />
        )
      })}

      {/* Strings */}
      {[...Array(strings)].map((_, i) => {
        const x = margin + i * stringSpacing
        return (
          <line 
            key={`string-${i}`} 
            x1={x} 
            y1={topMargin} 
            x2={x} 
            y2={height - margin} 
            stroke="#666" 
            strokeWidth={1}
          />
        )
      })}

      {/* Barres */}
      {barres.map((barre, idx) => {
        const barreDisplayFret = barre.fret - baseFret + 1
        if (barreDisplayFret < 1 || barreDisplayFret > numFrets) return null
        const y = topMargin + nutHeight + (barreDisplayFret - 0.5) * fretHeight
        const x1 = margin + barre.fromString * stringSpacing
        const x2 = margin + barre.toString * stringSpacing
        return (
          <rect
            key={`barre-${idx}`}
            x={Math.min(x1, x2) - 4}
            y={y - 6}
            width={Math.abs(x2 - x1) + 8}
            height={12}
            rx={6}
            fill="#fff"
          />
        )
      })}

      {/* Finger positions */}
      {displayFrets.map((fret, i) => {
        const x = margin + i * stringSpacing
        
        // Muted string
        if (fret === -1) {
          return (
            <text 
              key={`mute-${i}`} 
              x={x} 
              y={topMargin - 4} 
              textAnchor="middle" 
              fill="#888" 
              fontSize="12"
            >
              ✕
            </text>
          )
        }
        
        // Open string
        if (fret === 0) {
          return (
            <circle 
              key={`open-${i}`} 
              cx={x} 
              cy={topMargin - 6} 
              r={4} 
              fill="none" 
              stroke="#888" 
              strokeWidth={1.5}
            />
          )
        }
        
        // Fretted note (skip if part of barre and not the first string)
        const isInBarre = barres.some(b => {
          const bf = b.fret - baseFret + 1
          return bf === fret && i > b.fromString && i <= b.toString
        })
        if (isInBarre) return null
        
        const y = topMargin + nutHeight + (fret - 0.5) * fretHeight
        const finger = fingers[i]
        
        return (
          <g key={`fret-${i}`}>
            <circle cx={x} cy={y} r={7} fill="#fff" />
            {finger > 0 && (
              <text 
                x={x} 
                y={y + 4} 
                textAnchor="middle" 
                fill="#000" 
                fontSize="9" 
                fontWeight="600"
              >
                {finger}
              </text>
            )}
          </g>
        )
      })}

      {/* Unknown chord indicator */}
      {!chordData && (
        <text 
          x={width / 2} 
          y={height / 2 + 10} 
          textAnchor="middle" 
          fill="#666" 
          fontSize="10"
        >
          Unknown
        </text>
      )}
    </svg>
  )
}
