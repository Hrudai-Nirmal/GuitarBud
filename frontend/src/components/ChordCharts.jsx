import { useState } from 'react'
import styles from './ChordCharts.module.css'
import ChordDiagram from './ChordDiagram'
import { getChordsByRoot, getChordsForRoot } from '../utils/chordLibrary'

const ROOTS = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
const ENHARMONIC = { 'A#': 'Bb', 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab' }

export default function ChordCharts({ onBack }) {
  const [selectedRoot, setSelectedRoot] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  const chordsByRoot = getChordsByRoot()
  
  // Filter chords based on search
  const filteredChords = searchQuery
    ? Object.entries(chordsByRoot).reduce((acc, [root, chords]) => {
        const filtered = chords.filter(c => 
          c.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        if (filtered.length) acc[root] = filtered
        return acc
      }, {})
    : selectedRoot 
      ? { [selectedRoot]: chordsByRoot[selectedRoot] }
      : chordsByRoot

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>← Back</button>
        <h2>Chord Library</h2>
      </div>

      {/* Search bar */}
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search chords (e.g., Am7, Dsus4, Bm...)"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            if (e.target.value) setSelectedRoot(null)
          }}
          className={styles.searchInput}
        />
        {searchQuery && (
          <button 
            className={styles.clearBtn}
            onClick={() => setSearchQuery('')}
          >
            ✕
          </button>
        )}
      </div>

      {/* Root note filters */}
      <div className={styles.rootFilters}>
        <button
          className={`${styles.rootBtn} ${!selectedRoot && !searchQuery ? styles.active : ''}`}
          onClick={() => { setSelectedRoot(null); setSearchQuery('') }}
        >
          All
        </button>
        {ROOTS.map(root => (
          <button
            key={root}
            className={`${styles.rootBtn} ${selectedRoot === root ? styles.active : ''}`}
            onClick={() => { setSelectedRoot(root); setSearchQuery('') }}
          >
            {root}
            {ENHARMONIC[root] && <span className={styles.enharmonic}>/{ENHARMONIC[root]}</span>}
          </button>
        ))}
      </div>

      {/* Chord grid */}
      <div className={styles.chordGrid}>
        {Object.entries(filteredChords).map(([root, chords]) => (
          <div key={root} className={styles.rootSection}>
            <h3 className={styles.rootTitle}>
              {root} 
              {ENHARMONIC[root] && <span className={styles.enharmonicTitle}> / {ENHARMONIC[root]}</span>}
            </h3>
            <div className={styles.chordRow}>
              {chords.map(chord => (
                <div key={chord.name} className={styles.chordCard}>
                  <ChordDiagram token={chord.name} size={130} />
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {Object.keys(filteredChords).length === 0 && (
          <div className={styles.noResults}>
            <p>No chords found matching "{searchQuery}"</p>
            <p className={styles.noResultsHint}>
              Try searching for: Am, G7, Dsus4, F#m, Cadd9...
            </p>
          </div>
        )}
      </div>

      {/* Quick reference */}
      <div className={styles.legend}>
        <h4>Reading Chord Diagrams:</h4>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <span className={styles.legendSymbol}>●</span>
            <span>Finger placement (number = which finger)</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendSymbol}>○</span>
            <span>Open string (play without fretting)</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendSymbol}>✕</span>
            <span>Muted string (don't play)</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendSymbol}>▬</span>
            <span>Barre (press multiple strings with one finger)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
