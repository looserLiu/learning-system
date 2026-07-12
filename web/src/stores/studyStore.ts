import { create } from 'zustand'

interface StudyState {
  sessionId: string | null
  startedAt: number | null
  elapsed: number
  isRunning: boolean
  knowledgeId: string | null

  start: (knowledgeId: string, sessionId: string) => void
  pause: () => void
  resume: () => void
  end: () => void
  tick: () => void
}

export const useStudyStore = create<StudyState>()((set, get) => ({
  sessionId: null,
  startedAt: null,
  elapsed: 0,
  isRunning: false,
  knowledgeId: null,

  start: (knowledgeId, sessionId) =>
    set({
      sessionId,
      knowledgeId,
      startedAt: Date.now(),
      elapsed: 0,
      isRunning: true,
    }),

  pause: () => set({ isRunning: false }),

  resume: () =>
    set((state) => ({
      isRunning: true,
      startedAt: Date.now() - state.elapsed * 1000,
    })),

  end: () =>
    set({
      sessionId: null,
      startedAt: null,
      elapsed: 0,
      isRunning: false,
      knowledgeId: null,
    }),

  tick: () => {
    const state = get()
    if (state.isRunning && state.startedAt) {
      set({ elapsed: Math.floor((Date.now() - state.startedAt) / 1000) })
    }
  },
}))
