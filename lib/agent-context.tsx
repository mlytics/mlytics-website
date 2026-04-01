'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { type AgentPersona } from './agent-data'

type HistoryEntry = { role: 'agent' | 'user'; content: string }

type AgentState = {
  persona: AgentPersona
  heroCompleted: boolean
  history: HistoryEntry[]
  setPersona: (p: AgentPersona) => void
  addHistory: (entry: HistoryEntry) => void
  setHeroCompleted: () => void
  resetAgent: () => void
}

const AgentContext = createContext<AgentState | null>(null)

export function AgentProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<AgentPersona>(null)
  const [heroCompleted, setHeroCompletedState] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  function setPersona(p: AgentPersona) {
    setPersonaState(p)
  }

  function addHistory(entry: HistoryEntry) {
    setHistory(prev => [...prev.slice(-20), entry]) // keep last 20
  }

  function setHeroCompleted() {
    setHeroCompletedState(true)
  }

  function resetAgent() {
    setPersonaState(null)
    setHeroCompletedState(false)
    setHistory([])
  }

  return (
    <AgentContext.Provider value={{ persona, heroCompleted, history, setPersona, addHistory, setHeroCompleted, resetAgent }}>
      {children}
    </AgentContext.Provider>
  )
}

export function useAgent() {
  const ctx = useContext(AgentContext)
  if (!ctx) throw new Error('useAgent must be inside AgentProvider')
  return ctx
}
