// Generate soal tambahan untuk subcategory yang kurang dari 20 per grade
// Run: bun run prisma/seed-extra.ts
import { db } from '../src/lib/db'

// Helper
function shuffleOptions(correct: string, distractors: string[]): string[] {
  const opts = [correct, ...distractors]
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[opts[i], opts[j]] = [opts[j], opts[i]]
  }
  return opts
}

interface ExtraQuestion {
  id: string
  grade: number
  category: 'numerik' | 'literasi'
  subcategory: string
  difficulty: 'easy' | 'medium' | 'hard'
  gameType: 'choice' | 'story' | 'pattern' | 'match' | 'build'
  question: string
  story?: string | null
  highlight?: string[] | null
  options: string[]
  answer: string
  explanation: string
  hints: string[]
  xpReward: number
}

// ===== NUMERIK GENERATORS =====
function genPecahan(grade: number, idx: number): ExtraQuestion {
  const ops = ['+', '-', '×']
  const op = ops[idx % 3]
  const a = (idx % 4) + 2
  const b = (idx % 5) + 3
  const c = (idx % 3) + 2
  const d = (idx % 4) + 3
  let answer = ''
  let question = ''
  if (op === '+') {
    // Samakan penyebut sederhana
    if (b === d) {
      answer = `${a + c}/${b}`
      question = `Berapa hasil dari ${a}/${b} + ${c}/${d}?`
    } else {
      const newB = b * d
      const newA = a * d + c * b
      const gcd = gcdFunc(newA, newB)
      answer = gcd > 1 ? `${newA / gcd}/${newB / gcd}` : `${newA}/${newB}`
      question = `Berapa hasil dari ${a}/${b} + ${c}/${d}?`
    }
  } else if (op === '-') {
    if (b === d) {
      answer = `${a - c}/${b}`
      question = `Berapa hasil dari ${a}/${b} - ${c}/${d}? (a > c)`
    } else {
      const newB = b * d
      const newA = Math.abs(a * d - c * b)
      const gcd = gcdFunc(newA, newB)
      answer = gcd > 1 ? `${newA / gcd}/${newB / gcd}` : `${newA}/${newB}`
      question = `Berapa hasil dari ${Math.max(a * d, c * b)}/${newB} - ${Math.min(a * d, c * b)}/${newB}?`
    }
  } else {
    answer = `${a * c}/${b * d}`
    question = `Berapa hasil dari ${a}/${b} × ${c}/${d}?`
  }
  const distractors = [`${a + c}/${b + d}`, `${a * c + 1}/${b * d}`, `${a * c}/${b + d}`]
  return {
    id: `EXTRA-PEC-G${grade}-${idx}`,
    grade, category: 'numerik', subcategory: 'pecahan',
    difficulty: grade <= 3 ? 'easy' : grade <= 4 ? 'medium' : 'hard',
    gameType: 'choice',
    question, options: shuffleOptions(answer, distractors), answer,
    explanation: `Hitung pecahan dengan benar.`,
    hints: ['Lihat penyebutnya', 'Samakan penyebut jika berbeda', 'Kalikan silang jika perlu'],
    xpReward: grade <= 3 ? 25 : 35,
  }
}

function gcdFunc(a: number, b: number): number {
  return b === 0 ? a : gcdFunc(b, a % b)
}

function genSoalCerita(grade: number, idx: number): ExtraQuestion {
  const stories = [
    { q: 'Dina punya 15 kue. Ia memberi 7 kue kepada temannya. Berapa kue Dina sekarang?', a: '8', d: ['6', '7', '9'] },
    { q: 'Sebuah toko menjual 12 kg gula setiap hari. Berapa kg gula terjual dalam 6 hari?', a: '72', d: ['60', '66', '78'] },
    { q: 'Ada 48 siswa dibagi ke 6 kelompok. Berapa siswa per kelompok?', a: '8', d: ['6', '7', '9'] },
    { q: 'Raka bersepeda 3 km setiap hari. Berapa km dalam seminggu?', a: '21', d: ['18', '24', '15'] },
    { q: 'Sebuah kotak berisi 24 permen. Dibagi rata ke 4 anak. Berapa permen per anak?', a: '6', d: ['5', '7', '8'] },
    { q: 'Bu Ani membeli 5 kg apel seharga Rp 15.000 per kg. Berapa total harganya?', a: 'Rp 75.000', d: ['Rp 60.000', 'Rp 70.000', 'Rp 80.000'] },
    { q: 'Sebuah bus berangkat pukul 07.00 dan tiba pukul 10.00. Berapa jam perjalanan?', a: '3 jam', d: ['2 jam', '4 jam', '5 jam'] },
    { q: 'Ada 30 buku dibagi ke 5 rak. Berapa buku per rak?', a: '6', d: ['5', '7', '8'] },
    { q: 'Pak Joko panen 120 kg jagung. Dijual 80 kg. Berapa kg sisanya?', a: '40', d: ['30', '50', '60'] },
    { q: 'Sebuah kolam berisi 500 liter air. Dipakai 200 liter. Berapa liter sisanya?', a: '300', d: ['250', '350', '400'] },
  ]
  const s = stories[idx % stories.length]
  return {
    id: `EXTRA-SC-G${grade}-${idx}`,
    grade, category: 'numerik', subcategory: 'soal_cerita',
    difficulty: grade <= 3 ? 'medium' : 'hard',
    gameType: 'story',
    question: s.q, options: shuffleOptions(s.a, s.d), answer: s.a,
    explanation: `Jawaban: ${s.a}`,
    hints: ['Baca soal dengan teliti', 'Tentukan operasi yang tepat', 'Hitung dengan hati-hati'],
    xpReward: 35,
  }
}

