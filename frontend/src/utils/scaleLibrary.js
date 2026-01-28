// Guitar Scale Library - Common scale patterns and shapes
// Each scale has positions (box patterns) with fret numbers for each string
// Format: [lowE, A, D, G, B, highE] where each value is an array of frets to play

// Notes for transposition
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const NOTE_ALIASES = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' }

// Scale patterns defined relative to root note (0 = root fret)
// These are "moveable" patterns - add root fret position to get actual frets

export const SCALE_PATTERNS = {
  // ========== Pentatonic Scales ==========
  'Minor Pentatonic': {
    intervals: [0, 3, 5, 7, 10],
    positions: [
      {
        name: 'Position 1 (Root on 6th)',
        // Relative frets from root on 6th string
        pattern: [
          [0, 3],      // Low E
          [0, 3],      // A
          [0, 2],      // D
          [0, 2],      // G
          [0, 3],      // B
          [0, 3],      // High E
        ],
        rootString: 6,
        rootFret: 0,
      },
      {
        name: 'Position 2',
        pattern: [
          [3, 5],
          [3, 5],
          [2, 5],
          [2, 5],
          [3, 5],
          [3, 5],
        ],
        rootString: 6,
        rootFret: 3,
      },
      {
        name: 'Position 3',
        pattern: [
          [5, 7],
          [5, 7],
          [5, 7],
          [5, 7],
          [5, 8],
          [5, 8],
        ],
        rootString: 5,
        rootFret: 0,
      },
      {
        name: 'Position 4',
        pattern: [
          [7, 10],
          [7, 10],
          [7, 9],
          [7, 9],
          [8, 10],
          [8, 10],
        ],
        rootString: 4,
        rootFret: 0,
      },
      {
        name: 'Position 5',
        pattern: [
          [10, 12],
          [10, 12],
          [9, 12],
          [9, 12],
          [10, 12],
          [10, 12],
        ],
        rootString: 6,
        rootFret: 12,
      },
    ],
  },

  'Major Pentatonic': {
    intervals: [0, 2, 4, 7, 9],
    positions: [
      {
        name: 'Position 1 (Root on 6th)',
        pattern: [
          [0, 2],
          [0, 2],
          [-1, 2],
          [-1, 2],
          [0, 2],
          [0, 2],
        ],
        rootString: 6,
        rootFret: 0,
      },
      {
        name: 'Position 2',
        pattern: [
          [2, 4],
          [2, 4],
          [2, 4],
          [2, 4],
          [2, 5],
          [2, 5],
        ],
        rootString: 5,
        rootFret: 0,
      },
    ],
  },

  // ========== Blues Scale ==========
  'Blues': {
    intervals: [0, 3, 5, 6, 7, 10],
    positions: [
      {
        name: 'Box 1',
        pattern: [
          [0, 3],
          [0, 3],
          [0, 1, 2],
          [0, 2],
          [0, 3],
          [0, 3],
        ],
        rootString: 6,
        rootFret: 0,
      },
    ],
  },

  // ========== Major Scale (Ionian) ==========
  'Major (Ionian)': {
    intervals: [0, 2, 4, 5, 7, 9, 11],
    positions: [
      {
        name: 'Position 1',
        pattern: [
          [0, 2],
          [-1, 0, 2],
          [-1, 0, 2],
          [-1, 1, 2],
          [0, 2],
          [0, 2],
        ],
        rootString: 6,
        rootFret: 0,
      },
      {
        name: 'Position 2 (CAGED C shape)',
        pattern: [
          [2, 3, 5],
          [2, 3, 5],
          [2, 4, 5],
          [2, 4, 5],
          [3, 5],
          [3, 5],
        ],
        rootString: 5,
        rootFret: 3,
      },
    ],
  },

  // ========== Natural Minor (Aeolian) ==========
  'Natural Minor (Aeolian)': {
    intervals: [0, 2, 3, 5, 7, 8, 10],
    positions: [
      {
        name: 'Position 1',
        pattern: [
          [0, 2, 3],
          [0, 2, 3],
          [0, 2],
          [0, 2],
          [0, 1, 3],
          [0, 2, 3],
        ],
        rootString: 6,
        rootFret: 0,
      },
    ],
  },

  // ========== Harmonic Minor ==========
  'Harmonic Minor': {
    intervals: [0, 2, 3, 5, 7, 8, 11],
    positions: [
      {
        name: 'Position 1',
        pattern: [
          [0, 2, 3],
          [0, 2, 3],
          [0, 2],
          [0, 2],
          [0, 1, 4],
          [0, 2, 3],
        ],
        rootString: 6,
        rootFret: 0,
      },
    ],
  },

  // ========== Modes ==========
  'Dorian': {
    intervals: [0, 2, 3, 5, 7, 9, 10],
    positions: [
      {
        name: 'Position 1',
        pattern: [
          [0, 2, 3],
          [0, 2, 3],
          [0, 2],
          [0, 2],
          [0, 2, 3],
          [0, 2, 3],
        ],
        rootString: 6,
        rootFret: 0,
      },
    ],
  },

  'Phrygian': {
    intervals: [0, 1, 3, 5, 7, 8, 10],
    positions: [
      {
        name: 'Position 1',
        pattern: [
          [0, 1, 3],
          [0, 1, 3],
          [0, 2],
          [0, 2],
          [0, 1, 3],
          [0, 1, 3],
        ],
        rootString: 6,
        rootFret: 0,
      },
    ],
  },

  'Lydian': {
    intervals: [0, 2, 4, 6, 7, 9, 11],
    positions: [
      {
        name: 'Position 1',
        pattern: [
          [0, 2],
          [0, 2, 4],
          [0, 1, 2],
          [0, 1, 2],
          [0, 2],
          [0, 2],
        ],
        rootString: 6,
        rootFret: 0,
      },
    ],
  },

  'Mixolydian': {
    intervals: [0, 2, 4, 5, 7, 9, 10],
    positions: [
      {
        name: 'Position 1',
        pattern: [
          [0, 2, 3],
          [0, 2],
          [0, 2],
          [0, 2],
          [0, 2, 3],
          [0, 2, 3],
        ],
        rootString: 6,
        rootFret: 0,
      },
    ],
  },

  'Locrian': {
    intervals: [0, 1, 3, 5, 6, 8, 10],
    positions: [
      {
        name: 'Position 1',
        pattern: [
          [0, 1, 3],
          [0, 1, 3],
          [0, 2, 3],
          [0, 2],
          [0, 1, 3],
          [0, 1, 3],
        ],
        rootString: 6,
        rootFret: 0,
      },
    ],
  },
}

