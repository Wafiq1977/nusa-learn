'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import type { Question } from '@/store/gameStore'
import { playSound } from '@/lib/nusa/sound'
import { CharacterAvatar } from '@/components/nusa/screens/OnboardingScreen'

interface ShopGameProps {
  question: Question
  onAnswer: (answer: string) => void
  disabled?: boolean
}

interface ShopItem {
  id: string
  name: string
  emoji: string
  price: number
}

// Items for the shop — derived from question options (parse "Rp X" → price)
function parseMoney(s: string): number {
  const m = s.match(/(\d[\d.]*)/)
  return m ? parseInt(m[1].replace(/\./g, ''), 10) : 0
}

function formatRupiah(n: number): string {
  return `Rp ${n.toLocaleString('id-ID')}`
}

// 4 stalls visible at once. The "answer" is the target price.
// Player must pick items so that total = answer. Multiple choice given as item options.
// Simplified: each question gives the answer as a target price, options are stall items,
// and the player must pick the one item matching the answer price. (For now, matches choice semantics with walking.)

// Actually let's make it more interesting: spawn 4 stalls with random items + prices,
// the answer is one of the option strings (e.g., "Rp 5.000"), the player taps the stall with the matching price.
// Character walks to that stall.

const ITEM_POOL: ShopItem[] = [
  { id: 'apple', name: 'Apel', emoji: '🍎', price: 3000 },
  { id: 'milk', name: 'Susu', emoji: '🥛', price: 5000 },
  { id: 'bread', name: 'Roti', emoji: '🍞', price: 4000 },
  { id: 'banana', name: 'Pisang', emoji: '🍌', price: 2000 },
  { id: 'juice', name: 'Jus', emoji: '🧃', price: 7000 },
  { id: 'candy', name: 'Permen', emoji: '🍬', price: 1000 },
  { id: 'cake', name: 'Kue', emoji: '🍰', price: 8000 },
  { id: 'fish', name: 'Ikan', emoji: '🐟', price: 12000 },
  { id: 'egg', name: 'Telur', emoji: '🥚', price: 2500 },
  { id: 'cheese', name: 'Keju', emoji: '🧀', price: 9000 },
  { id: 'water', name: 'Air', emoji: '💧', price: 1500 },
  { id: 'donut', name: 'Donat', emoji: '🍩', price: 6000 },
]

