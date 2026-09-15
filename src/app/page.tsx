'use client'

import { useEffect, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { GameShell } from '@/components/nusa/GameShell'
import { MusicWidget } from '@/components/nusa/MusicWidget'
import { SplashScreen } from '@/components/nusa/screens/SplashScreen'
import { OnboardingScreen } from '@/components/nusa/screens/OnboardingScreen'
import { HomeScreen } from '@/components/nusa/screens/HomeScreen'
import { WorldMapScreen } from '@/components/nusa/screens/WorldMapScreen'
import { AreaScreen, LevelSelectScreen } from '@/components/nusa/screens/AreaScreen'
import { GameScreen } from '@/components/nusa/screens/GameScreen'
import { ResultScreen } from '@/components/nusa/screens/ResultScreen'
import { ProgressScreen } from '@/components/nusa/screens/ProgressScreen'
import { RewardsScreen } from '@/components/nusa/screens/RewardsScreen'
import { ProfileScreen } from '@/components/nusa/screens/ProfileScreen'
import { SettingsScreen } from '@/components/nusa/screens/SettingsScreen'
import { DailyChallengeScreen } from '@/components/nusa/screens/DailyChallengeScreen'
import { PracticeScreen } from '@/components/nusa/screens/PracticeScreen'
import { ArcadeScreen } from '@/components/nusa/screens/ArcadeScreen'
import { AdminScreen } from '@/components/nusa/screens/AdminScreen'
import { MultiplayerSetupScreen } from '@/components/nusa/screens/MultiplayerSetupScreen'
import { MultiplayerBattleScreen } from '@/components/nusa/screens/MultiplayerBattleScreen'

export default function Home() {
  const [hydrated, setHydrated] = useState(false)
  const view = useGameStore((s) => s.view)
  const hasPlayer = useGameStore((s) => !!s.name)
  const setView = useGameStore((s) => s.setView)
  const tvMode = useGameStore((s) => s.settings.tvMode)
  const displayMode = useGameStore((s) => s.settings.displayMode)

  // Wait for Zustand persist to hydrate from localStorage
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true)
  }, [])

  // Apply display mode + TV mode + reduce motion globally
  useEffect(() => {
    const s = useGameStore.getState().settings
    const html = document.documentElement
    // Remove all mode classes first
    html.classList.remove('mode-mobile', 'mode-tablet', 'mode-desktop', 'mode-tv', 'tv-mode', 'reduce-motion')
    // Apply selected display mode
    if (s.displayMode === 'mobile') html.classList.add('mode-mobile')
    else if (s.displayMode === 'tablet') html.classList.add('mode-tablet')
    else if (s.displayMode === 'desktop') html.classList.add('mode-desktop')
    else if (s.displayMode === 'tv') { html.classList.add('mode-tv'); html.classList.add('tv-mode') }
    // Auto mode: use tvMode toggle as fallback
    else if (s.tvMode) { html.classList.add('tv-mode'); html.classList.add('mode-tv') }
    // Reduce motion
    if (s.reduceMotion || !s.animations) html.classList.add('reduce-motion')
  }, [tvMode, displayMode])

  if (!hydrated) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-nusa-sky">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-500" />
          <p className="mt-3 text-sm text-slate-500">Menyiapkan petualangan...</p>
        </div>
      </div>
    )
  }

  // Splash and onboarding are full-screen (no HUD shell)
  if (view === 'splash') {
    return <SplashScreen />
  }
  if (view === 'onboarding' || !hasPlayer) {
    return <OnboardingScreen />
  }

  // Determine HUD settings per view
  const showBack = view !== 'home'
  const showHome = view !== 'home'
  const showSettings = ['home', 'progress', 'rewards', 'profile', 'settings', 'world_map', 'area', 'level_select', 'daily', 'practice', 'arcade', 'admin', 'multiplayer_setup', 'multiplayer_battle'].includes(view)
  const hideHud = view === 'game' // game has its own progress UI, but we still want HUD for stars/coins

  // Actually game view DOES want HUD for coins/stars/XP
  const bgVariant = view === 'world_map' || view === 'splash' ? 'deep' : 'light'

  return (
    <>
      <GameShell
        showBack={showBack}
        showHome={showHome}
        showSettings={showSettings}
        bgVariant={view === 'world_map' ? 'deep' : 'light'}
        hideHud={false}
      >
        {view === 'home' && <HomeScreen />}
        {view === 'world_map' && <WorldMapScreen />}
        {view === 'area' && <AreaScreen />}
        {view === 'level_select' && <LevelSelectScreen />}
        {view === 'game' && <GameScreen />}
        {view === 'result' && <ResultScreen />}
        {view === 'progress' && <ProgressScreen />}
        {view === 'rewards' && <RewardsScreen />}
        {view === 'profile' && <ProfileScreen />}
        {view === 'settings' && <SettingsScreen />}
        {view === 'daily' && <DailyChallengeScreen />}
        {view === 'practice' && <PracticeScreen />}
        {view === 'arcade' && <ArcadeScreen />}
        {view === 'admin' && <AdminScreen />}
        {view === 'multiplayer_setup' && <MultiplayerSetupScreen />}
        {view === 'multiplayer_battle' && <MultiplayerBattleScreen />}
      </GameShell>
      <MusicWidget />
    </>
  )
}
