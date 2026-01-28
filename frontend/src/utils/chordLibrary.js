// Comprehensive chord diagram library
// Format: [E, A, D, G, B, e] where:
//   -1 or 'x' = muted string
//   0 = open string
//   1-24 = fret number
// barres: [{ fret, fromString, toString }]
// fingers: [6 elements, 0=none, 1-4=finger number, 'T'=thumb]

const CHORD_LIBRARY = {
  // ========== A chords ==========
  'A': { frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], barres: [] },
  'Am': { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], barres: [] },
  'A7': { frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 1, 0, 2, 0], barres: [] },
  'Am7': { frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0], barres: [] },
  'Amaj7': { frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0], barres: [] },
  'Asus2': { frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0], barres: [] },
  'Asus4': { frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0], barres: [] },
  'Adim': { frets: [-1, 0, 1, 2, 1, -1], fingers: [0, 0, 1, 3, 2, 0], barres: [] },
  'Aaug': { frets: [-1, 0, 3, 2, 2, 1], fingers: [0, 0, 4, 2, 3, 1], barres: [] },
  'A5': { frets: [-1, 0, 2, 2, -1, -1], fingers: [0, 0, 1, 1, 0, 0], barres: [{ fret: 2, fromString: 3, toString: 4 }] },
  'A6': { frets: [-1, 0, 2, 2, 2, 2], fingers: [0, 0, 1, 1, 1, 1], barres: [{ fret: 2, fromString: 3, toString: 6 }] },
  'A9': { frets: [-1, 0, 2, 4, 2, 3], fingers: [0, 0, 1, 3, 1, 2], barres: [] },
  // ========== A#/Bb chords ==========
  'A#': { frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 1, fromString: 1, toString: 5 }], baseFret: 1 },
  'Bb': { frets: [-1, 1, 3, 3, 3, 1], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 1, fromString: 1, toString: 5 }], baseFret: 1 },
  'A#m': { frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 1, fromString: 1, toString: 5 }], baseFret: 1 },
  'Bbm': { frets: [-1, 1, 3, 3, 2, 1], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 1, fromString: 1, toString: 5 }], baseFret: 1 },
  'A#7': { frets: [-1, 1, 3, 1, 3, 1], fingers: [0, 1, 3, 1, 4, 1], barres: [{ fret: 1, fromString: 1, toString: 5 }], baseFret: 1 },
  'Bb7': { frets: [-1, 1, 3, 1, 3, 1], fingers: [0, 1, 3, 1, 4, 1], barres: [{ fret: 1, fromString: 1, toString: 5 }], baseFret: 1 },
  'A#m7': { frets: [-1, 1, 3, 1, 2, 1], fingers: [0, 1, 3, 1, 2, 1], barres: [{ fret: 1, fromString: 1, toString: 5 }], baseFret: 1 },
  'Bbm7': { frets: [-1, 1, 3, 1, 2, 1], fingers: [0, 1, 3, 1, 2, 1], barres: [{ fret: 1, fromString: 1, toString: 5 }], baseFret: 1 },
  'A#maj7': { frets: [-1, 1, 3, 2, 3, 1], fingers: [0, 1, 3, 2, 4, 1], barres: [{ fret: 1, fromString: 1, toString: 5 }], baseFret: 1 },
  'Bbmaj7': { frets: [-1, 1, 3, 2, 3, 1], fingers: [0, 1, 3, 2, 4, 1], barres: [{ fret: 1, fromString: 1, toString: 5 }], baseFret: 1 },
  'A#sus4': { frets: [-1, 1, 3, 3, 4, 1], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 1, fromString: 1, toString: 5 }], baseFret: 1 },
  'Bbsus4': { frets: [-1, 1, 3, 3, 4, 1], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 1, fromString: 1, toString: 5 }], baseFret: 1 },
  'A#5': { frets: [-1, 1, 3, 3, -1, -1], fingers: [0, 1, 3, 4, 0, 0], baseFret: 1 },
  'Bb5': { frets: [-1, 1, 3, 3, -1, -1], fingers: [0, 1, 3, 4, 0, 0], baseFret: 1 },
  // ========== B chords ==========
  'B': { frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 2, fromString: 1, toString: 5 }], baseFret: 2 },
  'Bm': { frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 2, fromString: 1, toString: 5 }], baseFret: 2 },
  'B7': { frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4], barres: [] },
  'Bm7': { frets: [-1, 2, 0, 2, 0, 2], fingers: [0, 1, 0, 2, 0, 3], barres: [] },
  'Bmaj7': { frets: [-1, 2, 4, 3, 4, 2], fingers: [0, 1, 3, 2, 4, 1], barres: [{ fret: 2, fromString: 1, toString: 5 }], baseFret: 2 },
  'Bsus4': { frets: [-1, 2, 4, 4, 5, 2], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 2, fromString: 1, toString: 5 }], baseFret: 2 },
  'Bsus2': { frets: [-1, 2, 4, 4, 2, 2], fingers: [0, 1, 3, 4, 1, 1], barres: [{ fret: 2, fromString: 1, toString: 5 }], baseFret: 2 },
  'Badd9': { frets: [-1, 2, 4, 4, 2, 2], fingers: [0, 1, 3, 4, 1, 1], barres: [{ fret: 2, fromString: 1, toString: 5 }], baseFret: 2 },
  'B5': { frets: [-1, 2, 4, 4, -1, -1], fingers: [0, 1, 3, 4, 0, 0], baseFret: 2 },
  'B6': { frets: [-1, 2, 4, 4, 4, 4], fingers: [0, 1, 2, 3, 3, 3], barres: [{ fret: 4, fromString: 3, toString: 6 }], baseFret: 2 },
  'Bdim': { frets: [-1, 2, 3, 4, 3, -1], fingers: [0, 1, 2, 4, 3, 0], barres: [] },
  'Baug': { frets: [-1, 2, 5, 4, 4, 3], fingers: [0, 1, 4, 2, 3, 1], baseFret: 2 },

  // ========== C chords ==========
  'C': { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], barres: [] },
  'Cm': { frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 3, fromString: 1, toString: 5 }], baseFret: 3 },
  'C7': { frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0], barres: [] },
  'Cm7': { frets: [-1, 3, 5, 3, 4, 3], fingers: [0, 1, 3, 1, 2, 1], barres: [{ fret: 3, fromString: 1, toString: 5 }], baseFret: 3 },
  'Cmaj7': { frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0], barres: [] },
  'Cadd9': { frets: [-1, 3, 2, 0, 3, 0], fingers: [0, 2, 1, 0, 3, 0], barres: [] },
  'Csus2': { frets: [-1, 3, 0, 0, 1, 3], fingers: [0, 2, 0, 0, 1, 3], barres: [] },
  'Csus4': { frets: [-1, 3, 3, 0, 1, 1], fingers: [0, 3, 4, 0, 1, 1], barres: [] },
  'C5': { frets: [-1, 3, 5, 5, -1, -1], fingers: [0, 1, 3, 4, 0, 0], baseFret: 3 },
  'C6': { frets: [-1, 3, 2, 2, 1, 0], fingers: [0, 4, 2, 3, 1, 0], barres: [] },
  'C9': { frets: [-1, 3, 2, 3, 3, 0], fingers: [0, 2, 1, 3, 4, 0], barres: [] },
  // ========== C#/Db chords ==========
  'C#': { frets: [-1, 4, 6, 6, 6, 4], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 4, fromString: 1, toString: 5 }], baseFret: 4 },
  'Db': { frets: [-1, 4, 6, 6, 6, 4], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 4, fromString: 1, toString: 5 }], baseFret: 4 },
  'C#m': { frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 4, fromString: 1, toString: 5 }], baseFret: 4 },
  'Dbm': { frets: [-1, 4, 6, 6, 5, 4], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 4, fromString: 1, toString: 5 }], baseFret: 4 },
  'C#7': { frets: [-1, 4, 6, 4, 6, 4], fingers: [0, 1, 3, 1, 4, 1], barres: [{ fret: 4, fromString: 1, toString: 5 }], baseFret: 4 },
  'Db7': { frets: [-1, 4, 6, 4, 6, 4], fingers: [0, 1, 3, 1, 4, 1], barres: [{ fret: 4, fromString: 1, toString: 5 }], baseFret: 4 },
  'C#m7': { frets: [-1, 4, 6, 4, 5, 4], fingers: [0, 1, 3, 1, 2, 1], barres: [{ fret: 4, fromString: 1, toString: 5 }], baseFret: 4 },
  'Dbm7': { frets: [-1, 4, 6, 4, 5, 4], fingers: [0, 1, 3, 1, 2, 1], barres: [{ fret: 4, fromString: 1, toString: 5 }], baseFret: 4 },
  'C#maj7': { frets: [-1, 4, 6, 5, 6, 4], fingers: [0, 1, 3, 2, 4, 1], barres: [{ fret: 4, fromString: 1, toString: 5 }], baseFret: 4 },
  'Dbmaj7': { frets: [-1, 4, 6, 5, 6, 4], fingers: [0, 1, 3, 2, 4, 1], barres: [{ fret: 4, fromString: 1, toString: 5 }], baseFret: 4 },
  'C#5': { frets: [-1, 4, 6, 6, -1, -1], fingers: [0, 1, 3, 4, 0, 0], baseFret: 4 },
  'Db5': { frets: [-1, 4, 6, 6, -1, -1], fingers: [0, 1, 3, 4, 0, 0], baseFret: 4 },
  // ========== D chords ==========
  'D': { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], barres: [] },
  'Dm': { frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], barres: [] },
  'D7': { frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], barres: [] },
  'Dm7': { frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1], barres: [] },
  'Dmaj7': { frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 1, 1], barres: [{ fret: 2, fromString: 4, toString: 6 }] },
  'Dsus2': { frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0], barres: [] },
  'Dsus4': { frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 3], barres: [] },
  'Dadd9': { frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 2, 0], barres: [] },
  'D5': { frets: [-1, -1, 0, 2, 3, -1], fingers: [0, 0, 0, 1, 2, 0], barres: [] },
  'D6': { frets: [-1, -1, 0, 2, 0, 2], fingers: [0, 0, 0, 1, 0, 2], barres: [] },
  'D9': { frets: [-1, -1, 0, 2, 1, 0], fingers: [0, 0, 0, 2, 1, 0], barres: [] },
  'Ddim': { frets: [-1, -1, 0, 1, 0, 1], fingers: [0, 0, 0, 1, 0, 2], barres: [] },
  'Daug': { frets: [-1, -1, 0, 3, 3, 2], fingers: [0, 0, 0, 2, 3, 1], barres: [] },

  // ========== D#/Eb chords ==========
  'D#': { frets: [-1, 6, 8, 8, 8, 6], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 6, fromString: 1, toString: 5 }], baseFret: 6 },
  'Eb': { frets: [-1, 6, 8, 8, 8, 6], fingers: [0, 1, 2, 3, 4, 1], barres: [{ fret: 6, fromString: 1, toString: 5 }], baseFret: 6 },
  'D#m': { frets: [-1, 6, 8, 8, 7, 6], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 6, fromString: 1, toString: 5 }], baseFret: 6 },
  'Ebm': { frets: [-1, 6, 8, 8, 7, 6], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fret: 6, fromString: 1, toString: 5 }], baseFret: 6 },
  'D#7': { frets: [-1, 6, 8, 6, 8, 6], fingers: [0, 1, 3, 1, 4, 1], barres: [{ fret: 6, fromString: 1, toString: 5 }], baseFret: 6 },
  'Eb7': { frets: [-1, 6, 8, 6, 8, 6], fingers: [0, 1, 3, 1, 4, 1], barres: [{ fret: 6, fromString: 1, toString: 5 }], baseFret: 6 },
  'D#m7': { frets: [-1, 6, 8, 6, 7, 6], fingers: [0, 1, 3, 1, 2, 1], barres: [{ fret: 6, fromString: 1, toString: 5 }], baseFret: 6 },
  'Ebm7': { frets: [-1, 6, 8, 6, 7, 6], fingers: [0, 1, 3, 1, 2, 1], barres: [{ fret: 6, fromString: 1, toString: 5 }], baseFret: 6 },
  'D#maj7': { frets: [-1, 6, 8, 7, 8, 6], fingers: [0, 1, 3, 2, 4, 1], barres: [{ fret: 6, fromString: 1, toString: 5 }], baseFret: 6 },
  'Ebmaj7': { frets: [-1, 6, 8, 7, 8, 6], fingers: [0, 1, 3, 2, 4, 1], barres: [{ fret: 6, fromString: 1, toString: 5 }], baseFret: 6 },
  'D#5': { frets: [-1, 6, 8, 8, -1, -1], fingers: [0, 1, 3, 4, 0, 0], baseFret: 6 },
  'Eb5': { frets: [-1, 6, 8, 8, -1, -1], fingers: [0, 1, 3, 4, 0, 0], baseFret: 6 },
  // ========== E chords ==========
  'E': { frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], barres: [] },
  'Em': { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], barres: [] },
  'E7': { frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0], barres: [] },
  'Em7': { frets: [0, 2, 0, 0, 0, 0], fingers: [0, 2, 0, 0, 0, 0], barres: [] },
  'Emaj7': { frets: [0, 2, 1, 1, 0, 0], fingers: [0, 3, 1, 2, 0, 0], barres: [] },
  'Esus2': { frets: [0, 2, 4, 4, 0, 0], fingers: [0, 1, 3, 4, 0, 0], barres: [] },
  'Esus4': { frets: [0, 2, 2, 2, 0, 0], fingers: [0, 2, 3, 4, 0, 0], barres: [] },
  'Eadd9': { frets: [0, 2, 2, 1, 0, 2], fingers: [0, 2, 3, 1, 0, 4], barres: [] },
  'E5': { frets: [0, 2, 2, -1, -1, -1], fingers: [0, 1, 2, 0, 0, 0], barres: [] },
  'E6': { frets: [0, 2, 2, 1, 2, 0], fingers: [0, 2, 3, 1, 4, 0], barres: [] },
  'E9': { frets: [0, 2, 0, 1, 0, 2], fingers: [0, 2, 0, 1, 0, 3], barres: [] },
  'Edim': { frets: [0, 1, 2, 0, 2, 0], fingers: [0, 1, 2, 0, 3, 0], barres: [] },
  'Eaug': { frets: [0, 3, 2, 1, 1, 0], fingers: [0, 4, 3, 1, 2, 0], barres: [] },

  // ========== F chords ==========
  'F': { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barres: [{ fret: 1, fromString: 0, toString: 5 }], baseFret: 1 },
  'Fm': { frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 1, fromString: 0, toString: 5 }], baseFret: 1 },
  'F7': { frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], barres: [{ fret: 1, fromString: 0, toString: 5 }], baseFret: 1 },
  'Fm7': { frets: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], barres: [{ fret: 1, fromString: 0, toString: 5 }], baseFret: 1 },
  'Fmaj7': { frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0], barres: [] },
  'Fsus2': { frets: [-1, -1, 3, 0, 1, 1], fingers: [0, 0, 3, 0, 1, 2], barres: [] },
  'Fsus4': { frets: [1, 3, 3, 3, 1, 1], fingers: [1, 2, 3, 4, 1, 1], barres: [{ fret: 1, fromString: 0, toString: 5 }], baseFret: 1 },
  'F5': { frets: [1, 3, 3, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], baseFret: 1 },
  'Fadd9': { frets: [-1, -1, 3, 2, 1, 3], fingers: [0, 0, 3, 2, 1, 4], barres: [] },
  'F6': { frets: [1, 3, 3, 2, 3, 1], fingers: [1, 2, 3, 1, 4, 1], barres: [{ fret: 1, fromString: 0, toString: 5 }], baseFret: 1 },
  'Fdim': { frets: [1, 2, 3, 1, 3, 1], fingers: [1, 2, 3, 1, 4, 1], barres: [{ fret: 1, fromString: 0, toString: 5 }], baseFret: 1 },
  // ========== F#/Gb chords ==========
  'F#': { frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], barres: [{ fret: 2, fromString: 0, toString: 5 }], baseFret: 2 },
  'Gb': { frets: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], barres: [{ fret: 2, fromString: 0, toString: 5 }], baseFret: 2 },
  'F#m': { frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 2, fromString: 0, toString: 5 }], baseFret: 2 },
  'Gbm': { frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 2, fromString: 0, toString: 5 }], baseFret: 2 },
  'F#7': { frets: [2, 4, 2, 3, 2, 2], fingers: [1, 3, 1, 2, 1, 1], barres: [{ fret: 2, fromString: 0, toString: 5 }], baseFret: 2 },
  'Gb7': { frets: [2, 4, 2, 3, 2, 2], fingers: [1, 3, 1, 2, 1, 1], barres: [{ fret: 2, fromString: 0, toString: 5 }], baseFret: 2 },
  'F#m7': { frets: [2, 4, 2, 2, 2, 2], fingers: [1, 3, 1, 1, 1, 1], barres: [{ fret: 2, fromString: 0, toString: 5 }], baseFret: 2 },
  'Gbm7': { frets: [2, 4, 2, 2, 2, 2], fingers: [1, 3, 1, 1, 1, 1], barres: [{ fret: 2, fromString: 0, toString: 5 }], baseFret: 2 },
  'F#maj7': { frets: [2, 4, 3, 3, 2, 2], fingers: [1, 4, 2, 3, 1, 1], barres: [{ fret: 2, fromString: 0, toString: 5 }], baseFret: 2 },
  'Gbmaj7': { frets: [2, 4, 3, 3, 2, 2], fingers: [1, 4, 2, 3, 1, 1], barres: [{ fret: 2, fromString: 0, toString: 5 }], baseFret: 2 },
  'F#sus4': { frets: [2, 4, 4, 4, 2, 2], fingers: [1, 2, 3, 4, 1, 1], barres: [{ fret: 2, fromString: 0, toString: 5 }], baseFret: 2 },
  'Gbsus4': { frets: [2, 4, 4, 4, 2, 2], fingers: [1, 2, 3, 4, 1, 1], barres: [{ fret: 2, fromString: 0, toString: 5 }], baseFret: 2 },
  'F#5': { frets: [2, 4, 4, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], baseFret: 2 },
  'Gb5': { frets: [2, 4, 4, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], baseFret: 2 },

  // ========== G chords ==========
  'G': { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], barres: [] },
  'Gm': { frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 3, fromString: 0, toString: 5 }], baseFret: 3 },
  'G7': { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], barres: [] },
  'Gm7': { frets: [3, 5, 3, 3, 3, 3], fingers: [1, 3, 1, 1, 1, 1], barres: [{ fret: 3, fromString: 0, toString: 5 }], baseFret: 3 },
  'Gmaj7': { frets: [3, 2, 0, 0, 0, 2], fingers: [3, 1, 0, 0, 0, 2], barres: [] },
  'Gsus2': { frets: [3, 0, 0, 0, 3, 3], fingers: [1, 0, 0, 0, 3, 4], barres: [] },
  'Gsus4': { frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, 0, 0, 1, 4], barres: [] },
  'Gadd9': { frets: [3, 0, 0, 2, 0, 3], fingers: [2, 0, 0, 1, 0, 3], barres: [] },
  'G5': { frets: [3, 5, 5, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], baseFret: 3 },
  'G6': { frets: [3, 2, 0, 0, 0, 0], fingers: [2, 1, 0, 0, 0, 0], barres: [] },
  'G9': { frets: [3, 0, 0, 2, 0, 1], fingers: [3, 0, 0, 2, 0, 1], barres: [] },
  'Gdim': { frets: [3, 4, 5, 3, 5, 3], fingers: [1, 2, 3, 1, 4, 1], barres: [{ fret: 3, fromString: 0, toString: 5 }], baseFret: 3 },
  'Gaug': { frets: [3, 2, 1, 0, 0, 3], fingers: [3, 2, 1, 0, 0, 4], barres: [] },
  // ========== G#/Ab chords ==========
  'G#': { frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], barres: [{ fret: 4, fromString: 0, toString: 5 }], baseFret: 4 },
  'Ab': { frets: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], barres: [{ fret: 4, fromString: 0, toString: 5 }], baseFret: 4 },
  'G#m': { frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 4, fromString: 0, toString: 5 }], baseFret: 4 },
  'Abm': { frets: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], barres: [{ fret: 4, fromString: 0, toString: 5 }], baseFret: 4 },
  'G#7': { frets: [4, 6, 4, 5, 4, 4], fingers: [1, 3, 1, 2, 1, 1], barres: [{ fret: 4, fromString: 0, toString: 5 }], baseFret: 4 },
  'Ab7': { frets: [4, 6, 4, 5, 4, 4], fingers: [1, 3, 1, 2, 1, 1], barres: [{ fret: 4, fromString: 0, toString: 5 }], baseFret: 4 },
  'G#m7': { frets: [4, 6, 4, 4, 4, 4], fingers: [1, 3, 1, 1, 1, 1], barres: [{ fret: 4, fromString: 0, toString: 5 }], baseFret: 4 },
  'Abm7': { frets: [4, 6, 4, 4, 4, 4], fingers: [1, 3, 1, 1, 1, 1], barres: [{ fret: 4, fromString: 0, toString: 5 }], baseFret: 4 },
  'G#maj7': { frets: [4, 6, 5, 5, 4, 4], fingers: [1, 4, 2, 3, 1, 1], barres: [{ fret: 4, fromString: 0, toString: 5 }], baseFret: 4 },
  'Abmaj7': { frets: [4, 6, 5, 5, 4, 4], fingers: [1, 4, 2, 3, 1, 1], barres: [{ fret: 4, fromString: 0, toString: 5 }], baseFret: 4 },
  'G#sus4': { frets: [4, 6, 6, 6, 4, 4], fingers: [1, 2, 3, 4, 1, 1], barres: [{ fret: 4, fromString: 0, toString: 5 }], baseFret: 4 },
  'Absus4': { frets: [4, 6, 6, 6, 4, 4], fingers: [1, 2, 3, 4, 1, 1], barres: [{ fret: 4, fromString: 0, toString: 5 }], baseFret: 4 },
  'G#5': { frets: [4, 6, 6, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], baseFret: 4 },
  'Ab5': { frets: [4, 6, 6, -1, -1, -1], fingers: [1, 3, 4, 0, 0, 0], baseFret: 4 },
};

