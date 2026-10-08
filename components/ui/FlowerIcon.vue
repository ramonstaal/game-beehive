<template>
  <img
    :src="flowerImage(speciesId, state)"
    :alt="alt"
    class="object-contain select-none pointer-events-none"
    draggable="false"
  >
</template>

<script setup lang="ts">
import type { GardenFlower } from '~/lib/game/types'

withDefaults(defineProps<{
  speciesId: string
  state?: GardenFlower['state']
  alt?: string
}>(), {
  state: 'blooming',
  alt: 'flower',
})

const { flowerImage } = useFlowerAsset()
</script>
