<template>
  <div ref="mapContainer" class="w-full h-full relative">
    <div v-if="!isReady" class="absolute inset-0 flex items-center justify-center bg-hive-cream z-50">
      <div class="text-center">
        <div class="text-4xl mb-3 animate-hive-bob">🐝</div>
        <p class="font-display text-hive-ink-muted">Exploring the meadow...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHiveMap } from '~/composables/useHiveMap'
import { useGardenStore } from '~/stores/garden'
import { useWorldStore } from '~/stores/world'

const mapContainer = ref<HTMLElement | null>(null)
const { initMap, isReady } = useHiveMap()
const garden = useGardenStore()
const world = useWorldStore()

let mapApi: ReturnType<typeof initMap> | null = null

onMounted(() => {
  if (!mapContainer.value) return

  mapApi = initMap(mapContainer.value)

  watch(isReady, (ready) => {
    if (ready && mapApi) {
      // Add all gardens including player garden
      const allGardens = [garden.garden, ...world.gardens]
      mapApi.addGardenMarkers(allGardens)
      mapApi.addBeeFlowLayer(world.beeFlows)
    }
  })

  // Update bee flows periodically
  watch(() => world.beeFlows, (flows) => {
    if (mapApi && isReady.value) {
      mapApi.addBeeFlowLayer(flows)
    }
  }, { deep: true })
})

onBeforeUnmount(() => {
  if (mapApi) {
    mapApi.destroy()
  }
})
</script>
