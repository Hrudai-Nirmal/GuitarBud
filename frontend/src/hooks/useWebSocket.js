import { useEffect, useRef } from 'react'

// Hook: useWebSocket(path, onMessage, options = {})
// - path: e.g. '/ws' or '/'; appended to API base
// - onMessage: function(parsedMessage)
// - options: { token: string }
export default function useWebSocket(path, onMessage, options = {}) {
  const { token } = options || {}
  const wsRef = useRef(null)
  const reconnectRef = useRef(0)
  const shouldReconnect = useRef(true)

  useEffect(() => {
    const baseHttp = (import.meta.env.VITE_API_BASE || 'http://localhost:4000')
    const base = baseHttp.replace(/^http/, 'ws')
    const url = base + path + (token ? (`?token=${encodeURIComponent(token)}`) : '')
    let mounted = true

    function connect() {
      if (!mounted) return
      try {
        const ws = new WebSocket(url)
        wsRef.current = ws

        ws.addEventListener('open', () => {
          reconnectRef.current = 0
          // console.log('ws open', url)
        })

        ws.addEventListener('message', (ev) => {
          try {
            const data = JSON.parse(ev.data)
            if (typeof onMessage === 'function') onMessage(data)
          } catch (e) {
            console.warn('ws parse error', e.message)
          }
        })

        ws.addEventListener('close', () => {
          wsRef.current = null
          if (shouldReconnect.current) {
            const t = Math.min(30000, 1000 * Math.pow(1.5, reconnectRef.current))
            reconnectRef.current += 1
            setTimeout(connect, t)
          }
        })

        ws.addEventListener('error', () => {
          // errors will trigger close
        })
      } catch (e) {
        setTimeout(connect, 1000)
      }
    }

    connect()

    return () => {
      mounted = false
      shouldReconnect.current = false
      if (wsRef.current) {
        try { wsRef.current.close() } catch (e) {}
        wsRef.current = null
      }
    }
  }, [path, onMessage, token])

  function send(obj) {
    try {
      const ws = wsRef.current
      if (!ws || ws.readyState !== WebSocket.OPEN) return false
      ws.send(JSON.stringify(obj))
      return true
    } catch (e) {
      return false
    }
  }

  return { send, getSocket: () => wsRef.current }
}
