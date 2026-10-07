<template>
  <div class="fixed inset-0 z-[150] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-hive-ink/20 backdrop-blur-sm" @click="ui.dismissDiscovery" />
    <div class="relative hive-card p-6 text-center max-w-sm w-full animate-hive-float">
      <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-hive-pill bg-gradient-to-br from-hive-honey to-hive-honey-light flex items-center justify-center text-2xl shadow-hive-glow">
        ✨
      </div>
      <div class="mt-4">
        <p class="text-xs text-hive-ink-muted uppercase tracking-wider mb-1">New Discovery</p>
        <h3 class="font-display font-bold text-2xl text-hive-ink mb-2">{{ name }}</h3>
        <div class="text-4xl mb-3">{{ icon }}</div>
        <p class="text-sm text-hive-ink-muted">{{ description }}</p>
      </div>
      <HiveButton variant="primary" class="w-full mt-4" @click="ui.dismissDiscovery">
        Add to Journal
      </HiveButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/ui'

const ui = useUiStore()

defineProps<{
  name: string
  description: string
  icon: string
}>()
</script>
