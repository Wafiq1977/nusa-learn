// NUSA LEARN - Game state, persistence, view routing
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ============ Types ============
export type GameView =
  | 'splash'
  | 'onboarding'
  | 'home'
  | 'world_map'
  | 'area'
  | 'level_select'
  | 'briefing'
  | 'game'
  | 'result'
  | 'progress'
  | 'rewards'
  | 'profile'
  | 'settings'
  | 'daily'
  | 'practice'
  | 'arcade'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Character {
  skinTone: 'light' | 'tan' | 'brown'
  hair: 'short' | 'long' | 'curly' | 'bun' | 'cap'
  hairColor: 'black' | 'brown' | 'blonde' | 'blue' | 'purple'
  outfit: 'explorer' | 'scientist' | 'astronaut' | 'casual'
  outfitColor: 'cyan' | 'purple' | 'emerald' | 'orange' | 'pink'
  accessory: 'none' | 'glasses' | 'headphones' | 'scarf'
  backpack: 'none' | 'rocket' | 'star' | 'cloud'
}

export interface Settings {
  sound: boolean
  music: boolean
  musicTrack: string // 'petualangan' | 'ceria' | 'tenang' | 'misteri' | 'kemenangan' | 'off'
  animations: boolean
  reduceMotion: boolean
  textScale: 'small' | 'normal' | 'large'
}

export interface GameSession {
  area: string
  level: string
  category: 'numerik' | 'literasi' | 'logic'
  title: string
  subtitle: string
  questions: Question[]
  gameType: 'choice' | 'story' | 'pattern' | 'match' | 'build' | 'catch' | 'shop' | 'path' | 'battle'
  currentIndex: number
  correct: number
  wrong: number
  hintsUsed: number
  startedAt: number
  xpEarned: number
  starsEarned: number
  consecutiveCorrect: number
  // adaptive difficulty tracking
  difficultyScore: number
}

export interface Question {
  id: string
  grade: number
  category: 'numerik' | 'literasi'
  subcategory: string
  difficulty: Difficulty
  gameType: 'choice' | 'story' | 'pattern' | 'match' | 'build' | 'catch' | 'shop' | 'path' | 'battle'
  question: string
  story?: string | null
  highlight?: string[] | null
  options: string[]
  answer: string
  explanation: string
  hints: string[]
  xpReward: number
}

export interface PlayerState {
  name: string
  grade: number
  level: number
  xp: number
  coins: number
  stars: number
  character: Character
  settings: Settings
  unlockedAreas: string[]
  completedLevels: string[]
  skillProgress: Record<string, Record<string, number>>
  badges: string[]
  stats: {
    totalPlayed: number
    correct: number
    wrong: number
    streak: number
    bestStreak: number
  }
  lastDailyDate: string | null
  dailyStreak: number
}

// ============ Helper: XP thresholds per explorer rank ============
export const RANK_THRESHOLDS = [
  { level: 1, name: 'Beginner Explorer', emoji: '🌱', minXp: 0 },
  { level: 2, name: 'Curious Explorer', emoji: '🔎', minXp: 200 },
  { level: 3, name: 'Smart Explorer', emoji: '🧠', minXp: 600 },
  { level: 4, name: 'Knowledge Explorer', emoji: '🚀', minXp: 1200 },
  { level: 5, name: 'Master Explorer', emoji: '🌟', minXp: 2400 },
]

export function getRankFromXp(xp: number) {
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= RANK_THRESHOLDS[i].minXp) return RANK_THRESHOLDS[i]
  }
  return RANK_THRESHOLDS[0]
}

export function getNextRank(xp: number) {
  for (const r of RANK_THRESHOLDS) {
    if (r.minXp > xp) return r
  }
  return null
}