// Scale categories for organization
export const SCALE_CATEGORIES = {
  'Pentatonic': ['Minor Pentatonic', 'Major Pentatonic'],
  'Blues': ['Blues'],
  'Major & Minor': ['Major (Ionian)', 'Natural Minor (Aeolian)', 'Harmonic Minor'],
  'Modes': ['Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Locrian'],
}

// Get fret offset for a given root note (relative to E on 6th string)
export function getRootFretOffset(rootNote) {
  const normalized = NOTE_ALIASES[rootNote] || rootNote
  const index = NOTES.indexOf(normalized)
  if (index === -1) return 0
  // E is at index 4, so offset from E
  return (index - 4 + 12) % 12
}

// Get scale pattern transposed to a specific root note
export function getScaleInKey(scaleName, rootNote) {
  const scale = SCALE_PATTERNS[scaleName]
  if (!scale) return null
  
  const offset = getRootFretOffset(rootNote)
  
  return {
    name: `${rootNote} ${scaleName}`,
    intervals: scale.intervals,
    positions: scale.positions.map(pos => ({
      ...pos,
      actualFrets: pos.pattern.map(stringFrets => 
        stringFrets.map(fret => fret + offset).filter(f => f >= 0 && f <= 24)
      ),
      rootFret: pos.rootFret + offset,
    })),
  }
}

// Get all scale names
export function getAllScaleNames() {
  return Object.keys(SCALE_PATTERNS)
}

// Get scale info
export function getScaleInfo(scaleName) {
  return SCALE_PATTERNS[scaleName] || null
}

export default SCALE_PATTERNS
