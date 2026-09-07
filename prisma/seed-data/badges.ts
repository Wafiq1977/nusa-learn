// Badge definitions for NUSA LEARN

export interface SeedBadge {
  id: string
  name: string
  description: string
  icon: string
  category: string
  requirement: string
}

export const badges: SeedBadge[] = [
  // Numerik
  { id: 'math_explorer', name: 'Math Explorer', description: 'Menyelesaikan 5 level numerik pertama', icon: '🔢', category: 'numerik', requirement: 'Selesaikan 5 level Number City' },
  { id: 'number_master', name: 'Number Master', description: 'Menguasai semua operasi dasar', icon: '🧮', category: 'numerik', requirement: 'Kuasai tambah, kurang, kali, bagi' },
  { id: 'pattern_pro', name: 'Pattern Pro', description: 'Menyelesaikan 10 soal pola', icon: '🎯', category: 'numerik', requirement: 'Selesaikan 10 soal pola bilangan' },
  { id: 'money_whiz', name: 'Money Whiz', description: 'Pintar menghitung uang', icon: '💰', category: 'numerik', requirement: 'Kuasai subkategori uang' },

  // Literasi
  { id: 'reading_explorer', name: 'Reading Explorer', description: 'Menyelesaikan 5 level literasi pertama', icon: '📚', category: 'literasi', requirement: 'Selesaikan 5 level Literacy Forest' },
  { id: 'story_master', name: 'Story Master', description: 'Memahami 10 cerita pendek', icon: '📖', category: 'literasi', requirement: 'Selesaikan 10 soal cerita' },
  { id: 'word_wizard', name: 'Word Wizard', description: 'Menguasai 50 kosakata baru', icon: '✨', category: 'literasi', requirement: 'Kuasai subkategori kosakata' },

  // General
  { id: 'curious_mind', name: 'Curious Mind', description: 'Membuka 3 area dunia', icon: '🧠', category: 'general', requirement: 'Buka 3 area di World Map' },
  { id: 'knowledge_hunter', name: 'Knowledge Hunter', description: 'Mengumpulkan 500 XP', icon: '💎', category: 'general', requirement: 'Capai 500 XP' },
  { id: 'problem_solver', name: 'Problem Solver', description: 'Selesaikan Logic Lab', icon: '🚀', category: 'general', requirement: 'Selesaikan area Logic Lab' },
  { id: 'daily_hero', name: 'Daily Hero', description: 'Selesaikan Daily Challenge 7 hari berturut', icon: '🔥', category: 'general', requirement: '7 hari streak Daily Challenge' },
  { id: 'first_steps', name: 'First Steps', description: 'Menyelesaikan level pertama', icon: '🌱', category: 'general', requirement: 'Selesaikan level pertama apapun' },
]
