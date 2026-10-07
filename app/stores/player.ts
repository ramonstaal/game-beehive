import { defineStore } from 'pinia'

export interface PlayerProfile {
  id: string
  username: string
  avatarSeed: string
  createdAt: Date
}

export const usePlayerStore = defineStore('player', () => {
  const profile = ref<PlayerProfile | null>(null)
  const isAuthenticated = computed(() => !!profile.value)
  const isLoading = ref(false)

  // Demo player for Phase 0
  function initDemoPlayer() {
    profile.value = {
      id: 'player',
      username: 'Beekeeper',
      avatarSeed: 'demo-seed-1',
      createdAt: new Date('2026-10-01'),
    }
  }

  function logout() {
    profile.value = null
  }

  return {
    profile: readonly(profile),
    isAuthenticated,
    isLoading: readonly(isLoading),
    initDemoPlayer,
    logout,
  }
})
