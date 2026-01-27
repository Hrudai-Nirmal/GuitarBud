import { useState, useEffect } from 'react'
import styles from './App.module.css'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Practice from './components/Practice'
import Tuner from './components/Tuner'
import ChordCharts from './components/ChordCharts'
import { apiFetch } from './api'
import { save, load } from './utils/storage'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'student')
  const [view, setView] = useState('dashboard')

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
    }
  }, [token])

  useEffect(() => {
    if (userRole) localStorage.setItem('userRole', userRole)
  }, [userRole])

  // Validate token on mount
  useEffect(() => {
    async function validate() {
      try {
        const data = await apiFetch('/api/me', token)
        if (data && data.role) setUserRole(data.role)
      } catch (e) {
        setToken(null)
      }
    }
    if (token) validate()
  }, [token])

  function handleAuth(authToken, role) {
    setToken(authToken)
    if (role) setUserRole(role)
  }

  function handleLogout() {
    setToken(null)
    setUserRole('student')
    setView('dashboard')
  }

  if (!token) return <Auth onAuth={handleAuth} />

  // All views except dashboard show header; dashboard is full-screen bento
  const showHeader = view !== 'dashboard'

  return (
    <div className={styles.app}>
      {showHeader && (
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => setView('dashboard')}>
            ← Back
          </button>
          <h1 className={styles.logo}>🎸 GuitarBuddy</h1>
          <div className={styles.headerRight}>
            <span className={styles.roleTag}>{userRole}</span>
            <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
          </div>
        </header>
      )}

      {view === 'dashboard' && (
        <Dashboard 
          onNavigate={setView} 
          userRole={userRole}
          onLogout={handleLogout}
        />
      )}

      {view === 'practice' && (
        <Practice 
          token={token}
        />
      )}

      {view === 'downloads' && (
        <div className={styles.placeholder}>
          <div className={styles.placeholderContent}>
            <span className={styles.placeholderIcon}>⬇️</span>
            <h2>Downloaded Lessons</h2>
            <p>Your offline lessons will appear here.</p>
          </div>
        </div>
      )}

      {view === 'performance' && (
        <div className={styles.placeholder}>
          <div className={styles.placeholderContent}>
            <span className={styles.placeholderIcon}>🎤</span>
            <h2>Performance Mode</h2>
            <p>Song Editor, Setlist Editor, Sessions — Coming soon...</p>
          </div>
        </div>
      )}

      {view === 'tuner' && (
        <Tuner />
      )}

      {view === 'chords' && (
        <ChordCharts />
      )}

      {view === 'mylessons' && (
        <div className={styles.placeholder}>
          <div className={styles.placeholderContent}>
            <span className={styles.placeholderIcon}>📚</span>
            <h2>My Lessons</h2>
            <p>Your purchased lessons will appear here.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
