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
  const realtimeChannels = ref<any[]>([])

  const activeEvent = computed(() => events.value.find(e => e.active))
  const nearbyGardens = computed(() => {
    const { lat, lng } = visibleRegion.value
    return gardens.value.filter(g => {
      const dLat = Math.abs(g.lat - lat)
      const dLng = Math.abs(g.lng - lng)
      return dLat < 0.1 && dLng < 0.15
    })
  })

  async function fetchGardensInBounds(minLat: number, maxLat: number, minLng: number, maxLng: number) {
    isLoading.value = true
    const { data } = await supabase
      .from('gardens')
      .select('*, profiles:owner_id(username)')
      .gte('lat', minLat)
      .lte('lat', maxLat)
      .gte('lng', minLng)
      .lte('lng', maxLng)
      .limit(100)

    if (data) {
      gardens.value = data.map((g: any) => ({
        id: g.id, ownerId: g.owner_id, ownerName: g.profiles?.username || 'Someone',
        h3Cell: g.h3_cell, lat: g.lat, lng: g.lng, name: g.name,
        bloomScore: g.bloom_score, flowerCount: g.flower_count, beeCount: g.bee_count,
        createdAt: new Date(g.created_at),
      }))
    }
    isLoading.value = false
  }

  async function fetchGardens() {
    await fetchGardensInBounds(51.5, 53, 4, 6)
  }

  async function fetchWorldCells(cells: string[]) {
    if (cells.length === 0) return
    const { data } = await supabase
      .from('world_cells')
      .select('*')
      .in('h3_cell', cells.slice(0, 50))

    if (data) {
      worldCells.value = data.map(c => ({
        h3Cell: c.h3_cell, resolution: c.resolution, lat: c.lat, lng: c.lng,
        beePopulation: c.bee_population, nectar: c.nectar, pollen: c.pollen,
        bloomScore: c.bloom_score, activityScore: c.activity_score, weather: c.weather as WeatherState,
      }))
    }
  }

  async function fetchBeeFlows(sinceMinutes: number = 5) {
    const since = new Date(Date.now() - sinceMinutes * 60000).toISOString()
    const { data } = await supabase
      .from('bee_flows')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      beeFlows.value = data.map((f: any, i: number) => ({
        id: `flow-${f.id}`,
        from: [f.from_lng || 5.12, f.from_lat || 52.09] as [number, number],
        to: [f.to_lng || 5.13, f.to_lat || 52.08] as [number, number],
        beeCount: f.bee_count, type: f.bee_type as BeeFlow['type'],
        progress: (i % 10) / 10,
      }))
    }
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

  // Realtime subscriptions
  function subscribeToGardens() {
    const channel = supabase.channel('world:gardens')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gardens' }, (payload) => {
        // Refetch gardens in current viewport when any garden changes
        const { lat, lng, zoom } = visibleRegion.value
        const span = 0.5 / Math.pow(2, zoom - 10)
        fetchGardensInBounds(lat - span, lat + span, lng - span * 1.5, lng + span * 1.5)
      })
      .subscribe()
    realtimeChannels.value.push(channel)
  }

  function subscribeToEvents() {
    const channel = supabase.channel('world:events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'global_events' }, () => {
        fetchEvents()
      })
      .subscribe()
    realtimeChannels.value.push(channel)
  }

  function unsubscribeAll() {
    realtimeChannels.value.forEach(ch => supabase.removeChannel(ch))
    realtimeChannels.value = []
  }

  return {
    gardens: readonly(gardens), beeFlows: readonly(beeFlows), worldCells: readonly(worldCells),
    events: readonly(events), currentWeather: readonly(currentWeather),
    visibleRegion: readonly(visibleRegion), isLoading: readonly(isLoading),
    activeEvent, nearbyGardens, setVisibleRegion,
    fetchGardens, fetchGardensInBounds, fetchWorldCells, fetchBeeFlows, fetchEvents,
    startBeeAnimation, stopBeeAnimation,
    subscribeToGardens, subscribeToEvents, unsubscribeAll,
  }
})