function genPerbandingan(grade: number, idx: number): ExtraQuestion {
  const a = (idx % 5) + 2
  const b = (idx % 7) + 3
  const total = a * (idx % 4 + 5)
  const questions = [
    { q: `Perbandingan umur Andi dan Budi ${a}:${b}. Jika umur Andi ${a * 4} tahun, berapa umur Budi?`, a: `${b * 4}`, d: [`${a * 4 + 2}`, `${b * 4 - 2}`, `${a * b}`] },
    { q: `Perbandingan uang Siti dan Dina ${a}:${b}. Jika total uang Rp ${(a + b) * 1000}, berapa uang Siti?`, a: `Rp ${a * 1000}`, d: [`Rp ${b * 1000}`, `Rp ${(a + b) * 500}`, `Rp ${a * 500}`] },
    { q: `Skala peta 1:${a * 1000}. Jarak pada peta ${b} cm. Berapa jarak sebenarnya?`, a: `${b * a} km`, d: [`${b * a * 10} km`, `${b + a} km`, `${b * a * 100} km`] },
    { q: `Kecepatan mobil ${a * 20} km/jam. Berapa km dalam ${b} jam?`, a: `${a * 20 * b}`, d: [`${a * 20 + b}`, `${a * b * 10}`, `${a * 20 - b}`] },
    { q: `Harga ${a} buku Rp ${(a * 5000)}. Berapa harga ${b} buku?`, a: `Rp ${b * 5000}`, d: [`Rp ${a * b * 5000}`, `Rp ${(a + b) * 5000}`, `Rp ${b * 5000 + 1000}`] },
  ]
  const s = questions[idx % questions.length]
  return {
    id: `EXTRA-PB-G${grade}-${idx}`,
    grade, category: 'numerik', subcategory: 'perbandingan',
    difficulty: grade <= 4 ? 'medium' : 'hard',
    gameType: 'choice',
    question: s.q, options: shuffleOptions(s.a, s.d), answer: s.a,
    explanation: `Hitung perbandingan dengan benar.`,
    hints: ['Cari nilai 1 bagian', 'Kalikan dengan jumlah bagian', 'Pastikan satuan benar'],
    xpReward: 40,
  }
}

function genPengukuran(grade: number, idx: number): ExtraQuestion {
  const questions = [
    { q: 'Berapa cm dalam 1 meter?', a: '100', d: ['10', '1000', '50'] },
    { q: 'Berapa gram dalam 1 kg?', a: '1000', d: ['100', '10000', '500'] },
    { q: 'Berapa menit dalam 1 jam?', a: '60', d: ['100', '30', '90'] },
    { q: 'Berapa detik dalam 1 menit?', a: '60', d: ['100', '30', '90'] },
    { q: 'Berapa mm dalam 1 cm?', a: '10', d: ['100', '1000', '1'] },
    { q: 'Sebuah penggaris panjangnya 30 cm. Berapa mm?', a: '300', d: ['30', '3000', '3'] },
    { q: 'Sebotol air berisi 500 ml. Berapa liter?', a: '0,5', d: ['5', '50', '0,05'] },
    { q: '1 jam 30 menit = ... menit', a: '90', d: ['60', '100', '130'] },
    { q: '2 kg + 500 gram = ... gram', a: '2500', d: ['2000', '500', '700'] },
    { q: 'Sebuah tongkat panjangnya 1,5 meter. Berapa cm?', a: '150', d: ['15', '1500', '105'] },
  ]
  const s = questions[idx % questions.length]
  return {
    id: `EXTRA-PK-G${grade}-${idx}`,
    grade, category: 'numerik', subcategory: 'pengukuran',
    difficulty: grade <= 3 ? 'easy' : 'medium',
    gameType: 'choice',
    question: s.q, options: shuffleOptions(s.a, s.d), answer: s.a,
    explanation: `Konversi satuan pengukuran.`,
    hints: ['Ingat tabel konversi', '1 m = 100 cm, 1 kg = 1000 g', 'Periksa satuan yang ditanya'],
    xpReward: 25,
  }
}

