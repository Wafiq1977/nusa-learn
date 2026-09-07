// Numerik question bank + generator
// Covers: penjumlahan, pengurangan, perkalian, pembagian, pecahan, pola, uang, waktu, geometri, soal_cerita, perbandingan, pengukuran
// For grades 1-6, difficulties easy/medium/hard

export interface SeedQuestion {
  id: string
  grade: number
  category: 'numerik' | 'literasi'
  subcategory: string
  difficulty: 'easy' | 'medium' | 'hard'
  gameType: 'choice' | 'story' | 'pattern' | 'match' | 'build'
  question: string
  story?: string
  highlight?: string[]
  options: string[]
  answer: string
  explanation: string
  hints: string[]
  xpReward: number
}

// ====== Curated numerik questions (templates + signature examples) ======
export const numerikQuestions: SeedQuestion[] = [
  // Grade 1 - Penjumlahan
  {
    id: 'NUM-G1-001',
    grade: 1,
    category: 'numerik',
    subcategory: 'penjumlahan',
    difficulty: 'easy',
    gameType: 'choice',
    question: 'Berapa hasil dari 2 + 3?',
    options: ['4', '5', '6', '7'],
    answer: '5',
    explanation: '2 ditambah 3 sama dengan 5. Bisa dihitung dengan jari: 2 jari lalu tambah 3 jari lagi.',
    hints: [
      'Coba hitung pakai jari. Mulai dari 2, lalu tambah 3.',
      '2 + 1 = 3, lalu tambah lagi 2 jadi 5.',
      'Bayangkan kamu punya 2 permen, lalu dapat 3 lagi. Berapa totalnya?',
    ],
    xpReward: 15,
  },
  {
    id: 'NUM-G1-002',
    grade: 1,
    category: 'numerik',
    subcategory: 'penjumlahan',
    difficulty: 'medium',
    gameType: 'choice',
    question: 'Lina punya 4 apel. Ia diberi 3 apel lagi. Berapa apel Lina sekarang?',
    story: 'Lina suka buah apel. Hari ini ia berbelanja di pasar dan menemukan apel merah yang segar.',
    options: ['6', '7', '8', '9'],
    answer: '7',
    explanation: '4 + 3 = 7. Apel awal Lina 4, ditambah 3, jadi 7.',
    hints: [
      'Lihat jumlah apel Lina mula-mula.',
      'Lina awalnya 4, lalu ditambah 3.',
      'Hitung: 4, 5, 6, 7 — total 7.',
    ],
    xpReward: 20,
  },
  {
    id: 'NUM-G1-003',
    grade: 1,
    category: 'numerik',
    subcategory: 'pengurangan',
    difficulty: 'easy',
    gameType: 'choice',
    question: 'Berapa hasil dari 5 - 2?',
    options: ['2', '3', '4', '5'],
    answer: '3',
    explanation: '5 dikurangi 2 sama dengan 3. Dari 5, ambil 2, sisanya 3.',
    hints: [
      'Kamu punya 5 permen, lalu makan 2. Sisanya berapa?',
      'Hitung mundur: 5, 4, 3 — sisanya 3.',
      '5 - 2 berarti mulai dari 5 dan kurangi 2.',
    ],
    xpReward: 15,
  },
  {
    id: 'NUM-G1-004',
    grade: 1,
    category: 'numerik',
    subcategory: 'pengukuran',
    difficulty: 'easy',
    gameType: 'choice',
    question: 'Penggarismu panjangnya 20 ... (pilih satuan yang benar)',
    options: ['cm', 'kg', 'liter', 'jam'],
    answer: 'cm',
    explanation: 'Panjang diukur dengan sentimeter (cm). Kg untuk berat, liter untuk cairan, jam untuk waktu.',
    hints: [
      'Apa yang dipakai untuk mengukur panjang?',
      'Lihat penggaris, ada angka 1, 2, 3 — itu dalam satuan apa?',
      'Penggaris biasanya pakai cm.',
    ],
    xpReward: 20,
  },
  {
    id: 'NUM-G1-005',
    grade: 1,
    category: 'numerik',
    subcategory: 'pola',
    difficulty: 'easy',
    gameType: 'pattern',
    question: 'Lengkapi pola: 1, 2, 3, 4, ...',
    options: ['5', '6', '7', '8'],
    answer: '5',
    explanation: 'Pola bertambah 1 setiap langkah. Setelah 4, lanjut ke 5.',
    hints: [
      'Lihat jarak antar angka: 1 ke 2, 2 ke 3...',
      'Tiap angka bertambah berapa?',
      'Bertambah 1, jadi setelah 4 adalah 5.',
    ],
    xpReward: 20,
  },

  // Grade 2
  {
    id: 'NUM-G2-001',
    grade: 2,
    category: 'numerik',
    subcategory: 'penjumlahan',
    difficulty: 'medium',
    gameType: 'choice',
    question: 'Berapa hasil dari 24 + 18?',
    story: 'Budi memiliki 24 kelereng dan mendapatkan 18 kelereng lagi dari temannya.',
    options: ['32', '42', '52', '48'],
    answer: '42',
    explanation: '24 + 18 = 42. 24 + 10 = 34, lalu 34 + 8 = 42.',
    hints: [
      'Coba pecah 18 jadi 10 dan 8.',
      '24 + 10 = 34. Lalu 34 + 8 = ?',
      'Hitung satuan dulu: 4 + 8 = 12 (simpan 1). Lalu puluhan: 2 + 1 + 1 = 4. Hasil 42.',
    ],
    xpReward: 25,
  },
  {
    id: 'NUM-G2-002',
    grade: 2,
    category: 'numerik',
    subcategory: 'perkalian',
    difficulty: 'easy',
    gameType: 'choice',
    question: 'Berapa hasil dari 3 × 4?',
    story: 'Ada 3 kotak pensil, masing-masing berisi 4 pensil. Berapa total pensilnya?',
    options: ['7', '12', '14', '16'],
    answer: '12',
    explanation: '3 × 4 = 12. Perkalian adalah penjumlahan berulang: 4 + 4 + 4 = 12.',
    hints: [
      'Perkalian sama dengan penjumlahan berulang.',
      '4 ditambah 3 kali: 4 + 4 + 4 = ?',
      'Coba hitung pakai jari: 4 + 4 = 8, lalu 8 + 4 = 12.',
    ],
    xpReward: 20,
  },
  {
    id: 'NUM-G2-003',
    grade: 2,
    category: 'numerik',
    subcategory: 'uang',
    difficulty: 'medium',
    gameType: 'choice',
    question: 'Dina beli minuman Rp 5.000 dengan uang Rp 10.000. Berapa kembalian yang Dina terima?',
    story: 'Dina pergi ke toko dengan uang Rp 10.000. Ia ingin membeli minuman seharga Rp 5.000.',
    options: ['Rp 3.000', 'Rp 4.000', 'Rp 5.000', 'Rp 6.000'],
    answer: 'Rp 5.000',
    explanation: 'Kembalian = uang dibayar - harga. Rp 10.000 - Rp 5.000 = Rp 5.000.',
    hints: [
      'Kembalian = uang dibayar dikurangi harga barang.',
      '10.000 - 5.000 = ?',
      'Hitung: 5.000 + 5.000 = 10.000. Jadi kembalian 5.000.',
    ],
    xpReward: 25,
  },
  {
    id: 'NUM-G2-004',
    grade: 2,
    category: 'numerik',
    subcategory: 'waktu',
    difficulty: 'easy',
    gameType: 'choice',
    question: 'Jika sekarang pukul 07.00, dan 2 jam kemudian, pukul berapa?',
    options: ['pukul 08.00', 'pukul 09.00', 'pukul 10.00', 'pukul 11.00'],
    answer: 'pukul 09.00',
    explanation: '07.00 + 2 jam = 09.00. Tambah 2 ke angka jam.',
    hints: [
      'Tambahkan 2 pada angka jam.',
      '07 + 2 = ?',
      'Setelah jam 7, lanjut ke 8 lalu 9.',
    ],
    xpReward: 20,
  },

  // Grade 3
  {
    id: 'NUM-G3-001',
    grade: 3,
    category: 'numerik',
    subcategory: 'pembagian',
    difficulty: 'easy',
    gameType: 'choice',
    question: 'Berapa hasil dari 12 ÷ 3?',
    story: 'Ada 12 kue dibagi rata kepada 3 anak. Masing-masing anak dapat berapa kue?',
    options: ['3', '4', '5', '6'],
    answer: '4',
    explanation: '12 ÷ 3 = 4. Pembagian berarti membagi rata. 3 anak masing-masing dapat 4 kue, total 12.',
    hints: [
      'Coba ingat perkalian: 3 × ? = 12.',
      'Pembagian adalah kebalikan perkalian.',
      '3 × 4 = 12, jadi 12 ÷ 3 = 4.',
    ],
    xpReward: 25,
  },
  {
    id: 'NUM-G3-002',
    grade: 3,
    category: 'numerik',
    subcategory: 'pecahan',
    difficulty: 'easy',
    gameType: 'choice',
    question: 'Manakah pecahan yang lebih besar: 1/2 atau 1/4?',
    options: ['1/2', '1/4', 'Sama besar', 'Tidak bisa dibandingkan'],
    answer: '1/2',
    explanation: '1/2 lebih besar dari 1/4. Kue dibagi 2 potong lebih besar daripada dibagi 4 potong.',
    hints: [
      'Bayangkan satu kue dibagi 2 dan dibagi 4.',
      'Mana potongan yang lebih besar?',
      'Setengah kue (1/2) lebih besar dari seperempat kue (1/4).',
    ],
    xpReward: 25,
  },
  {
    id: 'NUM-G3-003',
    grade: 3,
    category: 'numerik',
    subcategory: 'soal_cerita',
    difficulty: 'medium',
    gameType: 'story',
    question: 'Sebuah sekolah memiliki 6 kelas. Tiap kelas ada 25 siswa. Berapa total siswa di sekolah?',
    story: 'Sekolah Dasar Negeri 5 memiliki 6 kelas. Setiap kelas diisi oleh 25 siswa. Kepala sekolah ingin tahu total seluruh siswa.',
    options: ['120', '150', '180', '210'],
    answer: '150',
    explanation: '6 × 25 = 150. Tiap kelas 25 siswa, ada 6 kelas, jadi total 150 siswa.',
    hints: [
      'Operasi apa yang cocok: tambah, kurang, kali, atau bagi?',
      '6 kelas × 25 siswa = ?',
      'Hitung: 6 × 25 = 150.',
    ],
    xpReward: 30,
  },
  {
    id: 'NUM-G3-004',
    grade: 3,
    category: 'numerik',
    subcategory: 'geometri',
    difficulty: 'easy',
    gameType: 'choice',
    question: 'Segitiga memiliki berapa sisi?',
    options: ['2', '3', '4', '5'],
    answer: '3',
    explanation: 'Segitiga memiliki 3 sisi dan 3 sudut. "Tri" artinya tiga.',
    hints: [
      'Lihat nama bentuknya: segi-TIGA.',
      'Berapa sisi yang dimiliki segitiga?',
      'Segitiga punya 3 sisi.',
    ],
    xpReward: 20,
  },

  // Grade 4
  {
    id: 'NUM-G4-001',
    grade: 4,
    category: 'numerik',
    subcategory: 'perkalian',
    difficulty: 'medium',
    gameType: 'choice',
    question: 'Berapa hasil dari 24 × 6?',
    options: ['124', '134', '144', '154'],
    answer: '144',
    explanation: '24 × 6 = 144. Hitung: 20 × 6 = 120, 4 × 6 = 24, lalu 120 + 24 = 144.',
    hints: [
      'Pecah 24 jadi 20 dan 4.',
      '20 × 6 = 120, 4 × 6 = 24.',
      'Jumlahkan: 120 + 24 = 144.',
    ],
    xpReward: 30,
  },
  {
    id: 'NUM-G4-002',
    grade: 4,
    category: 'numerik',
    subcategory: 'pecahan',
    difficulty: 'medium',
    gameType: 'choice',
    question: 'Berapa hasil dari 1/2 + 1/4?',
    options: ['1/4', '2/6', '3/4', '1/2'],
    answer: '3/4',
    explanation: 'Samakan penyebut: 1/2 = 2/4. Lalu 2/4 + 1/4 = 3/4.',
    hints: [
      'Samakan penyebut dulu. Penyebut 2 dan 4, pakai 4.',
      '1/2 = 2/4, lalu 2/4 + 1/4 = ?',
      'Penyebut tetap 4, pembilang dijumlah: 2 + 1 = 3. Hasilnya 3/4.',
    ],
    xpReward: 35,
  },
  {
    id: 'NUM-G4-003',
    grade: 4,
    category: 'numerik',
    subcategory: 'pola',
    difficulty: 'medium',
    gameType: 'pattern',
    question: 'Lengkapi pola: 2, 4, 6, 8, 10, ...',
    options: ['11', '12', '14', '16'],
    answer: '12',
    explanation: 'Pola bertambah 2. Setelah 10, lanjut 10 + 2 = 12.',
    hints: [
      'Lihat jarak antar angka.',
      'Tiap angka bertambah berapa?',
      'Bertambah 2, jadi setelah 10 adalah 12.',
    ],
    xpReward: 25,
  },
  {
    id: 'NUM-G4-004',
    grade: 4,
    category: 'numerik',
    subcategory: 'pengukuran',
    difficulty: 'medium',
    gameType: 'choice',
    question: 'Sebuah kolam berisi 1.500 liter air. Berapa liter air di 3 kolam yang sama?',
    options: ['3.000', '4.500', '5.000', '6.000'],
    answer: '4.500',
    explanation: '1.500 × 3 = 4.500. Tiap kolam 1.500 liter, ada 3 kolam, total 4.500 liter.',
    hints: [
      'Operasi apa yang sesuai?',
      '1.500 × 3 = ?',
      '1.500 × 3 = 4.500 liter.',
    ],
    xpReward: 30,
  },

  // Grade 5
  {
    id: 'NUM-G5-001',
    grade: 5,
    category: 'numerik',
    subcategory: 'perbandingan',
    difficulty: 'medium',
    gameType: 'choice',
    question: 'Perbandingan umur Andi dan Budi 3 : 5. Jika umur Andi 12 tahun, berapa umur Budi?',
    story: 'Andi dan Budi sepupu. Perbandingan umur mereka adalah 3 : 5. Andi saat ini berumur 12 tahun.',
    options: ['18', '20', '24', '30'],
    answer: '20',
    explanation: '3 bagian = 12, jadi 1 bagian = 4. Umur Budi 5 bagian = 5 × 4 = 20 tahun.',
    hints: [
      'Cari nilai 1 bagian dulu.',
      '3 bagian = 12, jadi 1 bagian = 12 ÷ 3 = 4.',
      'Umur Budi 5 × 4 = 20 tahun.',
    ],
    xpReward: 40,
  },
  {
    id: 'NUM-G5-002',
    grade: 5,
    category: 'numerik',
    subcategory: 'pecahan',
    difficulty: 'medium',
    gameType: 'choice',
    question: 'Berapa hasil dari 2/3 × 4/5?',
    options: ['8/15', '6/8', '6/15', '8/12'],
    answer: '8/15',
    explanation: 'Perkalian pecahan: kalikan pembilang dengan pembilang, penyebut dengan penyebut. 2×4 = 8, 3×5 = 15.',
    hints: [
      'Perkalian pecahan: kali atas dengan atas, bawah dengan bawah.',
      'Pembilang: 2 × 4 = 8. Penyebut: 3 × 5 = 15.',
      'Hasilnya 8/15.',
    ],
    xpReward: 40,
  },
  {
    id: 'NUM-G5-003',
    grade: 5,
    category: 'numerik',
    subcategory: 'geometri',
    difficulty: 'medium',
    gameType: 'choice',
    question: 'Luas persegi panjang dengan panjang 8 cm dan lebar 5 cm adalah ...',
    options: ['13 cm²', '26 cm²', '40 cm²', '80 cm²'],
    answer: '40 cm²',
    explanation: 'Luas = panjang × lebar = 8 × 5 = 40 cm².',
    hints: [
      'Rumus luas persegi panjang?',
      'Luas = panjang × lebar.',
      '8 × 5 = 40 cm².',
    ],
    xpReward: 35,
  },

  // Grade 6
  {
    id: 'NUM-G6-001',
    grade: 6,
    category: 'numerik',
    subcategory: 'soal_cerita',
    difficulty: 'hard',
    gameType: 'story',
    question: 'Sebuah mobil melaju dengan kecepatan 60 km/jam selama 2,5 jam. Berapa jarak yang ditempuh?',
    story: 'Pak Joko mengendarai mobil dari kota A ke kota B. Ia melaju dengan kecepatan tetap 60 km/jam selama 2,5 jam. Karena penasaran, ia ingin menghitung jarak tempuhnya.',
    options: ['120 km', '125 km', '150 km', '180 km'],
    answer: '150 km',
    explanation: 'Jarak = kecepatan × waktu = 60 × 2,5 = 150 km.',
    hints: [
      'Rumus jarak tempuh?',
      'Jarak = kecepatan × waktu.',
      '60 × 2,5 = 150 km.',
    ],
    xpReward: 50,
  },
  {
    id: 'NUM-G6-002',
    grade: 6,
    category: 'numerik',
    subcategory: 'perbandingan',
    difficulty: 'hard',
    gameType: 'choice',
    question: 'Sebuah peta berskala 1 : 100.000. Jarak sebenarnya antara dua kota pada peta 5 cm. Berapa jarak sebenarnya?',
    options: ['500 m', '5 km', '50 km', '500 km'],
    answer: '5 km',
    explanation: 'Skala 1:100.000 berarti 1 cm pada peta = 100.000 cm = 1 km sebenarnya. 5 cm = 5 km.',
    hints: [
      'Skala 1:100.000 berarti 1 cm peta = ? cm asli.',
      '100.000 cm = 1 km. Jadi 1 cm peta = 1 km.',
      '5 cm peta = 5 × 1 km = 5 km.',
    ],
    xpReward: 50,
  },
]

