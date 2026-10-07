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
import { useUiStore } from '~/stores/ui'

const mapContainer = ref<HTMLElement | null>(null)
const { initMap, isReady } = useHiveMap()
const garden = useGardenStore()
const world = useWorldStore()
const ui = useUiStore()

let mapApi: ReturnType<typeof initMap> | null = null

const isPlacingGarden = computed(() => ui.openSheet === 'place-garden')

onMounted(() => {
  if (!mapContainer.value) return

  mapApi = initMap(mapContainer.value)

  watch(isReady, (ready) => {
    if (ready && mapApi) {
      refreshMap()
      setupMapInteractions()
    }
  })

  watch(() => world.beeFlows, (flows) => {
    if (mapApi && isReady.value) {
      mapApi.addBeeFlowLayer(flows)
    }
  }, { deep: true })

  watch(() => world.gardens, () => {
    if (mapApi && isReady.value) {
      refreshMarkers()
    }
  }, { deep: true })
})

function refreshMap() {
  if (!mapApi) return
  const allGardens = [garden.garden, ...world.gardens.filter(g => g.id !== garden.garden.id)]
  mapApi.addGardenMarkers(allGardens, handleGardenClick)
  mapApi.addBeeFlowLayer(world.beeFlows)
}

function refreshMarkers() {
  if (!mapApi) return
  const allGardens = [garden.garden, ...world.gardens.filter(g => g.id !== garden.garden.id)]
  mapApi.addGardenMarkers(allGardens, handleGardenClick)
}

function handleGardenClick(g: any) {
  ui.showToast(`${g.name} — ${g.flowerCount} flowers, ${g.beeCount} bees`, '🏡')
}

function setupMapInteractions() {
  if (!mapApi) return

  // Handle map click for garden placement
  mapApi.addClickListener((lng, lat) => {
    if (isPlacingGarden.value) {
      ui.selectMapObject(`lat:${lat},lng:${lng}`)
    }
  })

  // Handle viewport changes for region loading
  let debounceTimer: ReturnType<typeof setTimeout>
  mapApi.onMoveEnd(() => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      const bounds = mapApi!.getBounds()
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      world.setVisibleRegion(
        (sw.lat + ne.lat) / 2,
        (sw.lng + ne.lng) / 2,
        mapApi!.map.getZoom()
      )
      world.fetchGardensInBounds(sw.lat, ne.lat, sw.lng, ne.lng)
    }, 300)
  })
}

onBeforeUnmount(() => {
  if (mapApi) {
    mapApi.destroy()
  }
})
</script>
