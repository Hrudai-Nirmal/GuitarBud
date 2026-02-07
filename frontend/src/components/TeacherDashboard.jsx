import React, { useState, useEffect, useCallback } from 'react'
import styles from './TeacherDashboard.module.css'
import {
  BookIcon, EditIcon, ChartIcon, PlusIcon, TrashIcon, SaveIcon, 
  DollarIcon, ToggleOnIcon, ToggleOffIcon, CloseIcon, MusicNoteIcon,
  ArrowLeftIcon
} from './Icons'
import { 
  getMyLessons, updateVersion, deleteVersion, updateSong,
  createSong, createVersion, getTeacherStats, searchSongs
} from '../api'

const TABS = [
  { id: 'lessons', label: 'My Lessons', Icon: BookIcon },
  { id: 'editor', label: 'Lesson Editor', Icon: EditIcon },
  { id: 'analytics', label: 'Analytics', Icon: ChartIcon },
]

const KEY_OPTIONS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B']
const KEY_QUALITY_OPTIONS = ['major', 'minor']
const TIME_SIG_OPTIONS = ['2/4', '3/4', '4/4', '5/4', '6/8', '7/8']

export default function TeacherDashboard({ token }) {
  const [activeTab, setActiveTab] = useState('lessons')
  const [lessons, setLessons] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // Editor state
  const [editingLesson, setEditingLesson] = useState(null) // null = new lesson
  const [editorData, setEditorData] = useState(getEmptyEditor())
  const [songSearchQuery, setSongSearchQuery] = useState('')
  const [songSearchResults, setSongSearchResults] = useState([])
  const [showSongSearch, setShowSongSearch] = useState(false)
  const [saving, setSaving] = useState(false)

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  function getEmptyEditor() {
    return {
      songTitle: '',
      songArtist: '',      songId: null,
      content: '',
      key: 'C',
      keyQuality: 'major',
      bpm: 120,
      capo: 0,
      timeSignature: '4/4',
      backingTrackUrl: '',
      youtubeUrl: '',
      blocks: [],
      monetized: false,
      price: 0,
    }
  }

  // Load lessons on mount
  useEffect(() => {
    loadLessons()
    loadStats()
  }, [])

  // Clear messages after 4s
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 4000)
      return () => clearTimeout(t)
    }
  }, [successMsg])

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(t)
    }
  }, [error])

  async function loadLessons() {
    setLoading(true)
    try {
      const data = await getMyLessons(token)
      setLessons(data || [])
    } catch (e) {
      setError('Failed to load lessons')
    }
    setLoading(false)
  }

  async function loadStats() {
    try {
      const data = await getTeacherStats(token)
      setStats(data)
    } catch (e) {
      console.error('Failed to load stats', e)
    }
  }

  // ===== LESSON ACTIONS =====
  function handleEditLesson(lesson) {
    setEditingLesson(lesson)
    setEditorData({
      songTitle: lesson.song?.title || '',
      songArtist: lesson.song?.artist || '',
      songId: lesson.songId,      content: lesson.content || '',
      key: lesson.key || 'C',
      keyQuality: lesson.keyQuality || 'major',
      bpm: lesson.bpm || 120,
      capo: lesson.capo || 0,
      timeSignature: lesson.timeSignature || '4/4',
      backingTrackUrl: lesson.backingTrackUrl || '',
      youtubeUrl: lesson.youtubeUrl || '',
      blocks: lesson.blocks || [],
      monetized: lesson.monetized || false,
      price: lesson.price || 0,
    })
    setActiveTab('editor')
  }

  function handleNewLesson() {
    setEditingLesson(null)
    setEditorData(getEmptyEditor())
    setActiveTab('editor')
  }

  async function handleToggleMonetized(lesson) {
    try {
      await updateVersion(token, lesson._id, { monetized: !lesson.monetized })
      setSuccessMsg(lesson.monetized ? 'Lesson set to free' : 'Lesson monetized')
      loadLessons()
    } catch (e) {
      setError('Failed to update lesson')
    }
  }

  async function handleDeleteLesson(lesson) {
    try {
      await deleteVersion(token, lesson._id)
      setSuccessMsg('Lesson deleted')
      setDeleteConfirm(null)
      loadLessons()
      loadStats()
    } catch (e) {
      setError('Failed to delete lesson')
    }
  }

  // ===== EDITOR SAVE =====
  async function handleSaveLesson() {
    if (!editorData.songTitle.trim()) {
      setError('Song title is required')
      return
    }
    if (!editorData.content.trim() && editorData.blocks.length === 0) {
      setError('Lesson content is required')
      return
    }

    setSaving(true)
    try {
      let songId = editorData.songId

      // Create or update song
      if (!songId) {
        const songResult = await createSong(token, {
          title: editorData.songTitle.trim(),
          artist: editorData.songArtist.trim(),
        })
        songId = songResult.id
      } else {
        await updateSong(token, songId, {
          title: editorData.songTitle.trim(),
          artist: editorData.songArtist.trim(),
        })
      }      const versionPayload = {
        content: editorData.content,
        key: editorData.key,
        keyQuality: editorData.keyQuality,
        bpm: Number(editorData.bpm) || 120,
        capo: Number(editorData.capo) || 0,
        timeSignature: editorData.timeSignature,
        backingTrackUrl: editorData.backingTrackUrl || null,
        youtubeUrl: editorData.youtubeUrl || null,
        blocks: editorData.blocks,
        monetized: editorData.monetized,
        price: Number(editorData.price) || 0,
      }

      if (editingLesson) {
        // Update existing version
        await updateVersion(token, editingLesson._id, versionPayload)
        setSuccessMsg('Lesson updated successfully')
      } else {
        // Create new version
        await createVersion(token, songId, versionPayload)
        setSuccessMsg('Lesson created successfully')
      }

      loadLessons()
      loadStats()
      setActiveTab('lessons')
      setEditingLesson(null)
      setEditorData(getEmptyEditor())
    } catch (e) {
      setError(e?.error || 'Failed to save lesson')
    }
    setSaving(false)
  }

  // ===== SONG SEARCH (for linking to existing songs) =====
  useEffect(() => {
    if (!showSongSearch || !songSearchQuery.trim()) {
      setSongSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const results = await searchSongs(token, songSearchQuery)
        setSongSearchResults(results || [])
      } catch (e) {
        setSongSearchResults([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [songSearchQuery, showSongSearch])

  function handleSelectExistingSong(song) {
    setEditorData(prev => ({
      ...prev,
      songId: String(song._id),
      songTitle: song.title,
      songArtist: song.artist || '',
    }))
    setShowSongSearch(false)
    setSongSearchQuery('')
  }

  // ===== BLOCK EDITOR =====
  function addBlock(type) {
    setEditorData(prev => ({
      ...prev,
      blocks: [...prev.blocks, { type, data: '' }]
    }))
  }

  function updateBlock(index, data) {
    setEditorData(prev => {
      const blocks = [...prev.blocks]
      blocks[index] = { ...blocks[index], data }
      return { ...prev, blocks }
    })
  }

  function removeBlock(index) {
    setEditorData(prev => ({
      ...prev,
      blocks: prev.blocks.filter((_, i) => i !== index)
    }))
  }

  function moveBlock(index, direction) {
    setEditorData(prev => {
      const blocks = [...prev.blocks]
      const newIndex = index + direction
      if (newIndex < 0 || newIndex >= blocks.length) return prev
      ;[blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]]
      return { ...prev, blocks }
    })
  }

  // ===== RENDER =====
  return (
    <div className={styles.container}>
      {/* Tab Navigation */}
      <nav className={styles.tabNav}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.Icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Messages */}
      {error && <div className={styles.errorBanner}>{error}</div>}
      {successMsg && <div className={styles.successBanner}>{successMsg}</div>}

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'lessons' && renderLessonsTab()}
        {activeTab === 'editor' && renderEditorTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>Delete Lesson?</h3>
            <p>Are you sure you want to delete &ldquo;{deleteConfirm.song?.title || 'this lesson'}&rdquo;?<br />This cannot be undone.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className={styles.deleteBtn} onClick={() => handleDeleteLesson(deleteConfirm)}>
                <TrashIcon size={16} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ===== LESSONS TAB =====
  function renderLessonsTab() {
    return (
      <div className={styles.lessonsTab}>
        <div className={styles.tabHeader}>
          <h2>My Lessons</h2>
          <button className={styles.primaryBtn} onClick={handleNewLesson}>
            <PlusIcon size={18} /> New Lesson
          </button>
        </div>

        {loading && <div className={styles.loadingState}>Loading lessons...</div>}

        {!loading && lessons.length === 0 && (
          <div className={styles.emptyState}>
            <MusicNoteIcon size={64} />
            <h3>No lessons yet</h3>
            <p>Create your first lesson and share your knowledge with students.</p>
            <button className={styles.primaryBtn} onClick={handleNewLesson}>
              <PlusIcon size={18} /> Create Lesson
            </button>
          </div>
        )}

        {!loading && lessons.length > 0 && (
          <div className={styles.lessonGrid}>
            {lessons.map(lesson => (
              <div key={lesson._id} className={styles.lessonCard}>
                <div className={styles.lessonCardHeader}>
                  <div className={styles.lessonInfo}>
                    <h3 className={styles.lessonTitle}>{lesson.song?.title || 'Untitled'}</h3>
                    <span className={styles.lessonArtist}>{lesson.song?.artist || 'Unknown Artist'}</span>
                  </div>
                  <div className={styles.lessonMeta}>
                    <span className={styles.keyBadge}>{lesson.key || 'C'}{lesson.keyQuality === 'minor' ? 'm' : ''}</span>
                    <span className={styles.bpmBadge}>{lesson.bpm || 120} bpm</span>
                  </div>
                </div>

                <div className={styles.lessonDetails}>
                  {lesson.capo > 0 && <span className={styles.detailChip}>Capo {lesson.capo}</span>}
                  <span className={styles.detailChip}>{lesson.timeSignature || '4/4'}</span>
                  {lesson.ratingCount > 0 && (
                    <span className={styles.ratingChip}>
                      ★ {(lesson.rating || 0).toFixed(1)} ({lesson.ratingCount})
                    </span>
                  )}
                </div>

                <div className={styles.lessonCardFooter}>
                  <div className={styles.monetizeToggle}>
                    <button
                      className={`${styles.toggleBtn} ${lesson.monetized ? styles.toggleOn : ''}`}
                      onClick={() => handleToggleMonetized(lesson)}
                      title={lesson.monetized ? 'Click to make free' : 'Click to monetize'}
                    >
                      {lesson.monetized ? <ToggleOnIcon size={20} /> : <ToggleOffIcon size={20} />}
                      <span>{lesson.monetized ? `$${(lesson.price || 0).toFixed(2)}` : 'Free'}</span>
                    </button>
                  </div>
                  <div className={styles.cardActions}>
                    <button className={styles.iconBtn} onClick={() => handleEditLesson(lesson)} title="Edit">
                      <EditIcon size={18} />
                    </button>
                    <button className={`${styles.iconBtn} ${styles.deleteIconBtn}`} onClick={() => setDeleteConfirm(lesson)} title="Delete">
                      <TrashIcon size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ===== EDITOR TAB =====
  function renderEditorTab() {
    return (
      <div className={styles.editorTab}>
        <div className={styles.tabHeader}>
          <h2>{editingLesson ? 'Edit Lesson' : 'New Lesson'}</h2>
          <div className={styles.editorActions}>
            <button className={styles.secondaryBtn} onClick={() => { setActiveTab('lessons'); setEditingLesson(null); setEditorData(getEmptyEditor()) }}>
              Cancel
            </button>
            <button className={styles.primaryBtn} onClick={handleSaveLesson} disabled={saving}>
              <SaveIcon size={18} /> {saving ? 'Saving...' : 'Save Lesson'}
            </button>
          </div>
        </div>

        <div className={styles.editorForm}>
          {/* Song Info Section */}
          <section className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Song Information</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Song Title *</label>
                <div className={styles.songTitleRow}>
                  <input
                    type="text"
                    value={editorData.songTitle}
                    onChange={e => setEditorData(prev => ({ ...prev, songTitle: e.target.value }))}
                    placeholder="e.g. Wonderwall"
                    className={styles.input}
                  />
                  <button 
                    className={styles.linkBtn}
                    onClick={() => setShowSongSearch(!showSongSearch)}
                    title="Link to existing song"
                  >
                    {showSongSearch ? 'Cancel' : 'Link Existing'}
                  </button>
                </div>
                {showSongSearch && (
                  <div className={styles.songSearchDropdown}>
                    <input
                      type="text"
                      value={songSearchQuery}
                      onChange={e => setSongSearchQuery(e.target.value)}
                      placeholder="Search existing songs..."
                      className={styles.input}
                      autoFocus
                    />
                    <div className={styles.songSearchResults}>
                      {songSearchResults.map(song => (
                        <button
                          key={song._id}
                          className={styles.songSearchItem}
                          onClick={() => handleSelectExistingSong(song)}
                        >
                          <strong>{song.title}</strong>
                          <span>{song.artist}</span>
                        </button>
                      ))}
                      {songSearchQuery && songSearchResults.length === 0 && (
                        <div className={styles.noResults}>No matching songs found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.formGroup}>
                <label>Artist</label>
                <input
                  type="text"
                  value={editorData.songArtist}
                  onChange={e => setEditorData(prev => ({ ...prev, songArtist: e.target.value }))}
                  placeholder="e.g. Oasis"
                  className={styles.input}
                />
              </div>
            </div>
          </section>

          {/* Musical Settings */}
          <section className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Musical Settings</h3>            <div className={styles.settingsGrid}>
              <div className={styles.formGroup}>
                <label>Key</label>
                <div className={styles.keyRow}>
                  <select
                    value={editorData.key}
                    onChange={e => setEditorData(prev => ({ ...prev, key: e.target.value }))}
                    className={styles.select}
                  >
                    {KEY_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                  <select
                    value={editorData.keyQuality}
                    onChange={e => setEditorData(prev => ({ ...prev, keyQuality: e.target.value }))}
                    className={styles.select}
                  >
                    {KEY_QUALITY_OPTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>BPM</label>
                <input
                  type="number"
                  value={editorData.bpm}
                  onChange={e => setEditorData(prev => ({ ...prev, bpm: e.target.value }))}
                  min={40} max={300}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Time Signature</label>
                <select
                  value={editorData.timeSignature}
                  onChange={e => setEditorData(prev => ({ ...prev, timeSignature: e.target.value }))}
                  className={styles.select}
                >
                  {TIME_SIG_OPTIONS.map(ts => <option key={ts} value={ts}>{ts}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Capo</label>
                <input
                  type="number"
                  value={editorData.capo}
                  onChange={e => setEditorData(prev => ({ ...prev, capo: e.target.value }))}
                  min={0} max={12}
                  className={styles.input}
                />
              </div>
            </div>
          </section>

          {/* Media Links */}
          <section className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Media Links</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Backing Track URL</label>
                <input
                  type="url"
                  value={editorData.backingTrackUrl}
                  onChange={e => setEditorData(prev => ({ ...prev, backingTrackUrl: e.target.value }))}
                  placeholder="https://example.com/track.mp3"
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>YouTube URL</label>
                <input
                  type="url"
                  value={editorData.youtubeUrl}
                  onChange={e => setEditorData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                  className={styles.input}
                />
              </div>
            </div>
          </section>

          {/* Lesson Content */}
          <section className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Lesson Content</h3>
            <p className={styles.sectionHint}>
              Use ChordPro format: <code>[Am]Lyrics go [G]here</code>. Section headers: <code>[Verse]</code>, <code>[Chorus]</code>, etc.
            </p>
            <textarea
              value={editorData.content}
              onChange={e => setEditorData(prev => ({ ...prev, content: e.target.value }))}
              placeholder={`[Intro]\n[Em7]   [G]   [Dsus4]   [A7sus4]\n\n[Verse]\n[Em7]Today is gonna be the day\nThat they're [G]gonna throw it back to [Dsus4]you\n[A7sus4]By now you should've somehow\nRealized [Em7]what you gotta [G]do`}
              className={styles.contentTextarea}
              rows={16}
            />
          </section>

          {/* Structured Blocks */}
          <section className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Content Blocks <span className={styles.sectionOptional}>(optional)</span></h3>
            <p className={styles.sectionHint}>Add structured blocks for advanced DAW-aligned layouts. These override the content field above when present.</p>
            
            <div className={styles.blockList}>
              {editorData.blocks.map((block, i) => (
                <div key={i} className={styles.block}>
                  <div className={styles.blockHeader}>
                    <span className={styles.blockType}>{block.type === 'lyrics' ? '🎤 Lyrics' : '🎸 Tab'}</span>
                    <div className={styles.blockControls}>
                      <button className={styles.smallBtn} onClick={() => moveBlock(i, -1)} disabled={i === 0}>↑</button>
                      <button className={styles.smallBtn} onClick={() => moveBlock(i, 1)} disabled={i === editorData.blocks.length - 1}>↓</button>
                      <button className={`${styles.smallBtn} ${styles.dangerBtn}`} onClick={() => removeBlock(i)}>×</button>
                    </div>
                  </div>
                  <textarea
                    value={block.data}
                    onChange={e => updateBlock(i, e.target.value)}
                    placeholder={block.type === 'lyrics' ? 'Enter lyrics with [Chord] annotations...' : 'e|---\nB|---\nG|---\nD|---\nA|---\nE|---'}
                    className={styles.blockTextarea}
                    rows={block.type === 'tabs' ? 8 : 4}
                  />
                </div>
              ))}
            </div>

            <div className={styles.addBlockRow}>
              <button className={styles.secondaryBtn} onClick={() => addBlock('lyrics')}>
                + Lyrics Block
              </button>
              <button className={styles.secondaryBtn} onClick={() => addBlock('tabs')}>
                + Tab Block
              </button>
            </div>
          </section>

          {/* Monetization */}
          <section className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Monetization</h3>
            <div className={styles.monetizeRow}>
              <button
                className={`${styles.monetizeToggleBtn} ${editorData.monetized ? styles.monetizeActive : ''}`}
                onClick={() => setEditorData(prev => ({ ...prev, monetized: !prev.monetized }))}
              >
                {editorData.monetized ? <ToggleOnIcon size={24} /> : <ToggleOffIcon size={24} />}
                <span>{editorData.monetized ? 'Monetized' : 'Free Lesson'}</span>
              </button>
              {editorData.monetized && (
                <div className={styles.priceGroup}>
                  <label>Price ($)</label>
                  <input
                    type="number"
                    value={editorData.price}
                    onChange={e => setEditorData(prev => ({ ...prev, price: e.target.value }))}
                    min={0} step={0.01}
                    className={styles.priceInput}
                    placeholder="9.99"
                  />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    )
  }

  // ===== ANALYTICS TAB =====
  function renderAnalyticsTab() {
    return (
      <div className={styles.analyticsTab}>
        <div className={styles.tabHeader}>
          <h2>Analytics</h2>
        </div>

        {!stats ? (
          <div className={styles.loadingState}>Loading analytics...</div>
        ) : (
          <>
            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.statPurple}`}>
                <div className={styles.statValue}>{stats.lessonCount}</div>
                <div className={styles.statLabel}>Total Lessons</div>
                <BookIcon size={32} />
              </div>
              <div className={`${styles.statCard} ${styles.statGreen}`}>
                <div className={styles.statValue}>{stats.monetizedCount}</div>
                <div className={styles.statLabel}>Monetized</div>
                <DollarIcon size={32} />
              </div>
              <div className={`${styles.statCard} ${styles.statBlue}`}>
                <div className={styles.statValue}>{stats.totalSales}</div>
                <div className={styles.statLabel}>Total Sales</div>
                <ChartIcon size={32} />
              </div>
              <div className={`${styles.statCard} ${styles.statPink}`}>
                <div className={styles.statValue}>${(stats.totalRevenue || 0).toFixed(2)}</div>
                <div className={styles.statLabel}>Revenue</div>
                <DollarIcon size={32} />
              </div>
              <div className={`${styles.statCard} ${styles.statAmber}`}>
                <div className={styles.statValue}>
                  {stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)} ★` : '—'}
                </div>
                <div className={styles.statLabel}>Avg Rating</div>
                <MusicNoteIcon size={32} />
              </div>
            </div>

            {/* Lesson Breakdown */}
            <div className={styles.breakdownSection}>
              <h3>Lesson Breakdown</h3>
              <div className={styles.breakdownBar}>
                {stats.lessonCount > 0 ? (
                  <>
                    <div 
                      className={styles.barFree} 
                      style={{ width: `${((stats.lessonCount - stats.monetizedCount) / stats.lessonCount) * 100}%` }}
                    >
                      {stats.lessonCount - stats.monetizedCount} Free
                    </div>
                    <div 
                      className={styles.barMonetized} 
                      style={{ width: `${(stats.monetizedCount / stats.lessonCount) * 100}%` }}
                    >
                      {stats.monetizedCount} Paid
                    </div>
                  </>
                ) : (
                  <div className={styles.barEmpty}>No lessons yet</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    )
  }
}