// ====== Programmatic generator for additional numerik questions ======
function shuffleOptions(correct: string, distractors: string[]): string[] {
  const opts = [correct, ...distractors]
  for (let i = opts.length - 1; i > 0; i--) {
    const j = (i * 7 + 3) % (i + 1)
    ;[opts[i], opts[j]] = [opts[j], opts[i]]
  }
  return opts
}

function genAddition(grade: number, difficulty: 'easy' | 'medium' | 'hard', idx: number): SeedQuestion {
  const ranges: Record<string, [number, number]> = {
    easy: [1, 10],
    medium: [10, 50],
    hard: [50, 500],
  }
  const [min, max] = ranges[difficulty]
  const a = min + ((idx * 7) % (max - min))
  const b = min + ((idx * 13 + 5) % (max - min))
  const sum = a + b
  const distractors = [sum - 2, sum + 1, sum + 3].map(String)
  return {
    id: `NUM-GEN-ADD-G${grade}-${difficulty}-${idx}`,
    grade,
    category: 'numerik',
    subcategory: 'penjumlahan',
    difficulty,
    gameType: 'choice',
    question: `Berapa hasil dari ${a} + ${b}?`,
    options: shuffleOptions(String(sum), distractors),
    answer: String(sum),
    explanation: `${a} + ${b} = ${sum}.`,
    hints: [
      `Lihat angka pertama: ${a}. Tambahkan ${b}.`,
      `Coba pecah ${b} jadi puluhan dan satuan.`,
      `Hitung bertahap: ${a} + ${Math.floor(b / 10) * 10} = ${a + Math.floor(b / 10) * 10}, lalu tambah ${b % 10}.`,
    ],
    xpReward: difficulty === 'easy' ? 15 : difficulty === 'medium' ? 25 : 40,
  }
}

