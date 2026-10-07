<template>
  <div class="hive-card px-4 py-2 flex items-center gap-3 bg-gradient-to-r from-hive-lavender/20 to-hive-honey/20 border-hive-honey/30">
    <span class="text-xl animate-hive-pulse-soft">✨</span>
    <div>
      <p class="font-display font-semibold text-sm text-hive-ink">{{ event?.name }}</p>
      <p class="text-xs text-hive-ink-muted">{{ event?.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorldStore } from '~/stores/world'

const world = useWorldStore()
const event = computed(() => world.activeEvent)
</script>
