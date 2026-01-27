import React, { useState, useEffect, useCallback } from 'react'
import styles from './Practice.module.css'
import LessonViewer from './LessonViewer'
import { apiFetch } from '../api'
import { save, load } from '../utils/storage'

export default function Practice({ token, onBack }) {
  const [query, setQuery] = useState('')
  const [songs, setSongs] = useState([])
  const [selectedSong, setSelectedSong] = useState(null)
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [loading, setLoading] = useState(false)

  // Load recent lesson from storage
  useEffect(() => {
    const recent = load('recentLesson')
    if (recent && recent.versionId) {
      loadVersion(recent.versionId)
    }
  }, [])

  // Search songs
  useEffect(() => {
    const timer = setTimeout(() => {
      searchSongs(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  async function searchSongs(q) {
    setLoading(true)
    try {
      const list = await apiFetch(`/api/songs/search?q=${encodeURIComponent(q || '')}`, token)
      setSongs(list || [])
    } catch (e) {
      console.error('search failed', e)
      setSongs([])
    }
    setLoading(false)
  }

  async function handleSelectSong(song) {
    setSelectedSong(song)
    setSelectedVersion(null)
    try {
      const data = await apiFetch(`/api/songs/${song._id}`, token)
      if (data && data.versions && data.versions.length > 0) {
        // Pick first (or highest rated) version
        const sorted = [...data.versions].sort((a, b) => (b.rating || 0) - (a.rating || 0))
        setSelectedVersion(sorted[0])
        setSelectedSong({ ...song, versions: data.versions })
        // Save as recent
        save('recentLesson', { versionId: sorted[0]._id, songId: song._id })
      }
    } catch (e) {
      console.error('failed to load song versions', e)
    }
  }

  async function loadVersion(versionId) {
    try {
      const data = await apiFetch(`/api/versions/${versionId}`, token)
      if (data) {
        setSelectedVersion(data)
        if (data.song) setSelectedSong(data.song)
      }
    } catch (e) {
      console.error('failed to load version', e)
    }
  }

  function handleSelectVersion(ver) {
    setSelectedVersion(ver)
    save('recentLesson', { versionId: ver._id, songId: ver.songId })
  }

  return (
    <div className={styles.container}>
      {/* Left sidebar */}
      <aside className={styles.sidebar}>
        <button className={styles.backBtn} onClick={onBack}>← Dashboard</button>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search songs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className={styles.songList}>
          {loading && <div className={styles.loading}>Loading...</div>}
          {!loading && songs.length === 0 && query && (
            <div className={styles.empty}>No songs found</div>
          )}
          {songs.map((song) => (
            <button
              key={song._id}
              className={`${styles.songItem} ${selectedSong?._id === song._id ? styles.selected : ''}`}
              onClick={() => handleSelectSong(song)}
            >
              <span className={styles.songTitle}>{song.title}</span>
              <span className={styles.songArtist}>{song.artist || 'Unknown Artist'}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main lesson area */}
      <main className={styles.main}>
        {!selectedVersion ? (
          <div className={styles.emptyState}>
            <h2>Get started with a song from the sidebar</h2>
            <p>Search and select a song to begin your practice session.</p>
          </div>
        ) : (
          <LessonViewer
            song={selectedSong}
            version={selectedVersion}
            allVersions={selectedSong?.versions || []}
            onSelectVersion={handleSelectVersion}
            token={token}
          />
        )}
      </main>
    </div>
  )
}
