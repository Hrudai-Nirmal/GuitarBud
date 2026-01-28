import React, { useState, useEffect, useRef, useCallback } from 'react'
import styles from './Performance.module.css'
import ChordDiagram from './ChordDiagram'
import { transposeChordPro } from '../utils/chords'
import { save, load } from '../utils/storage'
import useWebSocket from '../hooks/useWebSocket'

// Tabs for performance mode
const TABS = [
  { id: 'setlists', label: 'Setlists', icon: '📋' },
  { id: 'editor', label: 'Song Editor', icon: '✏️' },
  { id: 'sessions', label: 'Sessions', icon: '👥' },
  { id: 'perform', label: 'Perform', icon: '🎤' },
]

// Default empty setlist
const DEFAULT_SETLIST = { id: Date.now(), name: 'New Setlist', songs: [] }

// Extract chords from ChordPro content
function extractChords(content) {
  const matches = content?.match(/\[([^\]]+)\]/g) || []
  const unique = [...new Set(matches.map(m => m.slice(1, -1)))]
  // Filter out section headers
  const sectionKeywords = ['intro', 'verse', 'chorus', 'bridge', 'outro', 'pre-chorus', 'interlude', 'solo', 'tab', 'riff']
  return unique.filter(c => !sectionKeywords.some(k => c.toLowerCase().includes(k)))
}