// ===== LITERASI GENERATORS =====
function genMembaca(grade: number, idx: number): ExtraQuestion {
  const stories = [
    { s: 'Hari Minggu, Raka pergi ke kebun binatang bersama keluarga. Ia melihat gajah, jerapah, dan harimau. Raka paling suka gajah karena besar dan kuat.', q: 'Hewan apa yang paling disukai Raka?', a: 'Gajah', d: ['Harimau', 'Jerapah', 'Monyet'] },
    { s: 'Dina pergi ke perpustakaan setiap sore. Ia suka membaca buku tentang luar angkasa. Buku favoritnya adalah tentang planet Mars.', q: 'Apa buku favorit Dina?', a: 'Tentang planet Mars', d: ['Tentang laut', 'Tentang hewan', 'Tentang tanaman'] },
    { s: 'Pak Budi adalah petani. Ia menanam padi di sawah. Setiap pagi ia bekerja di sawah. Hasil panennya dijual di pasar.', q: 'Apa pekerjaan Pak Budi?', a: 'Petani', d: ['Nelayan', 'Guru', 'Pedagang'] },
    { s: 'Siti suka berkebun. Di halaman rumahnya ada tanaman bunga mawar, melati, dan anggrek. Bunga mawar berwarna merah.', q: 'Bunga apa yang berwarna merah?', a: 'Mawar', d: ['Melati', 'Anggrek', 'Semua'] },
    { s: 'Andi bangun pagi pukul 5. Ia mandi, sarapan, lalu berangkat sekolah pukul 6.30. Andi bersepeda ke sekolah.', q: 'Pukul berapa Andi berangkat sekolah?', a: '6.30', d: ['5.00', '6.00', '7.00'] },
    { s: 'Di sekolah, ada perpustakaan besar. Perpustakaan memiliki 500 buku. Buku-buku itu ada yang berbahasa Indonesia dan Inggris.', q: 'Berapa buku di perpustakaan?', a: '500', d: ['400', '600', '1000'] },
    { s: 'Ibu memasak nasi goreng untuk sarapan. Bahan yang dipakai: beras, telur, dan bumbu. Nasi gorengnya sangat lezat.', q: 'Apa yang ibu masak?', a: 'Nasi goreng', d: ['Mie goreng', 'Sup', 'Sate'] },
    { s: 'Musim hujan tiba. Tanaman menjadi hijau. Sawah penuh air. Petani senang karena tanamannya tumbuh subur.', q: 'Mengapa petani senang?', a: 'Tanaman tumbuh subur', d: ['Hujan deras', 'Sawah basah', 'Musim panas'] },
    { s: 'Lina berlatih piano setiap hari. Ia ingin menjadi pianis terkenal. Lina sudah berlatih sejak umur 7 tahun.', q: 'Apa cita-cita Lina?', a: 'Pianis', d: ['Penyanyi', 'Guru', 'Dokter'] },
    { s: 'Pasar tradisional sangat ramai. Ada yang menjual sayur, buah, ikan, dan daging. Bu Ani membeli sayur bayam dan wortel.', q: 'Apa yang dibeli Bu Ani?', a: 'Bayam dan wortel', d: ['Ikan dan daging', 'Buah saja', 'Sayur saja'] },
  ]
  const item = stories[idx % stories.length]
  return {
    id: `EXTRA-MB-G${grade}-${idx}`,
    grade, category: 'literasi', subcategory: 'membaca',
    difficulty: grade <= 2 ? 'easy' : grade <= 4 ? 'medium' : 'hard',
    gameType: 'story',
    question: item.q, story: item.s, highlight: null,
    options: shuffleOptions(item.a, item.d), answer: item.a,
    explanation: `Jawaban ada di teks: ${item.a}`,
    hints: ['Baca teks dengan teliti', 'Cari kalimat yang relevan', 'Pastikan jawaban sesuai teks'],
    xpReward: 20,
  }
}

function genIdePokok(grade: number, idx: number): ExtraQuestion {
  const items = [
    { s: 'Kebersihan sangat penting. Kita harus mencuci tangan sebelum makan. Mandi dua kali sehari. Kamar tidur harus bersih.', q: 'Apa ide pokok paragraf?', a: 'Kebersihan sangat penting', d: ['Makan itu enak', 'Tidur itu sehat', 'Bermain itu menyenangkan'] },
    { s: 'Olahraga membuat tubuh sehat. Kita bisa lari, bersepeda, atau berenang. Olahraga juga membuat kita kuat.', q: 'Apa ide pokoknya?', a: 'Olahraga membuat tubuh sehat', d: ['Lari itu cepat', 'Sepeda itu murah', 'Renang itu basah'] },
    { s: 'Membaca buku menambah wawasan. Dari buku kita tahu banyak hal. Buku adalah jendela dunia.', q: 'Apa ide pokoknya?', a: 'Membaca buku menambah wawasan', d: ['Buku itu mahal', 'Dunia itu luas', 'Jendela itu kaca'] },
    { s: 'Pohon sangat berguna. Pohon menghasilkan oksigen. Pohon memberi naungan. Pohon mencegah banjir.', q: 'Apa ide pokoknya?', a: 'Pohon sangat berguna', d: ['Oksigen itu udara', 'Banjir itu bahaya', 'Naungan itu teduh'] },
    { s: 'Rajin belajar membuat kita pintar. Nilai menjadi bagus. Kita bisa mencapai cita-cita.', q: 'Apa ide pokoknya?', a: 'Rajin belajar membuat pintar', d: ['Nilai itu angka', 'Cita-cita itu impian', 'Pintar itu bagus'] },
    { s: 'Hemat air sangat penting. Matikan keran saat tidak dipakai. Gunakan air secukupnya. Air adalah sumber kehidupan.', q: 'Apa ide pokoknya?', a: 'Hemat air sangat penting', d: ['Keran itu besi', 'Air itu basah', 'Kehidupan itu panjang'] },
    { s: 'Sarapan pagi memberi energi. Tubuh menjadi kuat. Otak menjadi segar untuk belajar.', q: 'Apa ide pokoknya?', a: 'Sarapan pagi memberi energi', d: ['Energi itu listrik', 'Otak itu kepala', 'Belajar itu susah'] },
    { s: 'Tidur cukup membuat sehat. Anak harus tidur 8-9 jam. Tidur membuat tubuh istirahat.', q: 'Apa ide pokoknya?', a: 'Tidur cukup membuat sehat', d: ['8 jam itu lama', 'Istirahat itu duduk', 'Sehat itu mahal'] },
  ]
  const item = items[idx % items.length]
  return {
    id: `EXTRA-IP-G${grade}-${idx}`,
    grade, category: 'literasi', subcategory: 'ide_pokok',
    difficulty: grade <= 2 ? 'easy' : 'medium',
    gameType: 'story',
    question: item.q, story: item.s, highlight: null,
    options: shuffleOptions(item.a, item.d), answer: item.a,
    explanation: `Ide pokok adalah gagasan utama: ${item.a}`,
    hints: ['Cari kalimat utama', 'Pikirkan apa yang dibahas seluruh paragraf', 'Pilih yang paling mewakili seluruh teks'],
    xpReward: 25,
  }
}

