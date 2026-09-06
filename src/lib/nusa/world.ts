// NUSA LEARN - World & level definitions
// All content is data-driven so admins can extend easily.

export interface AreaDef {
  id: string
  name: string
  emoji: string
  category: 'numerik' | 'literasi' | 'logic' | 'mixed' | 'challenge' | 'info'
  color: string // tailwind gradient from-color
  colorVar: 'cyan' | 'purple' | 'emerald' | 'orange' | 'pink' | 'sky'
  tagline: string
  description: string
  subcategories: string[] // which question subcategories fit this area
  unlockXp: number // XP needed to unlock (0 = unlocked from start)
}

export interface LevelDef {
  id: string // e.g. "nc-1"
  areaId: string
  name: string
  subtitle: string
  brief: string
  order: number
  gameType: 'choice' | 'story' | 'pattern' | 'match' | 'build'
  subcategory?: string
  difficulty: 'easy' | 'medium' | 'hard'
  questionCount: number
  emoji: string
  isBoss?: boolean
}

// ============ Areas ============
export const AREAS: AreaDef[] = [
  {
    id: 'number_city',
    name: 'Number City',
    emoji: '🔢',
    category: 'numerik',
    color: 'from-sky-400 to-cyan-500',
    colorVar: 'cyan',
    tagline: 'Kota angka futuristik',
    description: 'Hitung, gabungkan, dan aktifkan kendaraan energi di kota matematika!',
    subcategories: ['penjumlahan', 'pengurangan', 'perkalian', 'pembagian', 'uang', 'waktu', 'pengukuran'],
    unlockXp: 0,
  },
  {
    id: 'literacy_forest',
    name: 'Literacy Forest',
    emoji: '🌳',
    category: 'literasi',
    color: 'from-purple-400 to-fuchsia-500',
    colorVar: 'purple',
    tagline: 'Hutan penuh cerita',
    description: 'Jelajahi hutan, temukan cerita, dan pahami setiap kata yang tersembunyi.',
    subcategories: ['membaca', 'ide_pokok', 'informasi', 'kosakata', 'karakter', 'sebab_akibat', 'menyimpulkan', 'menyusun_kalimat'],
    unlockXp: 0,
  },
  {
    id: 'logic_lab',
    name: 'Logic Lab',
    emoji: '🧠',
    category: 'logic',
    color: 'from-emerald-400 to-teal-500',
    colorVar: 'emerald',
    tagline: 'Lab pemikiran',
    description: 'Pecahkan pola, urutan, dan teka-teki logika untuk membuka kode akses robot.',
    subcategories: ['pola', 'perbandingan', 'geometri'],
    unlockXp: 200,
  },
  {
    id: 'knowledge_library',
    name: 'Knowledge Library',
    emoji: '📚',
    category: 'info',
    color: 'from-amber-400 to-orange-500',
    colorVar: 'orange',
    tagline: 'Perpustakaan digital',
    description: 'Baca, pilih fakta atau opini, dan temukan informasi penting dari berbagai teks.',
    subcategories: ['informasi', 'fakta_opini', 'menyimpulkan', 'ide_pokok'],
    unlockXp: 600,
  },
  {
    id: 'future_station',
    name: 'Future Station',
    emoji: '🚀',
    category: 'mixed',
    color: 'from-rose-400 to-pink-500',
    colorVar: 'pink',
    tagline: 'Stasiun luar angkasa',
    description: 'Misi gabungan numerik + literasi. Buktikan kamu penjelajah sejati!',
    subcategories: ['soal_cerita', 'pola', 'perbandingan', 'menyimpulkan'],
    unlockXp: 1200,
  },
  {
    id: 'challenge_arena',
    name: 'Challenge Arena',
    emoji: '🏆',
    category: 'challenge',
    color: 'from-yellow-400 via-orange-400 to-rose-500',
    colorVar: 'orange',
    tagline: 'Arena tantangan',
    description: 'Tantangan khusus untuk para Master Explorer. Hadiah besar menanti!',
    subcategories: ['soal_cerita', 'perbandingan', 'menyimpulkan', 'fakta_opini'],
    unlockXp: 2400,
  },
]