function genSubtraction(grade: number, difficulty: 'easy' | 'medium' | 'hard', idx: number): SeedQuestion {
  const ranges: Record<string, [number, number]> = {
    easy: [5, 20],
    medium: [20, 100],
    hard: [100, 1000],
  }
  const [min, max] = ranges[difficulty]
  const a = min + ((idx * 11 + 3) % (max - min))
  const b = Math.min(a - 1, min + ((idx * 17 + 7) % (max - min)))
  const diff = a - b
  const distractors = [diff + 2, diff - 1, diff + 3].map(String)
  return {
    id: `NUM-GEN-SUB-G${grade}-${difficulty}-${idx}`,
    grade,
    category: 'numerik',
    subcategory: 'pengurangan',
    difficulty,
    gameType: 'choice',
    question: `Berapa hasil dari ${a} - ${b}?`,
    options: shuffleOptions(String(diff), distractors),
    answer: String(diff),
    explanation: `${a} - ${b} = ${diff}.`,
    hints: [
      `Kamu punya ${a}, ambil ${b}. Sisanya berapa?`,
      `Hitung mundur dari ${a} sebanyak ${b} langkah.`,
      `Pecah ${b}: ${a} - ${Math.floor(b / 10) * 10} = ${a - Math.floor(b / 10) * 10}, lalu kurangi ${b % 10} lagi.`,
    ],
    xpReward: difficulty === 'easy' ? 15 : difficulty === 'medium' ? 25 : 40,
  }
}

