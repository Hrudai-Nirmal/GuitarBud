import React, { useState, useEffect } from 'react'
import styles from './MyLessons.module.css'
import LessonViewer from './LessonViewer'
import { getMyPurchases, apiFetch } from '../api'
import { BookIcon, MusicNoteIcon, ArrowLeftIcon, DollarIcon } from './Icons'

export default function MyLessons({ token }) {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [selectedSong, setSelectedSong] = useState(null)
  const [error, setError] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    loadPurchases()
  }, [])

  async function loadPurchases() {
    setLoading(true)
    setError(null)
    try {
      const data = await getMyPurchases(token)
      setPurchases(data || [])
    } catch (e) {
      setError('Failed to load purchased lessons')
      console.error('load purchases error', e)
    }
    setLoading(false)
  }

  async function handleSelectLesson(lesson) {
    try {
      // Load the full version with content (we have access since we purchased it)
      const fullVersion = await apiFetch(`/api/versions/${lesson._id}/full`, token)
      if (fullVersion) {
        setSelectedLesson(fullVersion)
        setSelectedSong(fullVersion.song || lesson.song)
      }
    } catch (e) {
      console.error('Failed to load lesson', e)
      setError('Failed to load lesson content')
    }
  }

  function handleBack() {
    setSelectedLesson(null)
    setSelectedSong(null)
  }

  const showMobileLesson = isMobile && selectedLesson

  if (selectedLesson) {
    return (
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={handleBack}>
          <ArrowLeftIcon size={16} /> Back to My Lessons
        </button>
        <LessonViewer
          song={selectedSong}
          version={selectedLesson}
          allVersions={[]}
          onSelectVersion={() => {}}
          token={token}
        />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}><BookIcon size={28} /> My Lessons</h2>
        <p className={styles.subtitle}>Your purchased lessons</p>
      </div>

      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading your lessons...</p>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {!loading && purchases.length === 0 && (
        <div className={styles.emptyState}>
          <MusicNoteIcon size={64} />
          <h3>No purchased lessons yet</h3>
          <p>Browse songs in Practice to find lessons from teachers. Monetized lessons can be purchased to unlock their full content.</p>
        </div>
      )}

      {!loading && purchases.length > 0 && (
        <div className={styles.lessonGrid}>
          {purchases.map(lesson => (
            <button
              key={lesson._id}
              className={styles.lessonCard}
              onClick={() => handleSelectLesson(lesson)}
            >
              <div className={styles.cardTop}>
                <MusicNoteIcon size={24} />
                <div className={styles.cardInfo}>
                  <span className={styles.cardTitle}>{lesson.song?.title || 'Untitled'}</span>
                  <span className={styles.cardArtist}>{lesson.song?.artist || 'Unknown Artist'}</span>
                </div>
              </div>
              <div className={styles.cardMeta}>
                <span className={styles.keyBadge}>
                  {lesson.key || 'C'}{lesson.keyQuality === 'minor' ? ' minor' : ' major'}
                </span>
                <span className={styles.bpmBadge}>{lesson.bpm || 120} bpm</span>
                {lesson.teacherName && (
                  <span className={styles.teacherBadge}>by {lesson.teacherName}</span>
                )}
              </div>
              {lesson.purchasedAt && (
                <div className={styles.cardFooter}>
                  <DollarIcon size={14} />
                  <span>Purchased {new Date(lesson.purchasedAt).toLocaleDateString()}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