export function ShopGame({ question, onAnswer, disabled }: ShopGameProps) {
  const character = useGameStore((s) => s.character)
  const soundOn = useGameStore((s) => s.settings.sound)
  const reduceMotion = useGameStore((s) => s.settings.reduceMotion)

  const [stalls, setStalls] = useState<ShopItem[]>([])
  const [charPos, setCharPos] = useState(0) // percent left
  const [targetStallIdx, setTargetStallIdx] = useState<number | null>(null)
  const [walking, setWalking] = useState(false)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [chosenIdx, setChosenIdx] = useState<number | null>(null)
  const [receipt, setReceipt] = useState<string | null>(null)

  // Parse target answer — the answer string is like "Rp 5.000" or "5"
  const targetPrice = parseMoney(question.answer)
  const targetStr = question.answer

  // Init: build 4 stalls, ensure one matches the answer price (or the answer string matches)
  useEffect(() => {
    // Try to extract item info from options if they look like items
    // Otherwise generate 4 random items, ensure one has the target price
    const items: ShopItem[] = []
    // Try matching option to item pool by price
    const shuffledPool = [...ITEM_POOL].sort(() => Math.random() - 0.5)
    // First, find or create the "correct" item matching the answer
    let correctItem: ShopItem | undefined = shuffledPool.find((it) => formatRupiah(it.price) === targetStr)
    if (!correctItem) {
      // Pick any item and set its price to match the answer
      correctItem = { ...shuffledPool[0], price: targetPrice || 5000 }
    }
    items.push(correctItem)
    // Add 3 distractor items with different prices
    shuffledPool.forEach((it) => {
      if (items.length >= 4) return
      if (!items.some((x) => x.price === it.price)) {
        items.push({ ...it, price: it.price })
      }
    })
    while (items.length < 4) {
      const it = shuffledPool[items.length % shuffledPool.length]
      if (!items.some((x) => x.price === it.price)) items.push({ ...it })
      else items.push({ ...it, price: it.price + items.length * 1000 })
    }
    // Shuffle order
    items.sort(() => Math.random() - 0.5)
    setStalls(items)
    setCharPos(0)
    setTargetStallIdx(null)
    setWalking(false)
    setResult(null)
    setChosenIdx(null)
    setReceipt(null)
  }, [question, targetStr, targetPrice])

  const handleSelectStall = (idx: number) => {
    if (disabled || walking || result) return
    setChosenIdx(idx)
    setWalking(true)
    if (soundOn) playSound('click')
    const targetX = 12 + (idx * 76) / 3
    setTargetStallIdx(idx)
    // Animate walk
    const stepCount = 10
    let step = 0
    const walkInterval = setInterval(() => {
      step++
      setCharPos((prev) => {
        const next = prev + (targetX - prev) * (step / stepCount)
        return next
      })
      if (step >= stepCount) {
        clearInterval(walkInterval)
        setCharPos(targetX)
        setWalking(false)
        // Reveal result after a moment
        setTimeout(() => {
          if (!stalls[idx]) return
          const chosen = stalls[idx]
          const correct = formatRupiah(chosen.price) === targetStr || String(chosen.price) === targetStr
          setResult(correct ? 'correct' : 'wrong')
          if (soundOn) playSound(correct ? 'coin' : 'wrong')
          setReceipt(
            correct
              ? `✨ ${chosen.emoji} ${chosen.name} = ${formatRupiah(chosen.price)} — Benar!`
              : `💡 ${chosen.emoji} ${chosen.name} = ${formatRupiah(chosen.price)} — Belum tepat. Jawaban: ${targetStr}`,
          )
          setTimeout(() => {
            onAnswer(correct ? question.answer : '__wrong__')
          }, 1400)
        }, 300)
      }
    }, 60)
  }

  return (
    <div className="space-y-3">
      <div className="text-center">
        <div className="text-xs font-bold uppercase tracking-widest text-orange-600">
          🛒 Belanja Seru · {question.subcategory}
        </div>
        <h2 className="mt-1 text-lg font-bold text-slate-800 sm:text-xl">{question.question}</h2>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-700">
          💰 Cari barang dengan harga: <span className="text-amber-900">{question.answer}</span>
        </div>
      </div>

      {/* Shop scene */}
      <div
        className="relative w-full overflow-hidden rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50"
        style={{ aspectRatio: '16/9', minHeight: '40dvh', maxHeight: '65dvh' }}
      >
        {/* Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-amber-200 to-amber-100" />

        {/* Stalls */}
        <div className="absolute top-3 left-0 right-0 flex items-end justify-around px-3">
          {stalls.map((s, i) => (
            <button
              key={s.id + i}
              onClick={() => handleSelectStall(i)}
              disabled={disabled || walking || !!result}
              className={`group relative flex w-1/4 flex-col items-center rounded-2xl p-2 transition-all ${
                chosenIdx === i && result
                  ? result === 'correct'
                    ? 'bg-emerald-200 scale-105 ring-4 ring-emerald-400'
                    : 'bg-amber-200 scale-105 ring-4 ring-amber-400'
                  : 'bg-white/70 hover:bg-white hover:-translate-y-1'
              }`}
              aria-label={`Pilih ${s.name}`}
            >
              {/* Stall roof */}
              <div className="mb-1 h-3 w-full rounded-t-xl bg-gradient-to-r from-orange-400 to-amber-500" />
              {/* Item */}
              <motion.div
                animate={chosenIdx === i ? { scale: [1, 1.2, 1], y: [0, -4, 0] } : { y: [0, -2, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="text-4xl sm:text-5xl"
              >
                {s.emoji}
              </motion.div>
              <div className="text-[10px] font-bold text-slate-700 sm:text-xs">{s.name}</div>
              <div className="mt-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 sm:text-xs">
                {formatRupiah(s.price)}
              </div>
            </button>
          ))}
        </div>

        {/* Walking character */}
        <motion.div
          className="absolute bottom-2 z-10"
          style={{ left: `${charPos}%`, transform: 'translateX(-50%)' }}
          animate={
            walking && !reduceMotion
              ? { y: [0, -6, 0], rotate: [-2, 2, -2] }
              : { y: [0, -2, 0] }
          }
          transition={{ duration: walking ? 0.25 : 1.5, repeat: Infinity }}
        >
          <CharacterAvatar char={character} size={64} />
        </motion.div>

        {/* Receipt overlay */}
        <AnimatePresence>
          {receipt && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-x-4 bottom-12 rounded-2xl p-3 text-center text-sm font-bold shadow-lg backdrop-blur ${
                result === 'correct' ? 'bg-emerald-100/95 text-emerald-800' : 'bg-amber-100/95 text-amber-800'
              }`}
            >
              {receipt}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result emoji */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ opacity: 0 }}
              className="absolute right-4 top-4 text-5xl"
            >
              {result === 'correct' ? '🎉' : '💡'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-center text-[11px] text-slate-500">
        Tap barang di salah satu kios. Karaktermu akan berjalan ke sana dan memeriksa harganya! 🛒
      </p>
    </div>
  )
}