function genMultiplication(grade: number, difficulty: 'easy' | 'medium' | 'hard', idx: number): SeedQuestion {
  const ranges: Record<string, [number, number]> = {
    easy: [2, 9],
    medium: [2, 12],
    hard: [10, 25],
  }
  const [min, max] = ranges[difficulty]
  const a = min + (idx % (max - min + 1))
  const b = min + ((idx * 5 + 2) % (max - min + 1))
  const prod = a * b
  const distractors = [prod - a, prod + b, prod + a].map(String)
  return {
    id: `NUM-GEN-MUL-G${grade}-${difficulty}-${idx}`,
    grade,
    category: 'numerik',
    subcategory: 'perkalian',
    difficulty,
    gameType: 'choice',
    question: `Berapa hasil dari ${a} × ${b}?`,
    options: shuffleOptions(String(prod), distractors),
    answer: String(prod),
    explanation: `${a} × ${b} = ${prod}. Perkalian adalah penjumlahan berulang.`,
    hints: [
      `Ingat perkalian ${a} atau ${b}.`,
      `Perkalian = penjumlahan berulang. ${a} ditambah ${b} kali.`,
      `Hitung: ${a} × ${Math.floor(b / 2)} = ${a * Math.floor(b / 2)}, lalu tambah ${a * (b % Math.floor(b / 2))} lagi.`,
    ],
    xpReward: difficulty === 'easy' ? 20 : difficulty === 'medium' ? 30 : 45,
  }
}

