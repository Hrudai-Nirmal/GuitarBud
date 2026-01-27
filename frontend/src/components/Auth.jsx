import { useState } from 'react'
import styles from './Auth.module.css'

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [role, setRole] = useState('student')
  const [resumeFile, setResumeFile] = useState(null)
  const [resetMode, setResetMode] = useState('request') // or 'confirm'
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError(null)
    if (mode === 'login') {
      const url = '/auth/login'
      try {        const res = await fetch((import.meta.env.VITE_API_BASE || '').replace(/\/+$/, '') + url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'failed')
        if (mode === 'login') onAuth(data.token, data.role || 'student')
      } catch (e) {
        setError(e.message)
      }
      return
    }

    // register
    const url = '/auth/register'
    try {
      let resumeData = null
      if (resumeFile) {
        resumeData = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(resumeFile)
        })
      }

      const res = await fetch((import.meta.env.VITE_API_BASE || '').replace(/\/+$/, '') + url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, resume: resumeData ? { name: resumeFile.name, data: resumeData } : null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'failed')
      // if register returned a verifyToken in dev, automatically verify
      if (data.verifyToken) {
        await fetch((import.meta.env.VITE_API_BASE || '') + '/auth/verify', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: data.verifyToken })
        })
      }
      setMode('login')
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleRequestReset(e) {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch((import.meta.env.VITE_API_BASE || '') + '/auth/request-reset', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'failed')
      // in dev the resetToken may be returned
      if (data.resetToken) {
        setResetToken(data.resetToken)
        setResetMode('confirm')
      } else {
        // show instructions
        setResetMode('confirm')
      }
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleConfirmReset(e) {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch((import.meta.env.VITE_API_BASE || '') + '/auth/reset', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: resetToken, password: newPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'failed')
      // back to login
      setMode('login')
      setResetMode('request')
      setNewPassword('')
      setResetToken('')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>

        {mode === 'login' && (
          <form onSubmit={submit} className={styles.form}>
            <input className={styles.input} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={styles.input} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className={styles.btn} type="submit">Login</button>
              <button type="button" className={styles.link} onClick={() => setMode('register')}>Create account</button>
              <button type="button" className={styles.link} onClick={() => setResetMode('request')}>Forgot password?</button>
            </div>
            {resetMode === 'request' && (
              <form onSubmit={handleRequestReset} className={styles.resetForm}>
                <input className={styles.input} placeholder="Email for reset" value={email} onChange={(e) => setEmail(e.target.value)} />
                <button className={styles.btn} onClick={handleRequestReset}>Request reset</button>
              </form>
            )}
            {resetMode === 'confirm' && (
              <form onSubmit={handleConfirmReset} className={styles.resetForm}>
                <input className={styles.input} placeholder="Reset token" value={resetToken} onChange={(e) => setResetToken(e.target.value)} />
                <input className={styles.input} placeholder="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <button className={styles.btn} onClick={handleConfirmReset}>Reset password</button>
              </form>
            )}
            {error && <div className={styles.error}>{error}</div>}
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={submit} className={styles.form}>
            <input className={styles.input} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={styles.input} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

            <div className={styles.row}>
              <label className={styles.label}><input type="radio" name="role" value="student" checked={role === 'student'} onChange={() => setRole('student')} /> Student</label>
              <label className={styles.label}><input type="radio" name="role" value="teacher" checked={role === 'teacher'} onChange={() => setRole('teacher')} /> Teacher</label>
            </div>

            {role === 'teacher' && (
              <div className={styles.row}>
                <label className={styles.label}>Upload resume (PDF)</label>
                <input className={styles.input} type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files && e.target.files[0])} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className={styles.btn} type="submit">Register</button>
              <button type="button" className={styles.link} onClick={() => setMode('login')}>Back to login</button>
            </div>

            {error && <div className={styles.error}>{error}</div>}
          </form>
        )}

      </div>
    </div>
  )
}
