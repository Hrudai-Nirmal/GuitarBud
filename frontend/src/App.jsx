import { useState, useEffect } from 'react'
import styles from './App.module.css'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Practice from './components/Practice'
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

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>🎸 GuitarBuddy</h1>
        <div className={styles.headerRight}>
          <span className={styles.roleTag}>{userRole}</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {view === 'dashboard' && (
        <Dashboard 
          onNavigate={setView} 
          userRole={userRole}
        />
      )}

      {view === 'practice' && (
        <Practice 
          token={token}
          onBack={() => setView('dashboard')}
        />
      )}

      {view === 'downloads' && (
        <div className={styles.placeholder}>
          <h2>Downloaded Lessons</h2>
          <p>Coming soon...</p>
          <button onClick={() => setView('dashboard')}>Back to Dashboard</button>
        </div>
      )}

      {view === 'performance' && (
        <div className={styles.placeholder}>
          <h2>Performance Mode</h2>
          <p>Song Editor, Setlist Editor, Sessions — Coming soon...</p>
          <button onClick={() => setView('dashboard')}>Back to Dashboard</button>
        </div>
      )}

      {view === 'tuner' && (
        <div className={styles.placeholder}>
          <h2>Tuner</h2>
          <p>Coming soon...</p>
          <button onClick={() => setView('dashboard')}>Back to Dashboard</button>
        </div>
      )}

      {view === 'chords' && (
        <div className={styles.placeholder}>
          <h2>Chord Charts</h2>
          <p>Coming soon...</p>
          <button onClick={() => setView('dashboard')}>Back to Dashboard</button>
        </div>
      )}

      {view === 'mylessons' && (
        <div className={styles.placeholder}>
          <h2>My Lessons</h2>
          <p>Your purchased lessons will appear here.</p>
          <button onClick={() => setView('dashboard')}>Back to Dashboard</button>
        </div>
      )}
    </div>
  )
}

export default App