function genDivision(grade: number, difficulty: 'easy' | 'medium' | 'hard', idx: number): SeedQuestion {
  const ranges: Record<string, [number, number]> = {
    easy: [2, 9],
    medium: [2, 12],
    hard: [5, 20],
  }
  const [min, max] = ranges[difficulty]
  const divisor = min + (idx % (max - min + 1))
  const quotient = min + ((idx * 3 + 1) % (max - min + 1))
  const dividend = divisor * quotient
  const distractors = [quotient - 1, quotient + 1, quotient + 2].map(String)
  return {
    id: `NUM-GEN-DIV-G${grade}-${difficulty}-${idx}`,
    grade,
    category: 'numerik',
    subcategory: 'pembagian',
    difficulty,
    gameType: 'choice',
    question: `Berapa hasil dari ${dividend} ÷ ${divisor}?`,
    options: shuffleOptions(String(quotient), distractors),
    answer: String(quotient),
    explanation: `${dividend} ÷ ${divisor} = ${quotient}. Pembagian kebalikan perkalian: ${divisor} × ${quotient} = ${dividend}.`,
    hints: [
      `Pikirkan: ${divisor} × ? = ${dividend}`,
      `Pembagian adalah kebalikan perkalian.`,
      `Coba ${divisor} × ${quotient - 1} = ${divisor * (quotient - 1)}, ${divisor} × ${quotient} = ${divisor * quotient}.`,
    ],
    xpReward: difficulty === 'easy' ? 25 : difficulty === 'medium' ? 35 : 50,
  }
}

