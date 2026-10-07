<template>
  <button
    class="hive-button"
    :class="`hive-button--${variant}`"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <span v-if="icon" class="text-lg">{{ icon }}</span>
    <span class="font-display"><slot /></span>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost'
  icon?: string
  disabled?: boolean
}>(), {
  variant: 'primary',
})

defineEmits<{
  click: []
}>()
</script>
