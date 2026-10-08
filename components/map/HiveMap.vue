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
import { useHiveMap, MIN_ZOOM_GARDEN_FLOWERS, type MapGardenFlowersPayload } from '~/composables/useHiveMap'
import { useGardenStore } from '~/stores/garden'
import { useWorldStore } from '~/stores/world'
import { useUiStore } from '~/stores/ui'
import type { Garden } from '~/lib/game/types'

const mapContainer = ref<HTMLElement | null>(null)
const { initMap, isReady } = useHiveMap()
const { flowerImage } = useFlowerAsset()
const garden = useGardenStore()
const world = useWorldStore()
const ui = useUiStore()

let mapApi: ReturnType<typeof initMap> | null = null
let beeAgentAnimFrame = 0

const isPlacingGarden = computed(() => ui.openSheet === 'place-garden')

onMounted(() => {
  if (!mapContainer.value) return

  mapApi = initMap(mapContainer.value)

  watch(isReady, (ready) => {
    if (ready && mapApi) {
      refreshMap()
      setupMapInteractions()
      startBeeAgentLoop()
    }
  })

  watch(
    () => world.beeFlows.map(f => {
      const from = f.from
      const to = f.to
      if (!from || !to) return f.id
      return `${f.id}:${from[0]},${from[1]}-${to[0]},${to[1]}`
    }).join('|'),
    () => {
      if (mapApi && isReady.value) {
        mapApi.addBeeFlowLayer(world.beeFlows)
      }
    },
  )

  watch(() => world.gardens, () => {
    if (mapApi && isReady.value) {
      refreshMarkers()
    }
  }, { deep: true })

  watch(() => garden.flowers, () => {
    if (mapApi && isReady.value) {
      refreshFlowerMarkers()
    }
  }, { deep: true })
})

function gardensForMap() {
  const byId = new Map<string, typeof garden.garden>()
  if (garden.garden?.id) byId.set(garden.garden.id, garden.garden)
  for (const g of world.gardens) {
    if (g?.id) byId.set(g.id, g)
  }
  return [...byId.values()]
}

function isOwnGarden(g: Garden) {
  return g.id === garden.garden.id || g.ownerId === 'player' || g.ownerName === 'You'
}

function flowerPayloadsForMap(): MapGardenFlowersPayload[] {
  return gardensForMap().map((g) => ({
    gardenId: g.id,
    lat: g.lat,
    lng: g.lng,
    flowers: isOwnGarden(g)
      ? garden.flowers.map(f => ({ speciesId: f.speciesId, state: f.state }))
      : undefined,
    flowerCount: g.flowerCount,
  }))
}

function startBeeAgentLoop() {
  cancelAnimationFrame(beeAgentAnimFrame)
  let beeRoutesSynced = false
  const tick = () => {
    if (mapApi && isReady.value) {
      if (!beeRoutesSynced && mapApi.map.getLayer('bee-flows') == null) {
        mapApi.addBeeFlowLayer(world.beeFlows)
      }
      if (mapApi.map.getLayer('bee-flows') != null) beeRoutesSynced = true
      mapApi.updateBeeFlowAgents(world.beeFlows)
    }
    beeAgentAnimFrame = requestAnimationFrame(tick)
  }
  tick()
}

function refreshMap() {
  if (!mapApi) return
  mapApi.addGardenMarkers(gardensForMap(), handleGardenClick)
  refreshFlowerMarkers()
  mapApi.addBeeFlowLayer(world.beeFlows)
  mapApi.updateBeeFlowAgents(world.beeFlows)
}

function refreshMarkers() {
  if (!mapApi) return
  mapApi.addGardenMarkers(gardensForMap(), handleGardenClick)
  refreshFlowerMarkers()
}

function refreshFlowerMarkers() {
  if (!mapApi) return
  mapApi.addGardenFlowerMarkers(flowerPayloadsForMap(), flowerImage)
}

function handleGardenClick(g: Garden) {
  const zoom = Math.max(mapApi!.map.getZoom(), MIN_ZOOM_GARDEN_FLOWERS + 0.25)
  mapApi!.flyTo(g.lng, g.lat, zoom)
  mapApi!.map.once('moveend', () => refreshFlowerMarkers())
  garden.selectGarden(g.id)
  ui.selectMapObject(g.id)

  if (isOwnGarden(g)) {
    ui.setView('garden')
    if (ui.isMobile) ui.openSheetById('garden')
    return
  }

  ui.showToast(
    `${g.name} · ${g.flowerCount} flowers · ${g.beeCount} bees · by ${g.ownerName}`,
    '🏡',
  )
}

function setupMapInteractions() {
  if (!mapApi) return

  // Handle map click for garden placement
  mapApi.addClickListener((lng, lat) => {
    if (isPlacingGarden.value) {
      ui.selectMapObject(`lat:${lat},lng:${lng}`)
    }
  })

  // Flowers must update as soon as zoom crosses the threshold (not debounced with fetch).
  const syncFlowerLayer = () => refreshFlowerMarkers()
  mapApi.onZoomEnd(syncFlowerLayer)
  mapApi.onMoveEnd(syncFlowerLayer)
  mapApi.onZoomEnd(() => mapApi?.updateBeeFlowAgents(world.beeFlows))

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
  cancelAnimationFrame(beeAgentAnimFrame)
  if (mapApi) {
    mapApi.destroy()
  }
})
</script>
