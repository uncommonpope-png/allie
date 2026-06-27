import { useEffect, useRef, useCallback } from 'react'
import { useGskStore } from '../stores/gsk-store'

const WS_URL = `ws://${window.location.hostname}:4490/gsk/events`
const REST_BASE = `http://${window.location.hostname}:4490`

export function useGskWebSocket() {
  const wsRef = useRef<WebSocket | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const store = useGskStore()

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${REST_BASE}/api/gsk/status`)
      if (res.ok) {
        const data = await res.json()
        store.setStatus(data)
        store.setConnected(true)
        store.setLastUpdate()
      }
    } catch {
      store.setConnected(false)
    }
  }, [])

  const fetchTimeline = useCallback(async () => {
    try {
      const res = await fetch(`${REST_BASE}/api/gsk/timeline`)
      if (res.ok) {
        const data = await res.json()
        if (data.events) {
          data.events.forEach((e: any) => store.addTimelineEvent(e))
        }
      }
    } catch {}
  }, [])

  const fetchSkills = useCallback(async () => {
    try {
      const res = await fetch(`${REST_BASE}/api/gsk/skills`)
      if (res.ok) {
        const data = await res.json()
        if (data.skills) store.setSkills(data.skills)
      }
    } catch {}
  }, [])

  const fetchCouncil = useCallback(async () => {
    try {
      const res = await fetch(`${REST_BASE}/api/gsk/council`)
      if (res.ok) {
        const data = await res.json()
        if (data.members) store.setCouncil(data.members)
      }
    } catch {}
  }, [])

  const fetchMemory = useCallback(async () => {
    try {
      const res = await fetch(`${REST_BASE}/api/gsk/memory`)
      if (res.ok) {
        const data = await res.json()
        if (data.entries) {
          data.entries.forEach((e: any) => store.addMemoryEntry(e))
        }
      }
    } catch {}
  }, [])

  const connectWebSocket = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        store.setConnected(true)
        fetchStatus()
        fetchTimeline()
        fetchSkills()
        fetchCouncil()
        fetchMemory()
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          store.setLastUpdate()

          switch (msg.type) {
            case 'status':
              store.setStatus(msg.data)
              break
            case 'timeline':
              store.addTimelineEvent(msg.data)
              break
            case 'thought':
            case 'decision':
            case 'action':
            case 'observation':
              store.addTimelineEvent({
                id: `evt-${Date.now()}`,
                timestamp: Date.now(),
                type: msg.type,
                summary: msg.data?.summary || msg.data?.message || JSON.stringify(msg.data),
                details: msg.data?.details,
              })
              break
            case 'skill_update':
              if (msg.data?.skills) store.setSkills(msg.data.skills)
              break
            case 'council_update':
              if (msg.data?.members) store.setCouncil(msg.data.members)
              break
            case 'memory':
              store.addMemoryEntry(msg.data)
              break
            case 'console':
              store.addConsoleMessage(msg.data)
              break
          }
        } catch {}
      }

      ws.onclose = () => {
        store.setConnected(false)
        setTimeout(connectWebSocket, 3000)
      }

      ws.onerror = () => {
        ws.close()
      }
    } catch {
      store.setConnected(false)
    }
  }, [])

  useEffect(() => {
    connectWebSocket()
    pollRef.current = setInterval(fetchStatus, 10000)

    return () => {
      wsRef.current?.close()
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [connectWebSocket, fetchStatus])

  return {
    sendCommand: (cmd: string) => {
      fetch(`${REST_BASE}/api/gsk/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      })
    },
  }
}
