import { useState, useEffect } from 'react'
import './App.css'
import Auth from './components/Auth'
import { transposeChordPro } from './utils/chords'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [bpm, setBpm] = useState(120)
  const [semitones, setSemitones] = useState(0)
  const [sampleSong, setSampleSong] = useState('[C]Hello [G]world')

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  if (!token) return <Auth onAuth={setToken} />

  return (
    <div className="app">
      <header>
        <h1>GuitarBuddy</h1>
        <div>
          <button onClick={() => { setToken(null) }}>Logout</button>
        </div>
      </header>
      <main>
        <section>
          <h2>Playback</h2>
          <div>
            <label>BPM</label>
            <input type="number" value={bpm} onChange={(e) => setBpm(Number(e.target.value))} />
          </div>
        </section>

        <section>
          <h2>Chord Transpose</h2>
          <div>
            <label>Semitones</label>
            <input type="number" value={semitones} onChange={(e) => setSemitones(Number(e.target.value))} />
          </div>
          <pre className="song">{transposeChordPro(sampleSong, semitones)}</pre>
        </section>
      </main>
    </div>
  )
}

export default App