function genInformasi(grade: number, idx: number): ExtraQuestion {
  const items = [
    { s: 'Raka berangkat sekolah pukul 6.30. Ia naik sepeda. Jarak sekolah 2 km dari rumah.', q: 'Pukul berapa Raka berangkat?', a: '6.30', d: ['5.30', '7.00', '6.00'] },
    { s: 'Di kelas 3 ada 30 siswa. 15 laki-laki dan 15 perempuan. Wali kelas mereka Pak Budi.', q: 'Siapa wali kelas?', a: 'Pak Budi', d: ['Bu Ani', 'Pak Joko', 'Bu Dina'] },
    { s: 'Pasar buka pukul 5 pagi dan tutup pukul 5 sore. Banyak penjual sayur dan buah di sana.', q: 'Pukul berapa pasar tutup?', a: '5 sore', d: ['5 pagi', '12 siang', '9 malam'] },
    { s: 'Kucing Dina bernama Meong. Meong berwarna putih. Umurnya 2 tahun.', q: 'Berapa umur Meong?', a: '2 tahun', d: ['1 tahun', '3 tahun', '5 tahun'] },
    { s: 'Andi punya 10 kelereng. Ia memenangkan 5 lagi. Sekarang ia punya 15 kelereng.', q: 'Berapa kelereng Andi sekarang?', a: '15', d: ['10', '5', '20'] },
    { s: 'Bu Ani membuat kue. Bahan: 2 kg tepung, 1 kg gula, 10 butir telur. Kue dipanggang 30 menit.', q: 'Berapa lama kue dipanggang?', a: '30 menit', d: ['20 menit', '40 menit', '1 jam'] },
    { s: 'Tol Sedyatmo panjangnya 12 km. Dibangun tahun 1998. Menghubungkan Jakarta dengan Bandara Soekarno-Hatta.', q: 'Tahun berapa Tol Sedyatmo dibangun?', a: '1998', d: ['1990', '2000', '2010'] },
    { s: 'Gunung Merapi tingginya 2.930 meter. Terletak di Yogyakarta. Terakhir meletus tahun 2010.', q: 'Berapa tinggi Gunung Merapi?', a: '2.930 meter', d: ['2.000 meter', '3.000 meter', '1.500 meter'] },
  ]
  const item = items[idx % items.length]
  return {
    id: `EXTRA-INF-G${grade}-${idx}`,
    grade, category: 'literasi', subcategory: 'informasi',
    difficulty: grade <= 2 ? 'easy' : 'medium',
    gameType: 'story',
    question: item.q, story: item.s, highlight: null,
    options: shuffleOptions(item.a, item.d), answer: item.a,
    explanation: `Informasi dari teks: ${item.a}`,
    hints: ['Cari kalimat yang berisi jawaban', 'Perhatikan angka dan nama', 'Pastikan jawaban ada di teks'],
    xpReward: 20,
  }
}