// ============ Store ============
interface GameStore extends PlayerState {
  view: GameView
  currentAreaId: string | null
  currentLevelId: string | null
  session: GameSession | null
  lastResult: {
    area: string
    level: string
    title: string
    stars: number
    xp: number
    coins: number
    correct: number
    total: number
    mastered: string[]
    nextPractice: string[]
    newBadges: string[]
    timeSpent: number
  } | null

  setView: (v: GameView) => void
  goHome: () => void
  goBack: () => void
  selectArea: (areaId: string) => void
  selectLevel: (levelId: string) => void
  startSession: (s: Omit<GameSession, 'currentIndex' | 'correct' | 'wrong' | 'hintsUsed' | 'startedAt' | 'xpEarned' | 'starsEarned' | 'consecutiveCorrect' | 'difficultyScore'>) => void
  answerQuestion: (answer: string) => { correct: boolean; xpGained: number }
  useHint: () => void
  endSession: () => void
  setResult: (r: GameStore['lastResult']) => void

  createPlayer: (name: string, grade: number, character: Character) => void
  updateCharacter: (c: Partial<Character>) => void
  updateSettings: (s: Partial<Settings>) => void
  addXp: (xp: number) => void
  addCoins: (coins: number) => void
  addStars: (stars: number) => void
  unlockArea: (areaId: string) => void
  completeLevel: (levelId: string) => void
  updateSkill: (category: string, subcategory: string, isCorrect: boolean) => void
  awardBadge: (badgeId: string) => boolean
  recordDaily: (date: string) => void
  resetProgress: () => void
}

const DEFAULT_CHARACTER: Character = {
  skinTone: 'tan',
  hair: 'short',
  hairColor: 'brown',
  outfit: 'explorer',
  outfitColor: 'cyan',
  accessory: 'none',
  backpack: 'rocket',
}

const DEFAULT_SETTINGS: Settings = {
  sound: true,
  music: true,
  musicTrack: 'petualangan',
  animations: true,
  reduceMotion: false,
  textScale: 'normal',
}

const EMPTY_PLAYER: PlayerState = {
  name: '',
  grade: 1,
  level: 1,
  xp: 0,
  coins: 50,
  stars: 0,
  character: DEFAULT_CHARACTER,
  settings: DEFAULT_SETTINGS,
  unlockedAreas: ['number_city', 'literacy_forest'],
  completedLevels: [],
  skillProgress: { numerik: {}, literasi: {} },
  badges: [],
  stats: { totalPlayed: 0, correct: 0, wrong: 0, streak: 0, bestStreak: 0 },
  lastDailyDate: null,
  dailyStreak: 0,
}