// ============ Levels per area (5 levels: 4 normal + 1 boss) ============
export const LEVELS: LevelDef[] = [
  // Number City
  { id: 'nc-1', areaId: 'number_city', name: 'Level 1 — Kereta Energi', subtitle: 'Penjumlahan awal', brief: 'Bantu NOVA mengaktifkan kereta energi dengan menyelesaikan soal penjumlahan.', order: 1, gameType: 'choice', subcategory: 'penjumlahan', difficulty: 'easy', questionCount: 5, emoji: '🚂' },
  { id: 'nc-2', areaId: 'number_city', name: 'Level 2 — Menara Hitung', subtitle: 'Pengurangan', brief: 'Turunkan menara dengan menjawab soal pengurangan.', order: 2, gameType: 'choice', subcategory: 'pengurangan', difficulty: 'easy', questionCount: 5, emoji: '🗼' },
  { id: 'nc-3', areaId: 'number_city', name: 'Level 3 — Pabrik Robot', subtitle: 'Perkalian', brief: 'Aktifkan robot pabrik dengan perkalian.', order: 3, gameType: 'choice', subcategory: 'perkalian', difficulty: 'medium', questionCount: 5, emoji: '🤖' },
  { id: 'nc-4', areaId: 'number_city', name: 'Level 4 — Stasiun Pembagian', subtitle: 'Pembagian', brief: 'Bagi energi ke semua kereta secara rata.', order: 4, gameType: 'choice', subcategory: 'pembagian', difficulty: 'medium', questionCount: 5, emoji: '🚉' },
  { id: 'nc-boss', areaId: 'number_city', name: 'Boss — Misi Uang & Waktu', subtitle: 'Uang & Waktu', brief: 'Beli suku cadang dan hitung waktu tempuh misi!', order: 5, gameType: 'story', difficulty: 'hard', questionCount: 6, emoji: '👑', isBoss: true },

  // Literacy Forest
  { id: 'lf-1', areaId: 'literacy_forest', name: 'Level 1 — Pohon Cerita', subtitle: 'Membaca', brief: 'Dengarkan cerita pohon dan temukan informasi sederhana.', order: 1, gameType: 'story', subcategory: 'membaca', difficulty: 'easy', questionCount: 5, emoji: '🌳' },
  { id: 'lf-2', areaId: 'literacy_forest', name: 'Level 2 — Buku Hilang', subtitle: 'Ide pokok', brief: 'Temukan ide pokok dari setiap cerita untuk membuka buku.', order: 2, gameType: 'story', subcategory: 'ide_pokok', difficulty: 'easy', questionCount: 5, emoji: '📖' },
  { id: 'lf-3', areaId: 'literacy_forest', name: 'Level 3 — Jembatan Kosakata', subtitle: 'Kosakata', brief: ' Cocokkan kata dengan artinya untuk menyeberang jembatan.', order: 3, gameType: 'choice', subcategory: 'kosakata', difficulty: 'medium', questionCount: 5, emoji: '🌉' },
  { id: 'lf-4', areaId: 'literacy_forest', name: 'Level 4 — Hutan Karakter', subtitle: 'Karakter & sebab-akibat', brief: 'Pahami karakter tokoh dan hubungan sebab-akibat dalam cerita.', order: 4, gameType: 'story', subcategory: 'karakter', difficulty: 'medium', questionCount: 5, emoji: '🦊' },
  { id: 'lf-boss', areaId: 'literacy_forest', name: 'Boss — Menyusun Cerita', subtitle: 'Menyimpulkan & menyusun', brief: 'Susun kalimat dan simpulkan cerita untuk lulus!', order: 5, gameType: 'build', difficulty: 'hard', questionCount: 6, emoji: '👑', isBoss: true },

  // Logic Lab
  { id: 'll-1', areaId: 'logic_lab', name: 'Level 1 — Pola Angka', subtitle: 'Pola bilangan', brief: 'Lengkapi pola angka untuk membuka pintu lab.', order: 1, gameType: 'pattern', subcategory: 'pola', difficulty: 'easy', questionCount: 5, emoji: '🔢' },
  { id: 'll-2', areaId: 'logic_lab', name: 'Level 2 — Kode Robot', subtitle: 'Pola lanjutan', brief: 'Tebak kode akses robot dengan pola yang lebih sulit.', order: 2, gameType: 'pattern', subcategory: 'pola', difficulty: 'medium', questionCount: 5, emoji: '🔑' },
  { id: 'll-3', areaId: 'logic_lab', name: 'Level 3 — Lab Bentuk', subtitle: 'Geometri', brief: 'Pelajari bentuk dan sisi di lab geometri.', order: 3, gameType: 'choice', subcategory: 'geometri', difficulty: 'medium', questionCount: 5, emoji: '📐' },
  { id: 'll-4', areaId: 'logic_lab', name: 'Level 4 — Timbangan', subtitle: 'Perbandingan', brief: 'Gunakan perbandingan untuk menyeimbangkan timbangan.', order: 4, gameType: 'choice', subcategory: 'perbandingan', difficulty: 'medium', questionCount: 5, emoji: '⚖️' },
  { id: 'll-boss', areaId: 'logic_lab', name: 'Boss — Pemecahan Masalah', subtitle: 'Pola & logika', brief: 'Selesaikan misi logika terakhir di lab!', order: 5, gameType: 'pattern', difficulty: 'hard', questionCount: 6, emoji: '👑', isBoss: true },

  // Knowledge Library
  { id: 'kl-1', areaId: 'knowledge_library', name: 'Level 1 — Rak Fakta', subtitle: 'Mencari informasi', brief: 'Cari informasi spesifik di rak buku digital.', order: 1, gameType: 'story', subcategory: 'informasi', difficulty: 'easy', questionCount: 5, emoji: '📚' },
  { id: 'kl-2', areaId: 'knowledge_library', name: 'Level 2 — Buku Fakta vs Opini', subtitle: 'Fakta & opini', brief: 'Bedakan mana fakta, mana opini.', order: 2, gameType: 'choice', subcategory: 'fakta_opini', difficulty: 'medium', questionCount: 5, emoji: '📔' },
  { id: 'kl-3', areaId: 'knowledge_library', name: 'Level 3 — Ringkasan', subtitle: 'Menyimpulkan', brief: 'Tarik kesimpulan dari teks yang kamu baca.', order: 3, gameType: 'story', subcategory: 'menyimpulkan', difficulty: 'medium', questionCount: 5, emoji: '📑' },
  { id: 'kl-4', areaId: 'knowledge_library', name: 'Level 4 — Gudang Ide', subtitle: 'Ide pokok', brief: 'Temukan ide pokok dari teks yang lebih panjang.', order: 4, gameType: 'story', subcategory: 'ide_pokok', difficulty: 'medium', questionCount: 5, emoji: '🗂️' },
  { id: 'kl-boss', areaId: 'knowledge_library', name: 'Boss — Penjaga Perpustakaan', subtitle: 'Campuran literasi', brief: 'Lulusi ujian penjaga perpustakaan dengan semua jenis soal literasi!', order: 5, gameType: 'story', difficulty: 'hard', questionCount: 6, emoji: '👑', isBoss: true },

  // Future Station
  { id: 'fs-1', areaId: 'future_station', name: 'Level 1 — Misi Jarak', subtitle: 'Soal cerita', brief: 'Hitung jarak tempuh misi luar angkasa.', order: 1, gameType: 'story', subcategory: 'soal_cerita', difficulty: 'medium', questionCount: 5, emoji: '🛰️' },
  { id: 'fs-2', areaId: 'future_station', name: 'Level 2 — Pola Bintang', subtitle: 'Pola bilangan', brief: 'Temukan pola rasi bintang.', order: 2, gameType: 'pattern', subcategory: 'pola', difficulty: 'medium', questionCount: 5, emoji: '⭐' },
  { id: 'fs-3', areaId: 'future_station', name: 'Level 3 — Rasio Bahan Bakar', subtitle: 'Perbandingan', brief: 'Hitung perbandingan bahan bakar roket.', order: 3, gameType: 'choice', subcategory: 'perbandingan', difficulty: 'hard', questionCount: 5, emoji: '🚀' },
  { id: 'fs-4', areaId: 'future_station', name: 'Level 4 — Laporan Penerbangan', subtitle: 'Menyimpulkan', brief: 'Simpulkan laporan penerbangan dari teks panjang.', order: 4, gameType: 'story', subcategory: 'menyimpulkan', difficulty: 'hard', questionCount: 5, emoji: '🛸' },
  { id: 'fs-boss', areaId: 'future_station', name: 'Boss — Misi Penjelajah Sejati', subtitle: 'Campuran numerik & literasi', brief: 'Buktikan kamu layak menjadi penjelajah sejati dengan misi campuran!', order: 5, gameType: 'story', difficulty: 'hard', questionCount: 7, emoji: '👑', isBoss: true },

  // Challenge Arena
  { id: 'ca-1', areaId: 'challenge_arena', name: 'Tantangan 1 — Hitung Cepat', subtitle: 'Soal cerita', brief: 'Selesaikan 5 soal cerita secepat mungkin.', order: 1, gameType: 'story', subcategory: 'soal_cerita', difficulty: 'hard', questionCount: 5, emoji: '⚡' },
  { id: 'ca-2', areaId: 'challenge_arena', name: 'Tantangan 2 — Teka-teki Perbandingan', subtitle: 'Perbandingan', brief: 'Hadapi teka-teki perbandingan tingkat tinggi.', order: 2, gameType: 'choice', subcategory: 'perbandingan', difficulty: 'hard', questionCount: 5, emoji: '🎯' },
  { id: 'ca-3', areaId: 'challenge_arena', name: 'Tantangan 3 — Pemikir Ultimate', subtitle: 'Campuran', brief: 'Tantangan akhir untuk para Master Explorer!', order: 3, gameType: 'story', difficulty: 'hard', questionCount: 7, emoji: '👑', isBoss: true },
]

export function getArea(id: string): AreaDef | undefined {
  return AREAS.find((a) => a.id === id)
}
export function getLevelsForArea(areaId: string): LevelDef[] {
  return LEVELS.filter((l) => l.areaId === areaId).sort((a, b) => a.order - b.order)
}
export function getLevel(id: string): LevelDef | undefined {
  return LEVELS.find((l) => l.id === id)
}

// Map area.category to question category (numerik|literasi). 'mixed'/'challenge'/'info' need special handling.
export function areaToQuestionCategory(areaId: string): 'numerik' | 'literasi' {
  const area = getArea(areaId)
  if (!area) return 'numerik'
  if (area.category === 'numerik' || area.category === 'logic') return 'numerik'
  return 'literasi'
}
