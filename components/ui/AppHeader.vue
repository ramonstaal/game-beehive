<template>
  <div :class="compact ? 'p-2' : 'p-4 pb-2'">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <div class="w-9 h-9 rounded-hive-pill bg-gradient-to-br from-hive-honey to-hive-honey-light flex items-center justify-center shadow-hive-glow flex-shrink-0">
          <span class="text-lg">🐝</span>
        </div>
        <div class="min-w-0">
          <h1 class="font-display font-bold text-lg leading-tight text-hive-ink">HIVE</h1>
          <p v-if="!compact" class="text-xs text-hive-ink-muted truncate">Grow something worth visiting</p>
        </div>
      </div>
      <NuxtLink
        to="/how-to-play"
        class="flex-shrink-0 hive-button hive-button--ghost !py-1.5 !px-2.5 text-xs font-display font-semibold gap-1"
        aria-label="How to play"
      >
        <span aria-hidden="true">❓</span>
        <span :class="compact ? 'sr-only' : ''">Help</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  compact?: boolean
}>()
</script>
