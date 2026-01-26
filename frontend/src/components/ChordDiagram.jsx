import React from 'react'

// Minimal SVG chord diagram renderer for major/minor triads based on root and shape
// Input: token like 'C', 'Am', 'G7'

function getFretsFor(token) {
  // Very naive placeholder: map root to basic open chord shapes for a few chords
  const map = {
    C: ['x',3,2,0,1,0],
    G: [3,2,0,0,0,3],
    D: ['x','x',0,2,3,2],
    Em: [0,2,2,0,0,0],
    Am: ['x',0,2,2,1,0]
  }
  const root = token.replace(/m|7|maj|sus|add.*/,'')
  return map[root] || ['x',0,0,0,0,0]
}

export default function ChordDiagram({ token, size = 120 }) {
  const frets = getFretsFor(token)
  const strings = 6
  const nutHeight = 6
  const width = size
  const height = Math.round(size * 1.3)
  const margin = 10
  const fretHeight = (height - margin*2 - nutHeight) / 4

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <rect x="0" y="0" width="100%" height="100%" fill="transparent" />
      {/* nut */}
      <rect x={margin} y={margin} width={width - margin*2} height={nutHeight} fill="#222" />
      {/* strings and frets */}
      {[...Array(strings)].map((_, i) => {
        const x = margin + (i * (width - margin*2) / (strings-1))
        return <line key={i} x1={x} y1={margin} x2={x} y2={height - margin} stroke="#666" strokeWidth={1} />
      })}
      {[...Array(4)].map((_, f) => {
        const y = margin + nutHeight + f * fretHeight + fretHeight/2
        return <line key={f} x1={margin} y1={y} x2={width - margin} y2={y} stroke="#444" strokeWidth={2} />
      })}
      {/* dots for frets */}
      {frets.map((fr, i) => {
        const x = margin + (i * (width - margin*2) / (strings-1))
        if (fr === 'x') return <text key={i} x={x-6} y={margin-2} fill="#fff">x</text>
        if (fr === 0) return <text key={i} x={x-6} y={margin-2} fill="#fff">o</text>
        const fretIndex = Math.max(0, Math.min(3, fr-1))
        const y = margin + nutHeight + fretIndex * fretHeight + fretHeight/2
        return <circle key={i} cx={x} cy={y} r={6} fill="#fff" />
      })}
    </svg>
  )
}
