<template>
  <div class="flex-1 overflow-y-auto p-4 pt-0">
    <h2 class="font-display font-bold text-xl text-hive-ink mb-4">Field Journal</h2>

    <!-- Stats Overview -->
    <div class="grid grid-cols-2 gap-2 mb-4">
      <HiveCard v-for="(stat, key) in journal.stats" :key="key" class="p-3 text-center">
        <div class="text-2xl mb-1">
          {{ key === 'flowers' ? '🌼' : key === 'bees' ? '🐝' : key === 'honey' ? '🍯' : key === 'phenomena' ? '✨' : '🌍' }}
        </div>
        <div class="font-display font-bold text-lg">{{ stat.current }} <span class="text-hive-ink-muted text-sm">/ {{ stat.total }}</span></div>
        <div class="text-xs text-hive-ink-muted capitalize">{{ key }}</div>
      </HiveCard>
    </div>

    <!-- Recent Discoveries -->
    <h3 class="font-display font-semibold text-sm text-hive-ink mb-2">Recent Discoveries</h3>
    <div class="space-y-2">
      <div
        v-for="discovery in journal.discoveries"
        :key="discovery.id"
        class="hive-card p-3 flex items-center gap-3"
      >
        <div class="text-2xl">{{ discovery.icon }}</div>
        <div class="flex-1">
          <p class="font-display font-semibold text-sm">{{ discovery.name }}</p>
          <p class="text-xs text-hive-ink-muted">{{ discovery.description }}</p>
          <p v-if="discovery.location" class="text-[10px] text-hive-ink-muted mt-0.5">📍 {{ discovery.location }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useJournalStore } from '~/stores/journal'

const journal = useJournalStore()
</script>
