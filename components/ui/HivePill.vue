<template>
  <div class="hive-pill" :class="{ 'text-xs py-1 px-2': small }">
    <span v-if="icon" class="hive-stat__icon">{{ icon }}</span>
    <span class="font-display font-semibold text-hive-ink">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string
  label: string
  small?: boolean
}>()
</script>
