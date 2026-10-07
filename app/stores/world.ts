import { defineStore } from 'pinia'
import { supabase } from '~/lib/supabase/client'
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

  async function fetchGardens() {
    isLoading.value = true
    const { data } = await supabase.from('gardens').select('*').limit(50)
    if (data) {
      gardens.value = data.map(g => ({
        id: g.id, ownerId: g.owner_id, ownerName: '', h3Cell: g.h3_cell,
        lat: g.lat, lng: g.lng, name: g.name,
        bloomScore: g.bloom_score, flowerCount: g.flower_count, beeCount: g.bee_count,
        createdAt: new Date(g.created_at),
      }))
    }
    isLoading.value = false
  }

  async function fetchEvents() {
    const { data } = await supabase.from('global_events').select('*')
    if (data) {
      events.value = data.map(e => ({
        id: e.id, type: e.event_type, name: e.name, description: e.description,
        regionKey: e.region_key || undefined,
        startsAt: new Date(e.starts_at), endsAt: new Date(e.ends_at),
        active: new Date() >= new Date(e.starts_at) && new Date() <= new Date(e.ends_at),
      }))
    }
  }

  function setVisibleRegion(lat: number, lng: number, zoom: number) {
    visibleRegion.value = { lat, lng, zoom }
  }

  function updateBeeFlowProgress() {
    beeFlows.value = beeFlows.value.map(flow => ({ ...flow, progress: (flow.progress + 0.005) % 1 }))
  }

  let animationFrame: number
  function startBeeAnimation() {
    function tick() { updateBeeFlowProgress(); animationFrame = requestAnimationFrame(tick) }
    tick()
  }
  function stopBeeAnimation() { if (animationFrame) cancelAnimationFrame(animationFrame) }

  return {
    gardens: readonly(gardens), beeFlows: readonly(beeFlows), worldCells: readonly(worldCells),
    events: readonly(events), currentWeather: readonly(currentWeather),
    visibleRegion: readonly(visibleRegion), isLoading: readonly(isLoading),
    activeEvent, nearbyGardens, setVisibleRegion, fetchGardens, fetchEvents,
    startBeeAnimation, stopBeeAnimation,
  }
})