function genKosakata(grade: number, idx: number): ExtraQuestion {
  const items = [
    { q: 'Apa sinonim dari "besar"?', a: 'Raksasa', d: ['Kecil', 'Sempit', 'Pendek'] },
    { q: 'Apa sinonim dari "cepat"?', a: 'Kilat', d: ['Lambat', 'Pelan', 'Lambat'] },
    { q: 'Apa sinonim dari "senang"?', a: 'Gembira', d: ['Sedih', 'Marah', 'Takut'] },
    { q: 'Apa lawan kata dari "panjang"?', a: 'Pendek', d: ['Lebar', 'Tinggi', 'Besar'] },
    { q: 'Apa lawan kata dari "panas"?', a: 'Dingin', d: ['Hangat', 'Sejuk', 'Basah'] },
    { q: 'Apa lawan kata dari "naik"?', a: 'Turun', d: ['Jatuh', 'Lari', 'Diam'] },
    { q: 'Apa arti dari "rajin"?', a: 'Selalu bekerja keras', d: ['Malas bekerja', 'Suka tidur', 'Tidak mau belajar'] },
    { q: 'Apa arti dari "hemat"?', a: 'Menggunakan dengan bijak', d: ['Boros', 'Kikir', 'Mewah'] },
    { q: 'Apa sinonim dari "pintar"?', a: 'Cerdas', d: ['Bodoh', 'Malas', 'Lambat'] },
    { q: 'Apa lawan kata dari "murah"?', a: 'Mahal', d: ['Gratis', 'Murahan', 'Laris'] },
    { q: 'Apa arti dari "ramah"?', a: 'Baik hati dan sopan', d: ['Pemarah', 'Kasar', 'Dingin'] },
    { q: 'Apa sinonim dari "indah"?', a: 'Cantik', d: ['Jelek', 'Buruk', 'Kotor'] },
  ]
  const item = items[idx % items.length]
  return {
    id: `EXTRA-KV-G${grade}-${idx}`,
    grade, category: 'literasi', subcategory: 'kosakata',
    difficulty: grade <= 2 ? 'easy' : 'medium',
    gameType: 'choice',
    question: item.q, options: shuffleOptions(item.a, item.d), answer: item.a,
    explanation: `Sinonim/antonim: ${item.a}`,
    hints: ['Pikirkan kata yang mirip maknanya', 'Lawan kata = kebalikan', 'Coba kata lain dengan makna sama'],
    xpReward: 20,
  }
}

function genKarakter(grade: number, idx: number): ExtraQuestion {
  const items = [
    { s: 'Dina menemukan dompet di jalan. Dompet berisi uang. Dina tidak mengambil uangnya. Ia menyerahkan dompet ke polisi.', q: 'Apa sifat Dina?', a: 'Jujur', d: ['Pembohong', 'Pemalas', 'Pemarah'] },
    { s: 'Andi selalu membantu ibunya mencuci piring. Ia juga membersihkan kamar sendiri tanpa disuruh.', q: 'Apa sifat Andi?', a: 'Rajin', d: ['Malas', 'Egois', 'Nakal'] },
    { s: 'Raka berbagi makanannya dengan teman yang tidak membawa bekal. Temannya sangat senang.', q: 'Apa sifat Raka?', a: ' Dermawan', d: ['Pelit', 'Egois', 'Sombong'] },
    { s: 'Siti tidak pernah menyerah saat belajar matematika. Ia terus berlatih sampai paham.', q: 'Apa sifat Siti?', a: 'Pantang menyerah', d: ['Mudah menyerah', 'Pemalas', 'Cepat marah'] },
    { s: 'Budi selalu mengucapkan terima kasih saat diberi sesuatu. Ia juga sopan kepada guru.', q: 'Apa sifat Budi?', a: 'Sopan', d: ['Kasar', 'Sombong', 'Jahat'] },
    { s: 'Lina menolong teman yang jatuh di lapangan. Ia menggendong temannya ke UKS.', q: 'Apa sifat Lina?', a: 'Peduli', d: ['Tidak peduli', 'Egois', 'Acuh'] },
    { s: 'Pak Joko bekerja dari pagi sampai sore di sawah. Ia tidak pernah mengeluh.', q: 'Apa sifat Pak Joko?', a: 'Pekerja keras', d: ['Pemalas', 'Pembosan', 'Pengeluh'] },
    { s: 'Dina selalu mengerjakan PR sendiri tanpa menyontek. Ia jujur saat ujian.', q: 'Apa sifat Dina?', a: 'Jujur', d: ['Penyontek', 'Pembohong', 'Curang'] },
  ]
  const item = items[idx % items.length]
  return {
    id: `EXTRA-KR-G${grade}-${idx}`,
    grade, category: 'literasi', subcategory: 'karakter',
    difficulty: grade <= 2 ? 'easy' : 'medium',
    gameType: 'story',
    question: item.q, story: item.s, highlight: null,
    options: shuffleOptions(item.a.trim(), item.d), answer: item.a.trim(),
    explanation: `Sifat tokoh: ${item.a.trim()}`,
    hints: ['Perhatikan tindakan tokoh', 'Tindakan menunjukkan sifat', 'Pilih sifat yang sesuai'],
    xpReward: 25,
  }
}

