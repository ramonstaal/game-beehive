<template>
  <div class="hive-sheet p-4 pb-24" @click.stop>
    <div class="w-12 h-1 bg-hive-ink/10 rounded-full mx-auto mb-4" />

    <div class="text-center mb-4">
      <div class="w-20 h-20 rounded-hive-pill bg-gradient-to-br from-hive-honey to-hive-honey-light flex items-center justify-center text-4xl mx-auto mb-3 shadow-hive-glow">
        🐝
      </div>
      <h2 class="font-display font-bold text-xl">{{ player.profile?.username || 'Beekeeper' }}</h2>
      <p class="text-sm text-hive-ink-muted">Active since {{ formatDate(player.profile?.createdAt) }}</p>
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
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from '~/stores/player'
import { useGardenStore } from '~/stores/garden'
import { useJournalStore } from '~/stores/journal'

const player = usePlayerStore()
const garden = useGardenStore()
const journal = useJournalStore()

function formatDate(date: Date | undefined) {
  if (!date) return 'recently'
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date)
}
</script>