// Get chord data, with fallback for unknown chords
export function getChordData(chordName) {
  if (!chordName) return null;
  
  // Direct lookup
  if (CHORD_LIBRARY[chordName]) {
    return CHORD_LIBRARY[chordName];
  }
  
  // Try common variations
  const normalized = chordName
    .replace('minor', 'm')
    .replace('min', 'm')
    .replace('maj', '')
    .replace('major', '');
  
  if (CHORD_LIBRARY[normalized]) {
    return CHORD_LIBRARY[normalized];
  }
  
  // Return null for unknown chords
  return null;
}

// Get all chords for a root note
export function getChordsForRoot(root) {
  const chords = [];
  for (const name of Object.keys(CHORD_LIBRARY)) {
    if (name.startsWith(root) && (name.length === root.length || !name[root.length].match(/[A-G]/))) {
      chords.push({ name, ...CHORD_LIBRARY[name] });
    }
  }
  return chords;
}

// Get all chord names grouped by root
export function getChordsByRoot() {
  const roots = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
  const grouped = {};
  roots.forEach(root => {
    grouped[root] = getChordsForRoot(root);
  });
  return grouped;
}

// Get all chord names
export function getAllChordNames() {
  return Object.keys(CHORD_LIBRARY);
}

export default CHORD_LIBRARY;