function prettySub(sc: string): string {
  const map: Record<string, string> = {
    penjumlahan: 'Penjumlahan',
    pengurangan: 'Pengurangan',
    perkalian: 'Perkalian',
    pembagian: 'Pembagian',
    pecahan: 'Pecahan',
    pola: 'Pola bilangan',
    uang: 'Uang',
    waktu: 'Waktu',
    geometri: 'Geometri',
    soal_cerita: 'Soal cerita',
    perbandingan: 'Perbandingan',
    pengukuran: 'Pengukuran',
    membaca: 'Membaca',
    ide_pokok: 'Ide pokok',
    informasi: 'Mencari informasi',
    kosakata: 'Kosakata',
    kalimat: 'Kalimat',
    karakter: 'Karakter tokoh',
    sebab_akibat: 'Sebab-akibat',
    menyimpulkan: 'Menyimpulkan',
    fakta_opini: 'Fakta & opini',
    menyusun_kalimat: 'Menyusun kalimat',
  }
  return map[sc] || sc
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...EMPTY_PLAYER,
      view: 'splash',
      currentAreaId: null,
      currentLevelId: null,
      session: null,
      lastResult: null,

      setView: (v) => set({ view: v }),
      goHome: () => set({ view: 'home', session: null, currentAreaId: null, currentLevelId: null }),
      goBack: () => {
        const v = get().view
        if (v === 'game' || v === 'briefing' || v === 'level_select') set({ view: 'area', session: null })
        else if (v === 'area') set({ view: 'world_map', currentAreaId: null })
        else if (v === 'result') set({ view: 'level_select', session: null })
        else if (v === 'world_map' || v === 'progress' || v === 'rewards' || v === 'profile' || v === 'settings' || v === 'daily' || v === 'practice' || v === 'arcade') set({ view: 'home' })
        else set({ view: 'home' })
      },
      selectArea: (id) => set({ currentAreaId: id, view: 'area' }),
      selectLevel: (id) => set({ currentLevelId: id, view: 'level_select' }),

      startSession: (s) => set({
        session: {
          ...s,
          currentIndex: 0,
          correct: 0,
          wrong: 0,
          hintsUsed: 0,
          startedAt: Date.now(),
          xpEarned: 0,
          starsEarned: 0,
          consecutiveCorrect: 0,
          difficultyScore: 0,
        },
        view: 'game',
      }),

      answerQuestion: (answer) => {
        const s = get().session
        if (!s) return { correct: false, xpGained: 0 }
        const q = s.questions[s.currentIndex]
        if (!q) return { correct: false, xpGained: 0 }
        const isCorrect = answer.trim().toLowerCase() === q.answer.trim().toLowerCase()
        const hintPenalty = Math.min(s.hintsUsed * 0.25, 0.75)
        const xpGained = isCorrect ? Math.round(q.xpReward * (1 - hintPenalty)) : 0
        const newDiffScore = Math.max(0, Math.min(10, s.difficultyScore + (isCorrect ? 1 : -1)))
        const newSession: GameSession = {
          ...s,
          correct: s.correct + (isCorrect ? 1 : 0),
          wrong: s.wrong + (isCorrect ? 0 : 1),
          xpEarned: s.xpEarned + xpGained,
          consecutiveCorrect: isCorrect ? s.consecutiveCorrect + 1 : 0,
          difficultyScore: newDiffScore,
          hintsUsed: 0,
        }
        set({ session: newSession })
        get().updateSkill(q.category, q.subcategory, isCorrect)
        set((state) => ({
          stats: {
            ...state.stats,
            correct: state.stats.correct + (isCorrect ? 1 : 0),
            wrong: state.stats.wrong + (isCorrect ? 0 : 1),
            streak: isCorrect ? state.stats.streak + 1 : 0,
            bestStreak: Math.max(state.stats.bestStreak, isCorrect ? state.stats.streak + 1 : state.stats.streak),
          },
        }))
        return { correct: isCorrect, xpGained: xpGained }
      },

      useHint: () => {
        const s = get().session
        if (!s) return
        set({ session: { ...s, hintsUsed: s.hintsUsed + 1 } })
      },

      endSession: () => {
        const s = get().session
        if (!s) return
        const total = s.questions.length
        const pct = total > 0 ? s.correct / total : 0
        const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.5 ? 1 : 0

        const mastered: string[] = []
        const nextPractice: string[] = []
        const subcats = Array.from(new Set(s.questions.map((q) => q.subcategory)))
        mastered.push(...subcats.slice(0, 2).map((sc) => prettySub(sc)))
        if (subcats.length > 2) nextPractice.push(...subcats.slice(2).map((sc) => prettySub(sc)))

        const coinsGained = s.correct * 10
        set((state) => {
          const newXp = state.xp + s.xpEarned
          const newRank = getRankFromXp(newXp)
          return {
            xp: newXp,
            level: newRank.level,
            coins: state.coins + coinsGained,
            stars: state.stars + stars,
            stats: { ...state.stats, totalPlayed: state.stats.totalPlayed + 1 },
          }
        })
        if (s.level && s.area) {
          get().completeLevel(`${s.area}-${s.level}`)
        }
        const newBadges: string[] = []
        const awardIfNew = (id: string, cond: () => boolean) => {
          if (cond() && !get().badges.includes(id)) {
            newBadges.push(id)
            get().awardBadge(id)
          }
        }
        awardIfNew('first_steps', () => true)
        awardIfNew('math_explorer', () => s.area === 'number_city' && get().completedLevels.filter((l) => l.startsWith('number_city-')).length >= 5)
        awardIfNew('reading_explorer', () => s.area === 'literacy_forest' && get().completedLevels.filter((l) => l.startsWith('literacy_forest-')).length >= 5)
        awardIfNew('knowledge_hunter', () => get().xp >= 500)
        awardIfNew('problem_solver', () => s.area === 'logic_lab')
        awardIfNew('number_master', () => {
          const sp = get().skillProgress.numerik || {}
          return ['penjumlahan', 'pengurangan', 'perkalian', 'pembagian'].every((k) => (sp[k] || 0) >= 75)
        })

        set({
          lastResult: {
            area: s.area,
            level: s.level,
            title: s.title,
            stars,
            xp: s.xpEarned,
            coins: coinsGained,
            correct: s.correct,
            total: s.questions.length,
            mastered,
            nextPractice,
            newBadges,
            timeSpent: Math.round((Date.now() - s.startedAt) / 1000),
          },
          view: 'result',
          session: null,
        })
      },

      setResult: (r) => set({ lastResult: r }),

      createPlayer: (name, grade, character) =>
        set({
          name,
          grade,
          character,
          view: 'home',
          unlockedAreas: ['number_city', 'literacy_forest'],
        }),

      updateCharacter: (c) => set((state) => ({ character: { ...state.character, ...c } })),
      updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),

      addXp: (xp) =>
        set((state) => {
          const newXp = state.xp + xp
          return { xp: newXp, level: getRankFromXp(newXp).level }
        }),
      addCoins: (coins) => set((state) => ({ coins: state.coins + coins })),
      addStars: (stars) => set((state) => ({ stars: state.stars + stars })),

      unlockArea: (areaId) =>
        set((state) => ({
          unlockedAreas: state.unlockedAreas.includes(areaId)
            ? state.unlockedAreas
            : [...state.unlockedAreas, areaId],
        })),

      completeLevel: (levelId) =>
        set((state) => ({
          completedLevels: state.completedLevels.includes(levelId)
            ? state.completedLevels
            : [...state.completedLevels, levelId],
        })),

      updateSkill: (category, subcategory, isCorrect) =>
        set((state) => {
          const cat = state.skillProgress[category] || {}
          const prev = cat[subcategory] || 50
          const next = Math.max(0, Math.min(100, prev + (isCorrect ? 4 : -3)))
          return {
            skillProgress: {
              ...state.skillProgress,
              [category]: { ...cat, [subcategory]: next },
            },
          }
        }),

      awardBadge: (badgeId) => {
        if (get().badges.includes(badgeId)) return false
        set((state) => ({ badges: [...state.badges, badgeId] }))
        return true
      },

      recordDaily: (date) =>
        set((state) => {
          if (state.lastDailyDate === date) return state
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
          const streak = state.lastDailyDate === yesterday ? state.dailyStreak + 1 : 1
          return { lastDailyDate: date, dailyStreak: streak }
        }),

      resetProgress: () => set({ ...EMPTY_PLAYER, view: 'onboarding' }),
    }),
    {
      name: 'nusa-learn-store',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : (undefined as unknown as Storage))),
      partialize: (state) => ({
        name: state.name,
        grade: state.grade,
        level: state.level,
        xp: state.xp,
        coins: state.coins,
        stars: state.stars,
        character: state.character,
        settings: state.settings,
        unlockedAreas: state.unlockedAreas,
        completedLevels: state.completedLevels,
        skillProgress: state.skillProgress,
        badges: state.badges,
        stats: state.stats,
        lastDailyDate: state.lastDailyDate,
        dailyStreak: state.dailyStreak,
      }),
    }
  )
)