function genPattern(grade: number, difficulty: 'easy' | 'medium' | 'hard', idx: number): SeedQuestion {
  const step = difficulty === 'easy' ? idx + 1 : difficulty === 'medium' ? (idx % 5) + 2 : (idx % 7) + 3
  const start = (idx % 5) + 1
  const seq = [start, start + step, start + 2 * step, start + 3 * step, start + 4 * step]
  const answer = seq[4]
  const distractors = [answer - 1, answer + step, answer + 1].map(String)
  return {
    id: `NUM-GEN-PAT-G${grade}-${difficulty}-${idx}`,
    grade,
    category: 'numerik',
    subcategory: 'pola',
    difficulty,
    gameType: 'pattern',
    question: `Lengkapi pola: ${seq.slice(0, 4).join(', ')}, ...`,
    options: shuffleOptions(String(answer), distractors),
    answer: String(answer),
    explanation: `Pola bertambah ${step} setiap langkah. Setelah ${seq[3]}, lanjut ${seq[3]} + ${step} = ${answer}.`,
    hints: [
      `Lihat jarak antar angka.`,
      `Tiap angka bertambah berapa?`,
      `Bertambah ${step}, jadi setelah ${seq[3]} adalah ${answer}.`,
    ],
    xpReward: difficulty === 'easy' ? 20 : difficulty === 'medium' ? 30 : 45,
  }
}

