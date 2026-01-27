import React from 'react'
import styles from './Dashboard.module.css'

const TILES = [
  { id: 'practice', label: 'Practice', icon: '🎵', desc: 'Browse and learn songs' },
  { id: 'downloads', label: 'Downloaded', icon: '⬇️', desc: 'Offline lessons' },
  { id: 'performance', label: 'Performance', icon: '🎤', desc: 'Editor, Setlists, Sessions' },
  { id: 'tuner', label: 'Tuner', icon: '🎚️', desc: 'Tune your guitar' },
  { id: 'chords', label: 'Chord Charts', icon: '🎸', desc: 'Reference diagrams' },
  { id: 'mylessons', label: 'My Lessons', icon: '📚', desc: 'Purchased content' },
]

export default function Dashboard({ onNavigate, userRole }) {
  return (
    <div className={styles.container}>
      <h2 className={styles.welcome}>Welcome back!</h2>
      <div className={styles.grid}>
        {TILES.map((tile) => (
          <button
            key={tile.id}
            className={styles.tile}
            onClick={() => onNavigate(tile.id)}
          >
            <span className={styles.icon}>{tile.icon}</span>
            <span className={styles.label}>{tile.label}</span>
            <span className={styles.desc}>{tile.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