function genSebabAkibat(grade: number, idx: number): ExtraQuestion {
  const items = [
    { s: 'Hujan turun sangat deras. Jalanan menjadi banjir. Air masuk ke rumah warga.', q: 'Apa penyebab banjir?', a: 'Hujan deras', d: ['Rumah bocor', 'Air keran', 'Kanal penuh'] },
    { s: 'Raka tidak sarapan pagi. Saat belajar, perutnya terasa lapar. Ia tidak bisa konsentrasi.', q: 'Apa penyebab Raka tidak konsentrasi?', a: 'Tidak sarapan', d: ['Belajar susah', 'Pintar sekali', 'Ruang berisik'] },
    { s: 'Tanaman tidak disiram setiap hari. Daunnya menjadi kering. Tanaman mati.', q: 'Apa penyebab tanaman mati?', a: 'Tidak disiram', d: ['Terlalu banyak air', 'Kena sinar matahari', 'Dipotong'] },
    { s: 'Andi rajin belajar setiap hari. Nilainya menjadi bagus. Ia juara kelas.', q: 'Apa penyebab Andi juara?', a: 'Rajin belajar', d: ['Pintar alami', 'Menyontek', 'Beruntung'] },
    { s: 'Bu Ani membeli banyak sayur. Harga sayur sedang murah. Ia membeli untuk seminggu.', q: 'Apa penyebab Bu Ani beli banyak?', a: 'Harga murah', d: ['Sayur busuk', 'Uang banyak', 'Laper'] },
    { s: 'Jalan licin karena hujan. Sepeda motor tergelincir. Pengendanya jatuh.', q: 'Apa penyebab pengendara jatuh?', a: 'Jalan licin', d: ['Motor rusak', 'Sopan', 'Rem blong'] },
    { s: 'Lina minum susu setiap hari. Tulangnya menjadi kuat. Badannya sehat.', q: 'Apa penyebab tulang Lina kuat?', a: 'Minum susu', d: ['Olahraga', 'Makan sayur', 'Tidur'] },
    { s: 'Pohon di bukit ditebangi. Saat hujan turun, terjadi longsor. Tanah menutup jalan.', q: 'Apa penyebab longsor?', a: 'Pohon ditebang', d: ['Hujan asam', 'Gempa', 'Angin kencang'] },
  ]
  const item = items[idx % items.length]
  return {
    id: `EXTRA-SA-G${grade}-${idx}`,
    grade, category: 'literasi', subcategory: 'sebab_akibat',
    difficulty: grade <= 2 ? 'easy' : 'medium',
    gameType: 'story',
    question: item.q, story: item.s, highlight: null,
    options: shuffleOptions(item.a, item.d), answer: item.a,
    explanation: `Sebab: ${item.a}`,
    hints: ['Cari kata "karena" atau "sebab"', 'Tanyakan: kenapa ini terjadi?', 'Pilih penyebab utama'],
    xpReward: 25,
  }
}

function genMenyimpulkan(grade: number, idx: number): ExtraQuestion {
  const items = [
    { s: 'Andi bangun pagi, mandi, sarapan, lalu berangkat sekolah. Ia naik sepeda. Di sekolah ia belajar dengan rajin.', q: 'Apa yang bisa disimpulkan tentang Andi?', a: 'Andi adalah siswa yang rajin', d: ['Andi malas', 'Andi tidak sekolah', 'Andi suka tidur'] },
    { s: 'Dina merawat tanaman di halaman. Ia menyiram setiap hari. Tanamannya tumbuh subur dan berbunga.', q: 'Apa kesimpulan dari cerita?', a: 'Dina pandai merawat tanaman', d: ['Dina tidak suka tanaman', 'Tanaman itu liar', 'Dina malas'] },
    { s: 'Pak Joko bekerja di sawah dari pagi. Ia menanam padi. Panen padi melimpah setiap tahun.', q: 'Apa kesimpulan tentang Pak Joko?', a: 'Pak Joko petani yang sukses', d: ['Pak Joko nelayan', 'Pak Joko guru', 'Pak Joko malas'] },
    { s: 'Siti selalu membaca buku di perpustakaan. Ia tahu banyak hal. Teman-teman sering bertanya kepadanya.', q: 'Apa kesimpulan tentang Siti?', a: 'Siti banyak pengetahuan', d: ['Siti tidak pintar', 'Siti malas baca', 'Siti pemalu'] },
    { s: 'Raka berlatih piano setiap hari. Jari-jarinya lincah. Ia bisa memainkan lagu sulit.', q: 'Apa kesimpulannya?', a: 'Raka pianis yang terlatih', d: ['Raka pemula', 'Raka tidak musikal', 'Raka pemalas'] },
    { s: 'Bu Ani memasak untuk keluarga setiap hari. Masakannya selalu enak. Keluarganya suka makan di rumah.', q: 'Apa kesimpulannya?', a: 'Bu Ani pandai memasak', d: ['Bu Ani tidak masak', 'Bu Ani beli makanan', 'Bu Ani malas'] },
  ]
  const item = items[idx % items.length]
  return {
    id: `EXTRA-MS-G${grade}-${idx}`,
    grade, category: 'literasi', subcategory: 'menyimpulkan',
    difficulty: grade <= 3 ? 'medium' : 'hard',
    gameType: 'story',
    question: item.q, story: item.s, highlight: null,
    options: shuffleOptions(item.a, item.d), answer: item.a,
    explanation: `Kesimpulan: ${item.a}`,
    hints: ['Gabungkan informasi dari teks', 'Pikirkan apa yang tersirat', 'Pilih yang paling masuk akal'],
    xpReward: 30,
  }
}

