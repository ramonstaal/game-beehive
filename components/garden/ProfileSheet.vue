<template>
  <div class="hive-sheet p-4 pb-24" @click.stop>
    <div class="w-12 h-1 bg-hive-ink/10 rounded-full mx-auto mb-4" />
    <button
      class="absolute top-3 right-4 w-8 h-8 rounded-hive-pill bg-white/80 text-hive-ink-muted hover:text-hive-ink flex items-center justify-center text-lg leading-none shadow-hive-soft"
      aria-label="Close"
      @click="ui.closeSheet"
    >×</button>

    <div class="text-center mb-4">
      <div class="w-20 h-20 rounded-hive-pill bg-gradient-to-br from-hive-honey to-hive-honey-light flex items-center justify-center text-4xl mx-auto mb-3 shadow-hive-glow">
        🐝
      </div>
      <h2 class="font-display font-bold text-xl">{{ player.profile?.username || 'Beekeeper' }}</h2>
      <p class="text-sm text-hive-ink-muted">Active since {{ formatDate(player.profile?.created_at) }}</p>
    </div>

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

    <NuxtLink
      to="/how-to-play"
      class="hive-button hive-button--secondary w-full mt-4 inline-flex justify-center"
      @click="ui.closeSheet"
    >
      📖 How to play
    </NuxtLink>
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
