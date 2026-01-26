import { useState, useEffect } from 'react'
import styles from './App.module.css'
import Auth from './components/Auth'
import { transposeChordPro } from './utils/chords'
import useMetronome from './hooks/useMetronome'
import useWebSocket from './hooks/useWebSocket'
import { save, load } from './utils/storage'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [bpm, setBpm] = useState(120)
  const [semitones, setSemitones] = useState(0)
  const [sampleSong, setSampleSong] = useState('[C]Hello [G]world')
  const [metronomeOn, setMetronomeOn] = useState(false)

  useMetronome(bpm, metronomeOn, () => {
    // could update UI on tick
  })

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

  if (!token) return <Auth onAuth={setToken} />

  return (
    <div className={styles.app}>
      <header>
        <h1>GuitarBuddy</h1>
        <div>
          <button className={styles.logoutButton} onClick={() => { setToken(null) }}>Logout</button>
        </div>
      </header>
      <main>
        <section>
          <h2>Playback</h2>
          <div className={styles.playbackControls}>
            <label>BPM</label>
            <input type="number" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
            <button onClick={() => setMetronomeOn(!metronomeOn)}>
              {metronomeOn ? 'Stop' : 'Start'}
            </button>
          </div>
        </section>

        <section>
          <h2>Chord Transpose</h2>
          <div>
            <label>Semitones</label>
            <input type="number" value={semitones} onChange={(e) => setSemitones(Number(e.target.value))} />
          </div>
          <pre className={styles.song}>{transposeChordPro(sampleSong, semitones)}</pre>
        </section>
      </main>
    </div>
  )
}

export default App
