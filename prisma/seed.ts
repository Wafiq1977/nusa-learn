// NUSA LEARN - Seed script
// Generates comprehensive question bank for grades 1-6 (numerik + literasi)
// Run with: bun run prisma/seed.ts

import { PrismaClient } from '@prisma/client'
import { numerikQuestions, generateNumerikBatch } from './seed-data/numerik'
import { literasiQuestions } from './seed-data/literasi'
import { badges } from './seed-data/badges'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding NUSA LEARN database...')

  // Clear existing
  await db.sessionLog.deleteMany()
  await db.question.deleteMany()
  await db.badge.deleteMany()
  await db.player.deleteMany()

  // Generate numerik questions (template + generated batches)
  const numGen = generateNumerikBatch()
  const allNumerik = [...numerikQuestions, ...numGen]
  console.log(`  Numerik questions: ${allNumerik.length}`)

  // Literasi (curated)
  console.log(`  Literasi questions: ${literasiQuestions.length}`)

  // Badges
  console.log(`  Badges: ${badges.length}`)

  // Insert questions
  for (const q of [...allNumerik, ...literasiQuestions]) {
    await db.question.create({
      data: {
        id: q.id,
        grade: q.grade,
        category: q.category,
        subcategory: q.subcategory,
        difficulty: q.difficulty,
        gameType: q.gameType,
        question: q.question,
        story: q.story ?? null,
        highlight: q.highlight ? JSON.stringify(q.highlight) : null,
        options: JSON.stringify(q.options),
        answer: q.answer,
        explanation: q.explanation,
        hints: JSON.stringify(q.hints),
        xpReward: q.xpReward,
      },
    })
  }

  // Insert badges
  for (const b of badges) {
    await db.badge.create({ data: b })
  }

  console.log('✅ Seed complete!')
  console.log(`   Total questions: ${allNumerik.length + literasiQuestions.length}`)
  console.log(`   Total badges: ${badges.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
