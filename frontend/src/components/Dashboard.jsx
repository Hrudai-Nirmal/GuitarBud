import React from 'react'
import styles from './Dashboard.module.css'
import { 
  MusicNoteIcon, 
  MicrophoneIcon, 
  GuitarIcon, 
  ScaleIcon, 
  TunerIcon, 
  DownloadIcon, 
  BookIcon 
} from './Icons'

const TILES = [
  { id: 'practice', label: 'Practice', Icon: MusicNoteIcon, desc: 'Browse and learn songs', size: 'large', gradient: 'purple' },
  { id: 'performance', label: 'Performance', Icon: MicrophoneIcon, desc: 'Sessions & Setlists', size: 'medium', gradient: 'pink' },
  { id: 'chords', label: 'Chord Charts', Icon: GuitarIcon, desc: 'Reference diagrams', size: 'medium', gradient: 'teal' },
  { id: 'scales', label: 'Scale Charts', Icon: ScaleIcon, desc: 'Scale patterns', size: 'small', gradient: 'indigo' },
  { id: 'tuner', label: 'Tuner', Icon: TunerIcon, desc: 'Tune your guitar', size: 'small', gradient: 'blue' },
  { id: 'downloads', label: 'Downloaded', Icon: DownloadIcon, desc: 'Offline lessons', size: 'small', gradient: 'orange' },
  { id: 'mylessons', label: 'My Lessons', Icon: BookIcon, desc: 'Purchased content', size: 'small', gradient: 'green' },
]

export default function Dashboard({ onNavigate, userRole, onLogout }) {
  return (
    <div className={styles.container}>      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>MUSES</h1>
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
              <span className={styles.icon}><tile.Icon size={32} /></span>
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