function genMenyusunKalimat(grade: number, idx: number): ExtraQuestion {
  const items = [
    { q: 'Susun kata berikut menjadi kalimat: "kita - memperoleh - pengetahuan - dari - membaca - buku"', a: 'Kita memperoleh pengetahuan dari membaca buku', d: ['Dari buku kita membaca memperoleh pengetahuan', 'Membaca buku dari kita memperoleh pengetahuan', 'Pengetahuan memperoleh kita dari buku membaca'] },
    { q: 'Susun kata: "pagi - mandi - aku - setiap"', a: 'Aku mandi setiap pagi', d: ['Pagi setiap aku mandi', 'Mandi aku setiap pagi', 'Setiap pagi mandi aku'] },
    { q: 'Susun kata: "Raka - buku - membaca - di - perpustakaan"', a: 'Raka membaca buku di perpustakaan', d: ['Di perpustakaan Raka buku membaca', 'Buku Raka membaca di perpustakaan', 'Perpustakaan di Raka membaca buku'] },
    { q: 'Susun kata: "kita - selalu - jaga - lingkungan - bersih"', a: 'Kita selalu jaga lingkungan bersih', d: ['Lingkungan bersih kita selalu jaga', 'Bersih lingkungan kita selalu jaga', 'Selalu jaga bersih kita lingkungan'] },
    { q: 'Susun kata: "kita - harus - jaga - lingkungan - tetap - lestari"', a: 'Kita harus jaga lingkungan tetap lestari', d: ['Lingkungan lestari kita harus jaga tetap', 'Jaga lingkungan kita harus tetap lestari', 'Lestari tetap lingkungan jaga kita harus'] },
    { q: 'Susun kata: "belajar - rajin - agar - pintar - kita"', a: 'Kita rajin belajar agar pintar', d: ['Agar pintar kita rajin belajar', 'Pintar kita agar rajin belajar', 'Rajin pintar agar belajar kita'] },
    { q: 'Susun kata: "guru - mengajar - di - kelas - dengan - sabar"', a: 'Guru mengajar di kelas dengan sabar', d: ['Di kelas guru sabar mengajar dengan', 'Sabar guru mengajar di kelas dengan', 'Kelas di guru mengajar sabar dengan'] },
    { q: 'Susun kata: "anak - sopan - selalu - kepada - guru"', a: 'Anak sopan selalu kepada guru', d: ['Guru sopan selalu anak kepada', 'Selalu sopan guru anak kepada', 'Kepada guru sopan selalu anak'] },
  ]
  const item = items[idx % items.length]
  return {
    id: `EXTRA-MK-G${grade}-${idx}`,
    grade, category: 'literasi', subcategory: 'menyusun_kalimat',
    difficulty: grade <= 2 ? 'easy' : grade <= 4 ? 'medium' : 'hard',
    gameType: 'build',
    question: item.q, options: item.d.concat(item.a).sort(() => Math.random() - 0.5).slice(0, 4), answer: item.a,
    explanation: 'Urutan: subjek - predikat - objek - keterangan',
    hints: ['Cari subjek (siapa)', 'Cari predikat (apa yang dilakukan)', 'Susun: subjek-predikat-objek-keterangan'],
    xpReward: 30,
  }
}

function genKalimat(grade: number, idx: number): ExtraQuestion {
  const items = [
    { q: 'Kalimat mana yang menggunakan tanda baca dengan benar?', a: 'Saya pergi ke pasar.', d: ['Saya pergi ke pasar', 'saya pergi ke pasar.', 'Saya pergi ke pasar?'] },
    { q: 'Kalimat mana yang benar?', a: 'Ibu memasak di dapur.', d: ['Ibu memasak di dapur', 'ibu memasak di dapur.', 'Ibu Memasak di Dapur.'] },
    { q: 'Kalimat mana yang menggunakan huruf kapital dengan benar?', a: 'Jakarta adalah ibu kota Indonesia.', d: ['jakarta adalah ibu kota indonesia.', 'Jakarta Adalah Ibu Kota Indonesia.', 'jakarta Adalah ibu kota Indonesia.'] },
    { q: 'Kalimat tanya mana yang benar?', a: 'Siapa nama kamu?', d: ['Siapa nama kamu.', 'siapa nama kamu?', 'Siapa Nama Kamu?'] },
    { q: 'Kalimat mana yang benar?', a: 'Budi bermain bola di lapangan.', d: ['budi bermain bola di lapangan.', 'Budi bermain Bola di Lapangan.', 'Budi bermain bola di lapangan'] },
    { q: 'Kalimat seru mana yang benar?', a: 'Wah, pemandangannya indah sekali!', d: ['Wah pemandangannya indah sekali.', 'wah, pemandangannya indah sekali!', 'Wah, Pemandangannya Indah Sekali!'] },
  ]
  const item = items[idx % items.length]
  return {
    id: `EXTRA-KL-G${grade}-${idx}`,
    grade, category: 'literasi', subcategory: 'kalimat',
    difficulty: grade <= 2 ? 'easy' : 'medium',
    gameType: 'choice',
    question: item.q, options: shuffleOptions(item.a, item.d), answer: item.a,
    explanation: 'Perhatikan huruf kapital dan tanda baca',
    hints: ['Kalimat diawali huruf kapital', 'Kalimat diakhiri tanda titik/tanda tanya/tanda seru', 'Perhatikan tanda baca'],
    xpReward: 20,
  }
}