export default function Performance({ token }) {
  const [activeTab, setActiveTab] = useState('setlists')
  const [setlists, setSetlists] = useState([])
  const [activeSetlist, setActiveSetlist] = useState(null)
  const [songs, setSongs] = useState([]) // Custom songs library
  const [editingSong, setEditingSong] = useState(null)
  const [performingSetlist, setPerformingSetlist] = useState(null)
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [transpose, setTranspose] = useState(0)
  const [fontSize, setFontSize] = useState(18)
  const [autoScroll, setAutoScroll] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState(1)
  const scrollRef = useRef(null)
  const scrollIntervalRef = useRef(null)

  // Session state
  const [sessionCode, setSessionCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [isHost, setIsHost] = useState(false)
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionParticipants, setSessionParticipants] = useState([])
  const [sessionStatus, setSessionStatus] = useState('') // 'connecting', 'connected', 'error'
  const [sessionError, setSessionError] = useState('')
  const lastSyncRef = useRef(null) // Prevent echo

  // Generate random session code
  function generateSessionCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  // WebSocket message handler
  const handleWsMessage = useCallback((data) => {
    if (data.type === 'session_created') {
      setSessionCode(data.code)
      setSessionActive(true)
      setSessionStatus('connected')
      setIsHost(true)
    } else if (data.type === 'session_joined') {
      setSessionCode(data.code)
      setSessionActive(true)
      setSessionStatus('connected')
      setSessionParticipants(data.participants || [])
      // If joining, receive current state (transpose is local, not synced)
      if (data.setlist) {
        setPerformingSetlist(data.setlist)
        setCurrentSongIndex(data.songIndex || 0)
        setActiveTab('perform')
        // Sync to host's scroll position after a short delay (wait for render)
        if (data.scrollPosition !== undefined) {
          setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTop = data.scrollPosition
            }
          }, 100)
        }
      }
    } else if (data.type === 'participant_joined') {
      setSessionParticipants(data.participants || [])
    } else if (data.type === 'participant_left') {
      setSessionParticipants(data.participants || [])
    } else if (data.type === 'sync_state') {
      // Prevent processing our own sync messages
      if (data.senderId === lastSyncRef.current) return
      // Sync state from host (transpose is NOT synced - each member controls their own)
      if (data.songIndex !== undefined) setCurrentSongIndex(data.songIndex)
      if (data.setlist) setPerformingSetlist(data.setlist)
      // Sync scroll position directly (mirror host's actual scroll position)
      if (data.scrollPosition !== undefined && scrollRef.current) {
        scrollRef.current.scrollTop = data.scrollPosition
      }
    } else if (data.type === 'session_ended') {
      setSessionActive(false)
      setSessionCode('')
      setSessionStatus('')
      setSessionParticipants([])
      setIsHost(false)
      // Show notification that session ended
      alert('The session has ended.')
      setActiveTab('sessions')
    } else if (data.type === 'error') {
      setSessionError(data.message)
      setSessionStatus('error')
    }
  }, [])

  // WebSocket connection - connect to main ws endpoint when session is needed
  const wsPath = sessionActive || sessionStatus === 'connecting' ? '/' : null
  const { send } = useWebSocket(wsPath, handleWsMessage, { token })

  // Pending session action ref (for create/join after ws connects)
  const pendingSessionAction = useRef(null)

  // Handle pending session action when ws becomes available
  useEffect(() => {
    if (sessionStatus === 'connecting' && pendingSessionAction.current) {
      // Wait a bit for WebSocket to connect, then send
      const timer = setTimeout(() => {
        if (pendingSessionAction.current) {
          const success = send(pendingSessionAction.current)
          if (!success) {
            // Retry after another delay
            setTimeout(() => {
              if (pendingSessionAction.current) {
                send(pendingSessionAction.current)
                pendingSessionAction.current = null
              }
            }, 1000)
          } else {
            pendingSessionAction.current = null
          }
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [sessionStatus, send])

  // Sync state to participants when host changes song
  useEffect(() => {
    if (sessionActive && isHost && performingSetlist) {
      const syncId = Date.now().toString()
      lastSyncRef.current = syncId
      send({
        type: 'sync_state',
        code: sessionCode,
        senderId: syncId,
        songIndex: currentSongIndex,
        setlist: performingSetlist,
      })
    }
  }, [currentSongIndex, performingSetlist, sessionActive, isHost, sessionCode, send])

  // Sync scroll position from host to participants (throttled)
  const lastScrollSync = useRef(0)
  useEffect(() => {
    if (!sessionActive || !isHost || !scrollRef.current) return
    
    const handleScroll = () => {
      const now = Date.now()
      // Throttle to max 10 updates per second
      if (now - lastScrollSync.current < 100) return
      lastScrollSync.current = now
      
      const syncId = Date.now().toString()
      lastSyncRef.current = syncId
      send({
        type: 'sync_state',
        code: sessionCode,
        senderId: syncId,
        scrollPosition: scrollRef.current.scrollTop,
      })
    }
    
    const scrollEl = scrollRef.current
    scrollEl.addEventListener('scroll', handleScroll)
    return () => scrollEl.removeEventListener('scroll', handleScroll)
  }, [sessionActive, isHost, sessionCode, send])

  // Load saved data on mount
  useEffect(() => {
    const savedSetlists = load('performanceSetlists') || []
    const savedSongs = load('performanceSongs') || []
    setSetlists(savedSetlists)
    setSongs(savedSongs)
  }, [])

  // Save setlists when changed
  useEffect(() => {
    if (setlists.length > 0) {
      save('performanceSetlists', setlists)
    }
  }, [setlists])

  // Save songs when changed
  useEffect(() => {
    if (songs.length > 0) {
      save('performanceSongs', songs)
    }
  }, [songs])

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollIntervalRef.current = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop += scrollSpeed
        }
      }, 50)
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current)
      }
    }
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current)
      }
    }
  }, [autoScroll, scrollSpeed])

  // ========== Setlist Functions ==========
  function createSetlist() {
    const newSetlist = { ...DEFAULT_SETLIST, id: Date.now(), name: `Setlist ${setlists.length + 1}` }
    setSetlists([...setlists, newSetlist])
    setActiveSetlist(newSetlist)
  }

  function updateSetlistName(id, name) {
    setSetlists(setlists.map(s => s.id === id ? { ...s, name } : s))
    if (activeSetlist?.id === id) {
      setActiveSetlist({ ...activeSetlist, name })
    }
  }

  function deleteSetlist(id) {
    setSetlists(setlists.filter(s => s.id !== id))
    if (activeSetlist?.id === id) {
      setActiveSetlist(null)
    }
  }

  function addSongToSetlist(song) {
    if (!activeSetlist) return
    const updated = { ...activeSetlist, songs: [...activeSetlist.songs, { ...song, setlistOrder: activeSetlist.songs.length }] }
    setSetlists(setlists.map(s => s.id === activeSetlist.id ? updated : s))
    setActiveSetlist(updated)
  }

  function removeSongFromSetlist(index) {
    if (!activeSetlist) return
    const newSongs = activeSetlist.songs.filter((_, i) => i !== index)
    const updated = { ...activeSetlist, songs: newSongs }
    setSetlists(setlists.map(s => s.id === activeSetlist.id ? updated : s))
    setActiveSetlist(updated)
  }

  function moveSong(index, direction) {
    if (!activeSetlist) return
    const newSongs = [...activeSetlist.songs]
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= newSongs.length) return
    ;[newSongs[index], newSongs[newIndex]] = [newSongs[newIndex], newSongs[index]]
    const updated = { ...activeSetlist, songs: newSongs }
    setSetlists(setlists.map(s => s.id === activeSetlist.id ? updated : s))
    setActiveSetlist(updated)
  }

  // ========== Song Editor Functions ==========
  function createNewSong() {
    const newSong = {
      id: Date.now(),
      title: 'New Song',
      artist: '',
      key: 'C',
      bpm: 120,
      content: '[Verse]\n[C]Sample [G]lyrics [Am]here\n\n[Chorus]\n[F]Chorus [C]line',
    }
    setEditingSong(newSong)
    setActiveTab('editor')
  }

  function saveSong(song) {
    const existing = songs.find(s => s.id === song.id)
    if (existing) {
      setSongs(songs.map(s => s.id === song.id ? song : s))
    } else {
      setSongs([...songs, song])
    }
    setEditingSong(null)
  }

  function deleteSong(id) {
    setSongs(songs.filter(s => s.id !== id))
    if (editingSong?.id === id) {
      setEditingSong(null)
    }
  }

  // ========== Performance Functions ==========
  function startPerformance(setlist) {
    setPerformingSetlist(setlist)
    setCurrentSongIndex(0)
    setTranspose(0)
    setActiveTab('perform')
  }

  function nextSong() {
    if (performingSetlist && currentSongIndex < performingSetlist.songs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1)
      setTranspose(0)
      setAutoScroll(false)
      if (scrollRef.current) scrollRef.current.scrollTop = 0
    }
  }

  function prevSong() {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1)
      setTranspose(0)
      setAutoScroll(false)
      if (scrollRef.current) scrollRef.current.scrollTop = 0
    }
  }

  function exitPerformance() {
    setPerformingSetlist(null)
    setAutoScroll(false)
    if (sessionActive) {
      // End session if host, or leave if participant
      if (isHost) {
        send({ type: 'end_session', code: sessionCode })
      } else {
        send({ type: 'leave_session', code: sessionCode })
      }
      setSessionActive(false)
      setSessionCode('')
      setIsHost(false)
      setSessionParticipants([])
    }
    setActiveTab('setlists')
  }

  // ========== Session Functions ==========
  function createSession(setlist) {
    const code = generateSessionCode()
    setSessionStatus('connecting')
    setSessionError('')
    
    // Store pending action - will be sent once WebSocket connects
    pendingSessionAction.current = {
      type: 'create_session',
      code,
      setlist,
      songIndex: 0,
      transpose: 0,
    }
    
    setPerformingSetlist(setlist)
    setCurrentSongIndex(0)
    setTranspose(0)
    setActiveTab('perform')
  }

  function joinSession() {
    if (!joinCode.trim()) {
      setSessionError('Please enter a session code')
      return
    }
    setSessionStatus('connecting')
    setSessionError('')
    
    // Store pending action - will be sent once WebSocket connects
    pendingSessionAction.current = {
      type: 'join_session',
      code: joinCode.toUpperCase().trim(),
    }
  }

  function leaveSession() {
    if (sessionActive) {
      send({ type: 'leave_session', code: sessionCode })
      setSessionActive(false)
      setSessionCode('')
      setSessionParticipants([])
      setSessionStatus('')
    }
  }

  function endSession() {
    if (sessionActive && isHost) {
      send({ type: 'end_session', code: sessionCode })
      setSessionActive(false)
      setSessionCode('')
      setIsHost(false)
      setSessionParticipants([])
      setSessionStatus('')
    }
  }

  const currentSong = performingSetlist?.songs[currentSongIndex]
  const transposedContent = currentSong ? transposeChordPro(currentSong.content || '', transpose) : ''
  const chords = extractChords(transposedContent)

  // ========== Render Functions ==========
  function renderSetlistsTab() {
    return (
      <div className={styles.setlistsContainer}>
        <div className={styles.setlistsSidebar}>
          <div className={styles.sidebarHeader}>
            <h3>My Setlists</h3>
            <button className={styles.addBtn} onClick={createSetlist}>+ New</button>
          </div>
          <div className={styles.setlistList}>
            {setlists.length === 0 && (
              <p className={styles.emptyText}>No setlists yet. Create one to get started!</p>
            )}
            {setlists.map(setlist => (
              <div 
                key={setlist.id}
                className={`${styles.setlistItem} ${activeSetlist?.id === setlist.id ? styles.active : ''}`}
                onClick={() => setActiveSetlist(setlist)}
              >
                <span className={styles.setlistName}>{setlist.name}</span>
                <span className={styles.songCount}>{setlist.songs.length} songs</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.setlistMain}>
          {!activeSetlist ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📋</span>
              <h2>Select or Create a Setlist</h2>
              <p>Organize your songs for gigs and practice sessions</p>
              <button className={styles.primaryBtn} onClick={createSetlist}>Create Setlist</button>
            </div>
          ) : (
            <>
              <div className={styles.setlistHeader}>
                <input
                  type="text"
                  className={styles.setlistTitle}
                  value={activeSetlist.name}
                  onChange={(e) => updateSetlistName(activeSetlist.id, e.target.value)}
                />
                <div className={styles.setlistActions}>
                  <button 
                    className={styles.performBtn}
                    onClick={() => startPerformance(activeSetlist)}
                    disabled={activeSetlist.songs.length === 0}
                  >
                    🎤 Start Performance
                  </button>
                  <button 
                    className={styles.deleteBtn}
                    onClick={() => deleteSetlist(activeSetlist.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className={styles.setlistContent}>
                <div className={styles.setlistSongs}>
                  <h4>Songs in Setlist</h4>
                  {activeSetlist.songs.length === 0 ? (
                    <p className={styles.emptyText}>Add songs from your library below</p>
                  ) : (
                    <div className={styles.songOrderList}>
                      {activeSetlist.songs.map((song, idx) => (
                        <div key={`${song.id}-${idx}`} className={styles.orderedSong}>
                          <span className={styles.songNumber}>{idx + 1}</span>
                          <div className={styles.songInfo}>
                            <span className={styles.songTitle}>{song.title}</span>
                            <span className={styles.songArtist}>{song.artist || 'Unknown'}</span>
                          </div>
                          <div className={styles.songActions}>
                            <button onClick={() => moveSong(idx, -1)} disabled={idx === 0}>↑</button>
                            <button onClick={() => moveSong(idx, 1)} disabled={idx === activeSetlist.songs.length - 1}>↓</button>
                            <button onClick={() => removeSongFromSetlist(idx)}>✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.songLibrary}>
                  <div className={styles.libraryHeader}>
                    <h4>Song Library</h4>
                    <button className={styles.addBtn} onClick={createNewSong}>+ New Song</button>
                  </div>
                  {songs.length === 0 ? (
                    <p className={styles.emptyText}>No songs in library. Create one!</p>
                  ) : (
                    <div className={styles.librarySongList}>
                      {songs.map(song => (
                        <div key={song.id} className={styles.librarySong}>
                          <div className={styles.songInfo}>
                            <span className={styles.songTitle}>{song.title}</span>
                            <span className={styles.songArtist}>{song.artist || 'Unknown'}</span>
                          </div>
                          <div className={styles.songActions}>
                            <button onClick={() => { setEditingSong(song); setActiveTab('editor') }}>✏️</button>
                            <button onClick={() => addSongToSetlist(song)}>+ Add</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  function renderEditorTab() {
    if (!editingSong) {
      return (
        <div className={styles.editorEmpty}>
          <span className={styles.emptyIcon}>✏️</span>
          <h2>Song Editor</h2>
          <p>Create or edit songs with ChordPro format</p>
          <button className={styles.primaryBtn} onClick={createNewSong}>Create New Song</button>
          {songs.length > 0 && (
            <div className={styles.recentSongs}>
              <h4>Edit Existing</h4>
              {songs.slice(0, 5).map(song => (
                <button 
                  key={song.id} 
                  className={styles.recentSongBtn}
                  onClick={() => setEditingSong(song)}
                >
                  {song.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )
    }

    const previewContent = transposeChordPro(editingSong.content || '', 0)
    const previewChords = extractChords(previewContent)

    return (
      <div className={styles.editorContainer}>
        <div className={styles.editorSidebar}>
          <h3>Song Details</h3>
          <label>
            Title
            <input
              type="text"
              value={editingSong.title}
              onChange={(e) => setEditingSong({ ...editingSong, title: e.target.value })}
            />
          </label>
          <label>
            Artist
            <input
              type="text"
              value={editingSong.artist || ''}
              onChange={(e) => setEditingSong({ ...editingSong, artist: e.target.value })}
            />
          </label>
          <label>
            Key
            <select
              value={editingSong.key || 'C'}
              onChange={(e) => setEditingSong({ ...editingSong, key: e.target.value })}
            >
              {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </label>
          <label>
            BPM
            <input
              type="number"
              value={editingSong.bpm || 120}
              onChange={(e) => setEditingSong({ ...editingSong, bpm: Number(e.target.value) })}
              min={40}
              max={240}
            />
          </label>

          <div className={styles.editorActions}>
            <button className={styles.primaryBtn} onClick={() => saveSong(editingSong)}>
              💾 Save Song
            </button>
            <button className={styles.secondaryBtn} onClick={() => setEditingSong(null)}>
              Cancel
            </button>
            <button className={styles.deleteBtn} onClick={() => deleteSong(editingSong.id)}>
              🗑️ Delete
            </button>
          </div>

          <div className={styles.chordProHelp}>
            <h4>ChordPro Format</h4>
            <p><code>[C]</code> - Chord above text</p>
            <p><code>[Verse]</code> - Section header</p>
            <p><code>[Chorus]</code> - Section header</p>
          </div>
        </div>

        <div className={styles.editorMain}>
          <div className={styles.editorPane}>
            <h4>Content (ChordPro)</h4>
            <textarea
              className={styles.contentEditor}
              value={editingSong.content || ''}
              onChange={(e) => setEditingSong({ ...editingSong, content: e.target.value })}
              placeholder="[Verse]
[C]Amazing [G]grace, how [Am]sweet the [F]sound
That [C]saved a [G]wretch like [C]me

[Chorus]
..."
            />
          </div>

          <div className={styles.previewPane}>
            <h4>Preview</h4>
            {previewChords.length > 0 && (
              <div className={styles.previewChords}>
                {previewChords.map((chord, i) => (
                  <div key={i} className={styles.miniChord}>
                    <ChordDiagram token={chord} size={60} />
                    <span>{chord}</span>
                  </div>
                ))}
              </div>
            )}
            <pre className={styles.previewContent}>
              {renderChordProPreview(previewContent)}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  function renderSessionsTab() {
    return (
      <div className={styles.sessionsContainer}>
        <div className={styles.sessionsGrid}>
          {/* Create Session */}
          <div className={styles.sessionCard}>
            <div className={styles.sessionCardHeader}>
              <span className={styles.sessionIcon}>🎵</span>
              <h3>Host a Session</h3>
            </div>
            <p className={styles.sessionDesc}>
              Create a live session and share the code with band members. 
              They'll see the same song and follow along as you perform.
            </p>
            
            {sessionActive && isHost ? (
              <div className={styles.activeSession}>
                <div className={styles.sessionCodeDisplay}>
                  <span className={styles.codeLabel}>Session Code:</span>
                  <span className={styles.codeValue}>{sessionCode}</span>
                  <button 
                    className={styles.copyBtn}
                    onClick={() => {
                      navigator.clipboard.writeText(sessionCode)
                    }}
                  >
                    📋 Copy
                  </button>
                </div>
                <div className={styles.participants}>
                  <span className={styles.participantLabel}>
                    👥 {sessionParticipants.length + 1} connected
                  </span>
                </div>
                <button className={styles.endBtn} onClick={endSession}>
                  End Session
                </button>
              </div>
            ) : (
              <>
                <h4>Select a Setlist to Share:</h4>
                {setlists.length === 0 ? (
                  <p className={styles.emptyText}>Create a setlist first</p>
                ) : (
                  <div className={styles.setlistPicker}>
                    {setlists.map(setlist => (
                      <button
                        key={setlist.id}
                        className={styles.setlistPickerItem}
                        onClick={() => createSession(setlist)}
                        disabled={setlist.songs.length === 0}
                      >
                        <span className={styles.setlistPickerName}>{setlist.name}</span>
                        <span className={styles.setlistPickerCount}>{setlist.songs.length} songs</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Join Session */}
          <div className={styles.sessionCard}>
            <div className={styles.sessionCardHeader}>
              <span className={styles.sessionIcon}>🤝</span>
              <h3>Join a Session</h3>
            </div>
            <p className={styles.sessionDesc}>
              Enter the session code shared by the host to join their live performance.
              You'll see the same songs and stay in sync.
            </p>

            {sessionActive && !isHost ? (
              <div className={styles.activeSession}>
                <div className={styles.sessionCodeDisplay}>
                  <span className={styles.codeLabel}>Connected to:</span>
                  <span className={styles.codeValue}>{sessionCode}</span>
                </div>
                <div className={styles.participants}>
                  <span className={styles.participantLabel}>
                    👥 {sessionParticipants.length + 1} connected
                  </span>
                </div>
                <button className={styles.leaveBtn} onClick={leaveSession}>
                  Leave Session
                </button>
              </div>
            ) : (
              <div className={styles.joinForm}>
                <input
                  type="text"
                  className={styles.codeInput}
                  placeholder="Enter 6-character code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <button 
                  className={styles.joinBtn}
                  onClick={joinSession}
                  disabled={joinCode.length < 6 || sessionStatus === 'connecting'}
                >
                  {sessionStatus === 'connecting' ? 'Connecting...' : 'Join Session'}
                </button>
              </div>
            )}

            {sessionError && (
              <div className={styles.sessionError}>
                ⚠️ {sessionError}
              </div>
            )}
          </div>
        </div>

        {/* Session Info */}
        <div className={styles.sessionInfo}>
          <h4>How Sessions Work</h4>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>1️⃣</span>
              <div>
                <strong>Host creates a session</strong>
                <p>Select a setlist and start hosting. Share the code with your band.</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>2️⃣</span>
              <div>
                <strong>Others join with the code</strong>
                <p>Band members enter the 6-character code to connect.</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>3️⃣</span>
              <div>
                <strong>Stay in sync</strong>
                <p>Everyone sees the same song. Host controls navigation and transpose.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderPerformTab() {
    if (!performingSetlist || !currentSong) {
      return (
        <div className={styles.performEmpty}>
          <span className={styles.emptyIcon}>🎤</span>
          <h2>Performance Mode</h2>
          <p>Start a performance from a setlist</p>
          <button className={styles.secondaryBtn} onClick={() => setActiveTab('setlists')}>
            Go to Setlists
          </button>
        </div>
      )
    }

    return (
      <div className={styles.performContainer}>
        <div className={styles.performHeader}>
          <button className={styles.exitBtn} onClick={exitPerformance}>✕ Exit</button>
          <div className={styles.performTitle}>
            <h1>{currentSong.title}</h1>
            <span className={styles.performArtist}>{currentSong.artist}</span>
          </div>
          <div className={styles.performMeta}>
            {sessionActive && (
              <div className={styles.sessionBadge}>
                <span className={styles.liveDot}></span>
                {isHost ? 'Hosting' : 'Following'}: {sessionCode}
                <span className={styles.participantCount}>👥 {sessionParticipants.length + 1}</span>
              </div>
            )}
            {sessionActive && !isHost && (
              <div className={styles.followingIndicator}>
                📍 Following host's position
              </div>
            )}
            <div className={styles.performProgress}>
              {currentSongIndex + 1} / {performingSetlist.songs.length}
            </div>
          </div>
        </div>

        <div className={styles.performControls}>
          {/* Navigation - only host can control in session */}
          <div className={styles.controlGroup}>
            <button 
              onClick={prevSong} 
              disabled={currentSongIndex === 0 || (sessionActive && !isHost)}
            >
              ◀ Prev
            </button>
            <button 
              onClick={nextSong} 
              disabled={currentSongIndex >= performingSetlist.songs.length - 1 || (sessionActive && !isHost)}
            >
              Next ▶
            </button>
          </div>
          {/* Transpose - only host can control in session */}
          <div className={styles.controlGroup}>
            <label>
              Transpose: 
              <button 
                onClick={() => setTranspose(t => t - 1)}
                disabled={sessionActive && !isHost}
              >-</button>
              <span className={styles.transposeValue}>{transpose >= 0 ? `+${transpose}` : transpose}</span>
              <button 
                onClick={() => setTranspose(t => t + 1)}
                disabled={sessionActive && !isHost}
              >+</button>
            </label>
          </div>
          {/* Font size - local control (not synced) */}
          <div className={styles.controlGroup}>
            <label>
              Font: 
              <button onClick={() => setFontSize(s => Math.max(12, s - 2))}>A-</button>
              <span>{fontSize}px</span>
              <button onClick={() => setFontSize(s => Math.min(36, s + 2))}>A+</button>
            </label>
          </div>
          {/* Auto-scroll - only host can control in session */}
          <div className={styles.controlGroup}>
            <button 
              className={autoScroll ? styles.activeBtn : ''}
              onClick={() => setAutoScroll(!autoScroll)}
              disabled={sessionActive && !isHost}
            >
              {autoScroll ? '⏸ Scroll' : '▶ Scroll'}
            </button>
            {autoScroll && (
              <input
                type="range"
                min={0.5}
                max={5}
                step={0.5}
                value={scrollSpeed}
                onChange={(e) => setScrollSpeed(Number(e.target.value))}
                disabled={sessionActive && !isHost}
              />
            )}
          </div>
        </div>

        {chords.length > 0 && (
          <div className={styles.performChords}>
            {chords.map((chord, i) => (
              <div key={i} className={styles.performChord}>
                <ChordDiagram token={chord} size={70} />
                <span>{chord}</span>
              </div>
            ))}
          </div>
        )}

        <div className={styles.performContent} ref={scrollRef} style={{ fontSize: `${fontSize}px` }}>
          <pre className={styles.performLyrics}>
            {renderChordProPreview(transposedContent)}
          </pre>
        </div>

        <div className={styles.performFooter}>
          <div className={styles.setlistPreview}>
            {performingSetlist.songs.map((song, idx) => (
              <span 
                key={idx} 
                className={`${styles.setlistDot} ${idx === currentSongIndex ? styles.currentDot : ''} ${idx < currentSongIndex ? styles.doneDot : ''}`}
                onClick={() => { setCurrentSongIndex(idx); setTranspose(0); setAutoScroll(false) }}
                title={song.title}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Helper to render ChordPro with styling
  function renderChordProPreview(content) {
    if (!content) return null
    return content.split('\n').map((line, i) => {
      // Check for section headers
      const sectionMatch = line.match(/^\[([^\]]+)\]$/)
      if (sectionMatch) {
        const section = sectionMatch[1].toLowerCase()
        if (['verse', 'chorus', 'bridge', 'intro', 'outro', 'pre-chorus', 'interlude', 'solo'].some(s => section.includes(s))) {
          return <span key={i} className={styles.sectionHeader}>{line}{'\n'}</span>
        }
      }
      
      // Render line with chords
      const parts = line.split(/(\[[^\]]+\])/)
      return (
        <span key={i}>
          {parts.map((part, pi) => {
            if (part.startsWith('[') && part.endsWith(']')) {
              return <span key={pi} className={styles.chordInline}>{part.slice(1, -1)}</span>
            }
            return part
          })}
          {'\n'}
        </span>
      )
    })
  }

  return (
    <div className={styles.container}>
      {/* Tab Navigation */}
      {activeTab !== 'perform' && (
        <div className={styles.tabs}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </div>
      )}      {/* Tab Content */}
      <div className={styles.content}>
        {activeTab === 'setlists' && renderSetlistsTab()}
        {activeTab === 'editor' && renderEditorTab()}
        {activeTab === 'sessions' && renderSessionsTab()}
        {activeTab === 'perform' && renderPerformTab()}
      </div>
    </div>
  )
}