function genMoney(grade: number, difficulty: 'easy' | 'medium' | 'hard', idx: number): SeedQuestion {
  const prices: Record<string, number[]> = {
    easy: [2000, 3000, 5000],
    medium: [7500, 12500, 18000],
    hard: [47000, 63500, 88500],
  }
  const pays = [10000, 20000, 50000]
  const price = prices[difficulty][idx % prices[difficulty].length]
  const pay = pays[idx % pays.length]
  const change = pay - price
  const distractors = [change - 1000, change + 2000, change - 2500].map((v) => `Rp ${v.toLocaleString('id-ID')}`)
  return {
    id: `NUM-GEN-MON-G${grade}-${difficulty}-${idx}`,
    grade,
    category: 'numerik',
    subcategory: 'uang',
    difficulty,
    gameType: 'choice',
    question: `Kamu beli barang seharga Rp ${price.toLocaleString('id-ID')} dengan uang Rp ${pay.toLocaleString('id-ID')}. Berapa kembaliannya?`,
    story: `Di toko, kamu memilih barang seharga Rp ${price.toLocaleString('id-ID')}. Kamu membayar dengan uang Rp ${pay.toLocaleString('id-ID')}.`,
    options: shuffleOptions(`Rp ${change.toLocaleString('id-ID')}`, distractors),
    answer: `Rp ${change.toLocaleString('id-ID')}`,
    explanation: `Kembalian = uang bayar - harga = ${pay.toLocaleString('id-ID')} - ${price.toLocaleString('id-ID')} = ${change.toLocaleString('id-ID')}.`,
    hints: [
      `Kembalian = uang bayar dikurangi harga.`,
      `Rp ${pay.toLocaleString('id-ID')} - Rp ${price.toLocaleString('id-ID')} = ?`,
      `Hasilnya Rp ${change.toLocaleString('id-ID')}.`,
    ],
    xpReward: difficulty === 'easy' ? 25 : difficulty === 'medium' ? 35 : 50,
  }
}