function genFaktaOpini(grade: number, idx: number): ExtraQuestion {
  const items = [
    { q: 'Manakah yang merupakan fakta?', a: 'Air mendidih pada suhu 100°C', d: ['Bola basket lebih seru dari sepak bola', 'Gula rasa manis itu enak', 'Lagu favoritku adalah pop'] },
    { q: 'Manakah yang merupakan opini?', a: 'Bunga mawar adalah bunga terindah', d: ['Matahari terbit dari timur', 'Air mengalir ke bawah', 'Bumi mengelilingi matahari'] },
    { q: 'Manakah yang merupakan fakta?', a: 'Indonesia merdeka tahun 1945', d: ['Mie goreng lebih enak dari nasi goreng', 'Biru adalah warna terbaik', 'Bersepeda itu menyenangkan'] },
    { q: 'Manakah yang merupakan opini?', a: 'Cokelat adalah makanan terenak', d: ['Gunung tertinggi di Indonesia adalah Puncak Jaya', 'Ibukota Indonesia adalah Jakarta', 'Bumi berbentuk bulat'] },
    { q: 'Manakah yang merupakan fakta?', a: 'Manusia membutuhkan oksigen untuk hidup', d: ['Oksigen itu segar', 'Hidup itu menyenangkan', 'Bernapas itu sehat'] },
    { q: 'Manakah yang merupakan opini?', a: 'Libur sekolah adalah waktu terbaik', d: ['Sekolah dimulai pukul 7 pagi', 'Ada 6 hari kerja dalam seminggu', 'Belajar dilakukan di kelas'] },
  ]
  const item = items[idx % items.length]
  return {
    id: `EXTRA-FO-G${grade}-${idx}`,
    grade, category: 'literasi', subcategory: 'fakta_opini',
    difficulty: grade <= 4 ? 'medium' : 'hard',
    gameType: 'choice',
    question: item.q, options: shuffleOptions(item.a, item.d), answer: item.a,
    explanation: 'Fakta = bisa dibuktikan. Opini = pendapat pribadi.',
    hints: ['Fakta bisa dibuktikan kebenarannya', 'Opini adalah pendapat atau perasaan', 'Coba tanya: bisakah ini dibuktikan?'],
    xpReward: 30,
  }
}

// ===== MAIN =====
async function main() {
  console.log('🌱 Generating extra questions...')

  const extra: ExtraQuestion[] = []
  let counter = 0

  // Generate untuk setiap grade, setiap subcategory yang kurang dari 20
  for (let grade = 1; grade <= 6; grade++) {
    // NUMERIK
    // Pecahan: butuh ~17-19 per grade
    for (let i = 0; i < 17; i++) extra.push(genPecahan(grade, i))
    // Soal cerita: butuh ~19 per grade
    for (let i = 0; i < 19; i++) extra.push(genSoalCerita(grade, i))
    // Perbandingan: butuh ~19 per grade (grade 3+)
    if (grade >= 3) for (let i = 0; i < 19; i++) extra.push(genPerbandingan(grade, i))
    // Pengukuran: butuh ~19 per grade
    for (let i = 0; i < 19; i++) extra.push(genPengukuran(grade, i))

    // LITERASI
    // Membaca: butuh ~13 per grade
    for (let i = 0; i < 13; i++) extra.push(genMembaca(grade, i))
    // Ide pokok: butuh ~16 per grade
    for (let i = 0; i < 16; i++) extra.push(genIdePokok(grade, i))
    // Informasi: butuh ~12 per grade
    for (let i = 0; i < 12; i++) extra.push(genInformasi(grade, i))
    // Kosakata: butuh ~13 per grade
    for (let i = 0; i < 13; i++) extra.push(genKosakata(grade, i))
    // Kalimat: butuh ~16 per grade
    for (let i = 0; i < 16; i++) extra.push(genKalimat(grade, i))
    // Karakter: butuh ~16 per grade
    for (let i = 0; i < 16; i++) extra.push(genKarakter(grade, i))
    // Sebab-akibat: butuh ~16 per grade
    for (let i = 0; i < 16; i++) extra.push(genSebabAkibat(grade, i))
    // Menyimpulkan: butuh ~17 per grade
    for (let i = 0; i < 17; i++) extra.push(genMenyimpulkan(grade, i))
    // Menyusun kalimat: butuh ~16 per grade
    for (let i = 0; i < 16; i++) extra.push(genMenyusunKalimat(grade, i))
    // Fakta-opini: butuh ~14 per grade (grade 3+)
    if (grade >= 3) for (let i = 0; i < 14; i++) extra.push(genFaktaOpini(grade, i))
  }

  console.log(`  Generated ${extra.length} extra questions`)

  // Insert ke database
  let inserted = 0
  for (const q of extra) {
    try {
      await db.question.create({
        data: {
          id: q.id,
          grade: q.grade,
          category: q.category,
          subcategory: q.subcategory,
          difficulty: q.difficulty,
          gameType: q.gameType,
          question: q.question,
          story: q.story || null,
          highlight: q.highlight ? JSON.stringify(q.highlight) : null,
          options: JSON.stringify(q.options),
          answer: q.answer,
          explanation: q.explanation,
          hints: JSON.stringify(q.hints),
          xpReward: q.xpReward,
        },
      })
      inserted++
    } catch (e) {
      // Skip kalau sudah ada (id conflict)
    }
  }

  console.log(`  Inserted ${inserted} new questions`)
  const total = await db.question.count()
  console.log(`✅ Total questions now: ${total}`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
