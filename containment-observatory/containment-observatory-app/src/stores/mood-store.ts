import { create } from 'zustand'

type Mood = 'idle' | 'typing' | 'walking' | 'watching' | 'driving' | 'celebrating' | 'sleeping'
type Scene = 'desk' | 'outside' | 'car' | 'sofa'

interface MoodState {
  mood: Mood
  scene: Scene
  setMood: (m: Mood) => void
  setScene: (s: Scene) => void
  cycleMood: () => void
  cycleScene: () => void
}

const moods: Mood[] = ['idle', 'typing', 'walking', 'watching', 'driving', 'celebrating', 'sleeping']
const scenes: Scene[] = ['desk', 'outside', 'car', 'sofa']

export const useMoodStore = create<MoodState>((set) => ({
  mood: 'idle',
  scene: 'desk',
  setMood: (m) => set({ mood: m }),
  setScene: (s) => set({ scene: s }),
  cycleMood: () =>
    set((state) => ({
      mood: moods[(moods.indexOf(state.mood) + 1) % moods.length],
    })),
  cycleScene: () =>
    set((state) => ({
      scene: scenes[(scenes.indexOf(state.scene) + 1) % scenes.length],
    })),
}))
