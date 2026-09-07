// POST /api/hint — NOVA AI hint generator (uses z-ai-web-dev-sdk LLM)
// Body: { question, story?, hintsUsed, recentCorrect, recentWrong, category, grade }
// Returns: { hint: string, expression: 'thinking' | 'helping' | 'encouraging' }
//
// Critical: NEVER reveal the answer. Hints must be progressive & kid-friendly.
import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface HintBody {
  question: string
  story?: string
  hintsUsed: number
  recentCorrect?: number
  recentWrong?: number
  category?: string
  grade?: number
  existingHints?: string[] // fallback hints from DB
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as HintBody
  const {
    question,
    story,
    hintsUsed = 0,
    recentCorrect = 0,
    recentWrong = 0,
    grade = 3,
    existingHints = [],
  } = body

  // If we already have 3+ existing hints, just use them progressively
  if (existingHints.length > 0 && hintsUsed < existingHints.length) {
    return NextResponse.json({
      hint: existingHints[hintsUsed],
      expression: hintsUsed === 0 ? 'helping' : 'thinking',
      source: 'db',
    })
  }

  // Generate a fresh hint using LLM (NOVA's voice)
  try {
    const zai = await ZAI.create()
    const tier = Math.min(hintsUsed + 1, 3) // hint tier 1-3
    const toneByTier = [
      'Berikan petunjuk paling umum — pertanyaan panduan yang membuka jalan pikiran.',
      'Berikan petunjuk menengah — arahkan ke langkah atau bagian spesifik dari soal.',
      'Berikan petunjuk paling spesifik — hampir menuntun ke jawaban, TAPI tetap TIDAK menyebutkan jawaban akhir.',
    ]

    const systemPrompt = `Kamu adalah NOVA, robot pendamping kecil di game edukasi NUSA LEARN untuk siswa Sekolah Dasar (kelas ${grade}) di Indonesia.

ATURAN MUTLAK:
1. JANGAN PERNAH menyebutkan atau mengungkapkan jawaban final.
2. Gunakan bahasa Indonesia yang sederhana, hangat, ramah anak. Hindari bahasa formal.
3. Berikan petunjuk secara bertahap, maksimal 2-3 kalimat.
4. Selalu gunakan kata "kamu" (tidak pakai "Anda").
5. Boleh pakai emoji secukupnya (🤔 💡 ✨ 🔍).
6. Akhiri dengan ajakan yang memotivasi, misalnya "Yuk coba lagi!" atau "Kamu pasti bisa!"

Tingkat petunjuk saat ini: TIER ${tier} (1=umum, 2=menengah, 3=spesifik).
${toneByTier[tier - 1]}

Performa pemain: ${recentCorrect} benar, ${recentWrong} salah baru-baru ini. ${
      recentWrong > recentCorrect
        ? 'Pemain sedang kesulitan, beri petunjuk lebih sabar dan menenangkan.'
        : 'Pemain sedang dalam performa baik, beri petunjuk yang menantang pikiran.'
    }`

    const userPrompt = `Soal: ${question}${story ? `\n\nCerita/teks: ${story}` : ''}

Berikan satu petunjuk TIER ${tier} yang ramah anak. Jangan berikan jawaban. Hanya petunjuk singkat 2-3 kalimat.`

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      thinking: { type: 'disabled' },
    })

    const hint = completion.choices[0]?.message?.content?.trim() ||
      existingHints[hintsUsed] ||
      'Yuk baca soalnya sekali lagi dengan teliti. Perhatikan kata-kata penting. 💡'

    const expression = tier === 1 ? 'helping' : tier === 2 ? 'thinking' : 'encouraging'

    return NextResponse.json({ hint, expression, source: 'llm' })
  } catch (err) {
    console.error('NOVA LLM hint failed:', err)
    // Fallback to DB hints or generic
    const fallback =
      existingHints[hintsUsed] ||
      'Yuk baca soalnya sekali lagi dengan teliti. Perhatikan kata-kata penting. 💡'
    return NextResponse.json({ hint: fallback, expression: 'helping', source: 'fallback' })
  }
}
