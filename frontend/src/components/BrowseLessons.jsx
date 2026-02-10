import React, { useState, useEffect, useCallback } from 'react'
import styles from './BrowseLessons.module.css'
import LessonViewer from './LessonViewer'
import { browseLessons, apiFetch } from '../api'
import { SearchIcon, MusicNoteIcon, DollarIcon, StarIcon, LockIcon, ArrowLeftIcon, TeacherIcon } from './Icons'

const KEY_OPTIONS = ['', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
]

export default function BrowseLessons({ token }) {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Search & filters
  const [query, setQuery] = useState('')
  const [keyFilter, setKeyFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  // Selected lesson viewer
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [selectedSong, setSelectedSong] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  // Purchasing state (inline card purchase)
  const [purchasingId, setPurchasingId] = useState(null)
  const [purchaseMsg, setPurchaseMsg] = useState(null)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const loadLessons = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await browseLessons(token, { q: query, key: keyFilter, sort: sortBy })
      setLessons(data || [])
    } catch (e) {
      setError('Failed to load lessons')
      console.error('browse error', e)
    }
    setLoading(false)
  }, [token, query, keyFilter, sortBy])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => { loadLessons() }, 350)
    return () => clearTimeout(timer)
  }, [loadLessons])

  async function handleOpenLesson(lesson) {
    try {
      const fullVersion = await apiFetch(`/api/versions/${lesson._id}/full`, token)
      if (fullVersion) {
        setSelectedLesson(fullVersion)
        setSelectedSong(fullVersion.song || lesson.song)
      }
    } catch (e) {
      console.error('Failed to load lesson', e)
      setError('Failed to load lesson details')
    }
  }

  async function handleCardPurchase(lesson) {
    setPurchasingId(String(lesson._id))
    setPurchaseMsg(null)
    try {
      await apiFetch(`/api/purchase/${lesson._id}`, token, { method: 'POST' })
      setPurchaseMsg({ id: String(lesson._id), type: 'success', text: 'Purchased! Opening...' })
      // Refresh list to update purchased status
      loadLessons()
      // Auto-open after short delay
      setTimeout(() => {
        handleOpenLesson(lesson)
        setPurchaseMsg(null)
      }, 800)
    } catch (e) {
      const msg = e?.error === 'already_purchased'
        ? 'Already purchased!'
        : 'Purchase failed. Try again.'
      setPurchaseMsg({ id: String(lesson._id), type: 'error', text: msg })
      if (e?.error === 'already_purchased') {
        loadLessons()
      }
    }
    setPurchasingId(null)
  }

  function handleBack() {
    setSelectedLesson(null)
    setSelectedSong(null)
  }

  function handleSelectVersion(ver) {
    setSelectedLesson(ver)
    if (ver.song) setSelectedSong(ver.song)
  }

  // If a lesson is selected, show the viewer
  if (selectedLesson) {
    return (
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={handleBack}>
          <ArrowLeftIcon size={16} /> Back to Browse
        </button>
        <LessonViewer
          song={selectedSong}
          version={selectedLesson}
          allVersions={[]}
          onSelectVersion={handleSelectVersion}
          token={token}
        />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}><SearchIcon size={28} /> Browse Lessons</h2>
        <p className={styles.subtitle}>Discover premium lessons from teachers</p>
      </div>

      {/* Search & Filters Bar */}
      <div className={styles.filtersBar}>
        <div className={styles.searchBox}>
          <SearchIcon size={18} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search songs, artists, teachers..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={keyFilter}
            onChange={e => setKeyFilter(e.target.value)}
          >
            <option value="">All Keys</option>
            {KEY_OPTIONS.filter(Boolean).map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Loading */}
      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Searching lessons...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && lessons.length === 0 && (
        <div className={styles.emptyState}>
          <MusicNoteIcon size={64} />
          <h3>No lessons found</h3>
          <p>
            {query || keyFilter
              ? 'Try adjusting your search or filters.'
              : 'No premium lessons are available yet. Check back later!'}
          </p>
        </div>
      )}

      {/* Results Grid */}
      {!loading && lessons.length > 0 && (
        <>
          <div className={styles.resultCount}>{lessons.length} lesson{lessons.length !== 1 ? 's' : ''} found</div>
          <div className={styles.lessonGrid}>
            {lessons.map(lesson => {
              const lid = String(lesson._id)
              const isPurchased = lesson.purchased
              const msg = purchaseMsg?.id === lid ? purchaseMsg : null

              return (
                <div key={lid} className={`${styles.lessonCard} ${isPurchased ? styles.purchasedCard : ''}`}>
                  {/* Card top: song info */}
                  <div className={styles.cardHeader}>
                    <MusicNoteIcon size={22} />
                    <div className={styles.cardInfo}>
                      <span className={styles.cardTitle}>{lesson.song?.title || 'Untitled'}</span>
                      <span className={styles.cardArtist}>{lesson.song?.artist || 'Unknown Artist'}</span>
                    </div>
                  </div>

                  {/* Meta badges */}
                  <div className={styles.cardMeta}>
                    <span className={styles.keyBadge}>
                      {lesson.key || 'C'}{lesson.keyQuality === 'minor' ? 'm' : ''}
                    </span>
                    <span className={styles.bpmBadge}>{lesson.bpm || 120} bpm</span>
                    {lesson.capo > 0 && <span className={styles.capoBadge}>Capo {lesson.capo}</span>}
                    <span className={styles.timeBadge}>{lesson.timeSignature || '4/4'}</span>
                  </div>

                  {/* Teacher */}
                  <div className={styles.teacherRow}>
                    <TeacherIcon size={16} />
                    <span>{lesson.teacherName || 'Teacher'}</span>
                  </div>

                  {/* Rating */}
                  {(lesson.ratingCount || 0) > 0 && (
                    <div className={styles.ratingRow}>
                      <StarIcon size={16} />
                      <span>{(lesson.rating || 0).toFixed(1)}</span>
                      <span className={styles.ratingCount}>({lesson.ratingCount})</span>
                    </div>
                  )}

                  {/* Price & Action */}
                  <div className={styles.cardFooter}>
                    <span className={styles.price}>
                      <DollarIcon size={16} />
                      ${(lesson.price || 0).toFixed(2)}
                    </span>

                    {isPurchased ? (
                      <button
                        className={styles.openBtn}
                        onClick={() => handleOpenLesson(lesson)}
                      >
                        Open Lesson
                      </button>
                    ) : (
                      <button
                        className={styles.buyBtn}
                        onClick={() => handleCardPurchase(lesson)}
                        disabled={purchasingId === lid}
                      >
                        {purchasingId === lid ? 'Processing...' : 'Buy'}
                      </button>
                    )}
                  </div>

                  {/* Purchase message */}
                  {msg && (
                    <div className={`${styles.cardMsg} ${msg.type === 'success' ? styles.msgSuccess : styles.msgError}`}>
                      {msg.text}
                    </div>
                  )}

                  {/* Purchased ribbon */}
                  {isPurchased && (
                    <div className={styles.purchasedRibbon}>Owned</div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
