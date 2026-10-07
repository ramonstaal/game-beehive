import { defineStore } from 'pinia'
import type { Garden, BeeFlow, WorldCell, GameEvent, WeatherState } from '~/lib/game/types'
import { DEMO_GARDENS, DEMO_BEE_FLOWS, DEMO_WORLD_CELLS, DEMO_EVENTS } from '~/lib/game/fixtures-world'

export const useWorldStore = defineStore('world', () => {
  const gardens = ref<Garden[]>([...DEMO_GARDENS])
  const beeFlows = ref<BeeFlow[]>([...DEMO_BEE_FLOWS])
  const worldCells = ref<WorldCell[]>([...DEMO_WORLD_CELLS])
  const events = ref<GameEvent[]>([...DEMO_EVENTS])
  const currentWeather = ref<WeatherState>('sunny')
  const visibleRegion = ref({ lat: 52.09, lng: 5.12, zoom: 12 })
  const isLoading = ref(false)

  const activeEvent = computed(() => events.value.find(e => e.active))
  const nearbyGardens = computed(() => gardens.value)

  function setVisibleRegion(lat: number, lng: number, zoom: number) {
    visibleRegion.value = { lat, lng, zoom }
  }

  function updateBeeFlowProgress() {
    beeFlows.value = beeFlows.value.map(flow => ({
      ...flow,
      progress: (flow.progress + 0.005) % 1,
    }))
  }

  // Animate bee flows
  let animationFrame: number
  function startBeeAnimation() {
    function tick() {
      updateBeeFlowProgress()
      animationFrame = requestAnimationFrame(tick)
    }
    tick()
  }

  function stopBeeAnimation() {
    if (animationFrame) cancelAnimationFrame(animationFrame)
  }

  return {
    gardens: readonly(gardens),
    beeFlows: readonly(beeFlows),
    worldCells: readonly(worldCells),
    events: readonly(events),
    currentWeather: readonly(currentWeather),
    visibleRegion: readonly(visibleRegion),
    isLoading: readonly(isLoading),
    activeEvent,
    nearbyGardens,
    setVisibleRegion,
    startBeeAnimation,
    stopBeeAnimation,
  }
})
