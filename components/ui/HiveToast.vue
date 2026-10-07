<template>
  <div class="hive-toast">
    <span v-if="icon" class="text-xl">{{ icon }}</span>
    <span class="text-sm font-medium text-hive-ink">{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
  icon?: string
}>()
</script>
