import { useState, useEffect } from 'react'
import styles from './App.module.css'
import Auth from './components/Auth'
import { transposeChordPro } from './utils/chords'
import useMetronome from './hooks/useMetronome'
import useWebSocket from './hooks/useWebSocket'
import { save, load } from './utils/storage'
import Nav from './components/Nav'
import { getSongs, createSong, getSetlists, createSetlist } from './api'
import SongEditor from './components/SongEditor'
import ChordDiagram from './components/ChordDiagram'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [bpm, setBpm] = useState(120)
  const [semitones, setSemitones] = useState(0)
  const [sampleSong, setSampleSong] = useState('[C]Hello [G]world')
  const [metronomeOn, setMetronomeOn] = useState(false)
  const [view, setView] = useState('dashboard')
  const [songsList, setSongsList] = useState([])
  const [setlistsList, setSetlistsList] = useState([])

  useMetronome(bpm, metronomeOn, () => {
    // could update UI on tick
  })

  // create or join session
  const [sessionList, setSessionList] = useState([])
  const ws = useWebSocket('/', (msg) => {
    if (msg && msg.type === 'session:update') {
      // naive merge/update
      setSessionList((prev) => {
        const idx = prev.findIndex((s) => s.sessionId === msg.payload.sessionId)
        if (idx === -1) return prev.concat([msg.payload])
        const copy = prev.slice(); copy[idx] = msg.payload; return copy
      })
    }
  }, { token })

  async function fetchActiveSessions() {
    try {
      const res = await fetch((import.meta.env.VITE_API_BASE || '') + '/api/sessions/active')
      const list = await res.json()
      setSessionList(list)
    } catch (e) {
      console.warn('fetch sessions failed', e.message)
    }
  }

  useEffect(() => { fetchActiveSessions() }, [])

  async function createSession() {
    const sessionId = 's_' + Math.random().toString(36).slice(2, 9)
    const payload = { sessionId, songId: (songsList[0] && songsList[0]._id) || null, position: 0, bpm }
    ws.send({ type: 'session:update', payload })
    // persist via API
    await fetch((import.meta.env.VITE_API_BASE || '') + '/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ sessionId, payload }) })
    setSessionList((p) => p.concat([payload]))
  }

  async function joinSession(sid) {
    // naive join: open WS already connected with token, client should sync the session
    alert('Joined session ' + sid)
  }

  useWebSocket('/', (msg) => {
    // handle session updates broadcast from server
    if (msg && msg.type === 'session:update') {
      console.log('remote session update', msg.payload)
    }
  })

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    // load last bpm from storage
    const s = load('prefs')
    if (s && s.bpm) setBpm(s.bpm)
  }, [])

  useEffect(() => {
    save('prefs', { bpm })
  }, [bpm])

  useEffect(() => {
    // attempt to get /api/me to validate token
    async function validate() {
      try {
        const res = await fetch((import.meta.env.VITE_API_BASE || '') + '/api/me', { headers: { Authorization: 'Bearer ' + token } })
        if (!res.ok) throw new Error('invalid')
      } catch (e) {
        setToken(null)
      }
    }
    if (token) validate()
  }, [token])

  useEffect(() => {
    async function loadData() {
      try {
        const s = await getSongs(token)
        setSongsList(s)
      } catch (e) {}
      try {
        const sl = await getSetlists(token)
        setSetlistsList(sl)
      } catch (e) {}
    }
    if (token) loadData()
  }, [token])

  async function handleCreateSong() {
    const title = prompt('Song title')
    if (!title) return
    const body = { title, content: sampleSong, tempo: bpm }
    const r = await createSong(token, body)
    if (r && r.id) setSongsList((p) => p.concat([{ _id: r.id, ...body }]))
  }

  async function handleCreateSetlist() {
    const name = prompt('Setlist name')
    if (!name) return
    const r = await createSetlist(token, { name, songs: songsList.map((s) => s._id) })
    if (r && r.id) setSetlistsList((p) => p.concat([{ _id: r.id, name, songs: songsList.map((s) => s._id) }]))
  }

  if (!token) return <Auth onAuth={setToken} />

  return (
    <div className={styles.app}>
      <header>
        <h1>GuitarBuddy</h1>
        <div>
          <button className={styles.logoutButton} onClick={() => { setToken(null) }}>Logout</button>
        </div>
      </header>

      <Nav view={view} setView={setView} />

      <main>
        {view === 'dashboard' && (
          <section>
            <h2>Dashboard</h2>
            <div>
              <label>BPM</label>
              <input type="number" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
              <label style={{ marginLeft: 10 }}>Metronome</label>
              <input type="checkbox" checked={metronomeOn} onChange={(e) => setMetronomeOn(e.target.checked)} />
            </div>
          </section>
        )}

        {view === 'songs' && (
          <section>
            <h2>Songs</h2>
            <button onClick={handleCreateSong}>Create song (prompt)</button>
            <div style={{ marginTop: 12 }}>
              <h3>Quick editor</h3>
              <SongEditor initial={sampleSong} onSave={async (payload) => {
                const r = await createSong(token, { title: payload.title || 'Untitled', content: payload.content || payload, tempo: bpm });
                if (r && r.id) setSongsList((p) => p.concat([{ _id: r.id, title: payload.title || 'Untitled', content: payload.content || payload, tempo: bpm }]))
              }} />
            </div>
            <ul>
              {songsList.map((s) => (
                <li key={String(s._id)}>
                  <strong>{s.title}</strong> — {s.tempo || ''}
                  <pre className={styles.song}>{s.content || ''}</pre>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {/* find chord tokens in content e.g. [C] */}
                    {Array.from((s.content || '').matchAll(/\[([^\]]+)\]/g)).slice(0,6).map((m, idx) => (
                      <div key={idx} style={{ width: 120 }}>
                        <div style={{ color: '#ddd' }}>{m[1]}</div>
                        <ChordDiagram token={m[1]} />
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {view === 'setlists' && (
          <section>
            <h2>Setlists</h2>
            <button onClick={handleCreateSetlist}>Create setlist</button>
            <ul>
              {setlistsList.map((s) => (
                <li key={String(s._id)}>
                  <strong>{s.name}</strong>
                  <div>{(s.songs || []).length} songs</div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {view === 'sessions' && (
          <section>
            <h2>Active Sessions</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={createSession}>Create Session</button>
              <button onClick={fetchActiveSessions}>Refresh</button>
            </div>
            <ul>
              {sessionList.map((s) => (
                <li key={s.sessionId}>
                  <strong>{s.sessionId}</strong> — song: {s.songId || 'none'} — bpm: {s.payload?.bpm || s.bpm || ''}
                  <button onClick={() => joinSession(s.sessionId)}>Join</button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
