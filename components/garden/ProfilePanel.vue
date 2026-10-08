<template>
  <div class="flex-1 overflow-y-auto p-4 pt-0">
    <h2 class="font-display font-bold text-xl text-hive-ink mb-4">Profile</h2>

    <HiveCard class="text-center p-6 mb-4">
      <div class="w-20 h-20 rounded-hive-pill bg-gradient-to-br from-hive-honey to-hive-honey-light flex items-center justify-center text-4xl mx-auto mb-3 shadow-hive-glow">
        🐝
      </div>
      <h3 class="font-display font-bold text-lg">{{ player.profile?.username || 'Beekeeper' }}</h3>
      <p class="text-sm text-hive-ink-muted">Active since {{ formatDate(player.profile?.created_at) }}</p>
    </HiveCard>

    <div class="space-y-2">
      <HiveCard class="p-3 flex items-center justify-between">
        <span class="text-sm text-hive-ink-light">Gardens visited</span>
        <span class="font-display font-bold">12</span>
      </HiveCard>
      <HiveCard class="p-3 flex items-center justify-between">
        <span class="text-sm text-hive-ink-light">Flowers planted</span>
        <span class="font-display font-bold">{{ garden.garden.flowerCount }}</span>
      </HiveCard>
      <HiveCard class="p-3 flex items-center justify-between">
        <span class="text-sm text-hive-ink-light">Bees helped</span>
        <span class="font-display font-bold">318</span>
      </HiveCard>
      <HiveCard class="p-3 flex items-center justify-between">
        <span class="text-sm text-hive-ink-light">Discoveries</span>
        <span class="font-display font-bold">{{ journal.discoveries.length }}</span>
      </HiveCard>
    </div>

    <NuxtLink to="/how-to-play" class="hive-button hive-button--secondary w-full mt-4 inline-flex justify-center">
      📖 How to play
    </NuxtLink>

    <HiveButton variant="ghost" class="w-full mt-2" @click="ui.showToast('Settings coming soon!', '🔧')">
      Settings
    </HiveButton>
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from '~/stores/player'
import { useGardenStore } from '~/stores/garden'
import { useJournalStore } from '~/stores/journal'
import { useUiStore } from '~/stores/ui'

const player = usePlayerStore()
const garden = useGardenStore()
const journal = useJournalStore()
const ui = useUiStore()

function formatDate(date: string | Date | undefined) {
  if (!date) return 'recently'
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return 'recently'
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(d)
}
</script>