function genTime(grade: number, difficulty: 'easy' | 'medium' | 'hard', idx: number): SeedQuestion {
  const baseHour = (idx % 12) + 1
  const add = difficulty === 'easy' ? (idx % 3) + 1 : difficulty === 'medium' ? (idx % 5) + 2 : (idx % 7) + 3
  const result = ((baseHour + add - 1) % 12) + 1
  const distractors = [result === 12 ? 1 : result + 1, result === 1 ? 12 : result - 1, result + 2 > 12 ? result + 2 - 12 : result + 2].map((h) => `pukul ${String(h).padStart(2, '0')}.00`)
  return {
    id: `NUM-GEN-TIM-G${grade}-${difficulty}-${idx}`,
    grade,
    category: 'numerik',
    subcategory: 'waktu',
    difficulty,
    gameType: 'choice',
    question: `Sekarang pukul ${String(baseHour).padStart(2, '0')}.00. ${add} jam kemudian pukul berapa?`,
    options: shuffleOptions(`pukul ${String(result).padStart(2, '0')}.00`, distractors),
    answer: `pukul ${String(result).padStart(2, '0')}.00`,
    explanation: `${baseHour} + ${add} = ${baseHour + add}, setelah 12 kembali ke 1, jadi pukul ${String(result).padStart(2, '0')}.00.`,
    hints: [
      `Tambahkan ${add} ke angka jam.`,
      `${baseHour} + ${add} = ?`,
      `Jika melebihi 12, kurangi 12 lagi.`,
    ],
    xpReward: difficulty === 'easy' ? 20 : difficulty === 'medium' ? 30 : 45,
  }
}

function genGeometry(grade: number, difficulty: 'easy' | 'medium' | 'hard', idx: number): SeedQuestion {
  if (difficulty === 'easy') {
    const shapes = [
      { name: 'segitiga', sides: 3 },
      { name: 'persegi', sides: 4 },
      { name: 'segi lima', sides: 5 },
      { name: 'segi enam', sides: 6 },
    ]
    const s = shapes[idx % shapes.length]
    const distractors = shapes.filter((x) => x.sides !== s.sides).slice(0, 3).map((x) => String(x.sides))
    return {
      id: `NUM-GEN-GEO-G${grade}-${difficulty}-${idx}`,
      grade,
      category: 'numerik',
      subcategory: 'geometri',
      difficulty,
      gameType: 'choice',
      question: `Berapa sisi pada ${s.name}?`,
      options: shuffleOptions(String(s.sides), distractors),
      answer: String(s.sides),
      explanation: `${s.name} memiliki ${s.sides} sisi.`,
      hints: [
        `Lihat nama bentuknya.`,
        `Sesi berapa? Coba bayangkan gambarnya.`,
        `${s.name} punya ${s.sides} sisi.`,
      ],
      xpReward: 20,
    }
  }
  const l = (idx % 8) + 3
  const w = ((idx * 3) % 7) + 2
  const area = l * w
  const distractors = [l + w, area - 2, area + 4].map(String)
  return {
    id: `NUM-GEN-GEO-G${grade}-${difficulty}-${idx}`,
    grade,
    category: 'numerik',
    subcategory: 'geometri',
    difficulty,
    gameType: 'choice',
    question: `Luas persegi panjang dengan panjang ${l} cm dan lebar ${w} cm adalah ...`,
    options: shuffleOptions(`${area} cm²`, distractors.map((d) => `${d} cm²`)),
    answer: `${area} cm²`,
    explanation: `Luas = panjang × lebar = ${l} × ${w} = ${area} cm².`,
    hints: [
      `Rumus luas persegi panjang?`,
      `Luas = panjang × lebar.`,
      `${l} × ${w} = ${area} cm².`,
    ],
    xpReward: difficulty === 'medium' ? 35 : 50,
  }
}

export function generateNumerikBatch(): SeedQuestion[] {
  const out: SeedQuestion[] = []
  const grades = [1, 2, 3, 4, 5, 6]
  const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard']

  grades.forEach((g) => {
    difficulties.forEach((d) => {
      for (let i = 0; i < 4; i++) {
        if (g <= 4) out.push(genAddition(g, d, i))
        if (g <= 4) out.push(genSubtraction(g, d, i))
        if (g >= 2 && g <= 4) out.push(genMultiplication(g, d, i))
        if (g >= 3) out.push(genDivision(g, d, i))
        out.push(genPattern(g, d, i))
        if (g >= 2) out.push(genMoney(g, d, i))
        if (g <= 5) out.push(genTime(g, d, i))
        if (g <= 5) out.push(genGeometry(g, d, i))
      }
    })
  })

  const seen = new Set<string>()
  return out.filter((q) => {
    if (seen.has(q.id)) return false
    seen.add(q.id)
    return true
  })
}
