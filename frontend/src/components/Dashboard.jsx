import React from 'react'
import styles from './Dashboard.module.css'

const TILES = [
  { id: 'practice', label: 'Practice', icon: '🎵', desc: 'Browse and learn songs', size: 'large', gradient: 'purple' },
  { id: 'tuner', label: 'Tuner', icon: '🎚️', desc: 'Tune your guitar', size: 'medium', gradient: 'blue' },
  { id: 'chords', label: 'Chord Charts', icon: '🎸', desc: 'Reference diagrams', size: 'medium', gradient: 'teal' },
  { id: 'downloads', label: 'Downloaded', icon: '⬇️', desc: 'Offline lessons', size: 'small', gradient: 'orange' },
  { id: 'performance', label: 'Performance', icon: '🎤', desc: 'Editor & Setlists', size: 'small', gradient: 'pink' },
  { id: 'mylessons', label: 'My Lessons', icon: '📚', desc: 'Purchased content', size: 'small', gradient: 'green' },
]

export default function Dashboard({ onNavigate, userRole, onLogout }) {
  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>🎸 GuitarBuddy</h1>
        <p className={styles.heroSubtitle}>What would you like to do today?</p>
      </div>
      
      <div className={styles.bentoGrid}>
        {TILES.map((tile) => (
          <button
            key={tile.id}
            className={`${styles.tile} ${styles[tile.size]} ${styles[tile.gradient]}`}
            onClick={() => onNavigate(tile.id)}
          >
            <div className={styles.tileContent}>
              <span className={styles.icon}>{tile.icon}</span>
              <div className={styles.tileText}>
                <span className={styles.label}>{tile.label}</span>
                <span className={styles.desc}>{tile.desc}</span>
              </div>
            </div>
            <div className={styles.tileGlow} />
          </button>
        ))}
      </div>
      
      <div className={styles.footer}>
        <span className={styles.roleTag}>{userRole}</span>
        <button className={styles.logoutBtn} onClick={onLogout}>Logout</button>
      </div>
    </div>
  )
}
