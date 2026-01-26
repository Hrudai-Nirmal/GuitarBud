import React from 'react'

export default function Nav({ view, setView }) {
  return (
    <nav style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
      <button onClick={() => setView('dashboard')} disabled={view === 'dashboard'}>Dashboard</button>
      <button onClick={() => setView('songs')} disabled={view === 'songs'}>Songs</button>
      <button onClick={() => setView('setlists')} disabled={view === 'setlists'}>Setlists</button>
      <button onClick={() => setView('sessions')} disabled={view === 'sessions'}>Sessions</button>
    </nav>
  )
}
