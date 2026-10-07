<template>
  <div :class="compact ? 'p-2' : 'p-4 pb-2'">
    <div class="flex items-center gap-2">
      <div class="w-9 h-9 rounded-hive-pill bg-gradient-to-br from-hive-honey to-hive-honey-light flex items-center justify-center shadow-hive-glow">
        <span class="text-lg">🐝</span>
      </div>
      <div>
        <h1 class="font-display font-bold text-lg leading-tight text-hive-ink">HIVE</h1>
        <p v-if="!compact" class="text-xs text-hive-ink-muted">Grow something worth visiting</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  compact?: boolean
}>()
</script>
