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
  const latestTick = ref<number | null>(null)

  const activeEvent = computed(() => events.value.find(e => e.active))
  const nearbyGardens = computed(() => {
    const { lat, lng } = visibleRegion.value
    return gardens.value.filter(g => Math.abs(g.lat - lat) < 0.1 && Math.abs(g.lng - lng) < 0.15)
  })

  const weatherIcon = computed(() => ({ sunny: '☀️', cloudy: '⛅', rain: '🌧️', windy: '💨', night: '🌙' }[currentWeather.value]))
  const weatherLabel = computed(() => ({ sunny: 'Sunny', cloudy: 'Cloudy', rain: 'Rainy', windy: 'Windy', night: 'Night' }[currentWeather.value]))

  async function fetchGardensInBounds(minLat: number, maxLat: number, minLng: number, maxLng: number) {
    isLoading.value = true
    const { data } = await supabase.from('gardens').select('*, profiles:owner_id(username)').gte('lat', minLat).lte('lat', maxLat).gte('lng', minLng).lte('lng', maxLng).limit(100)
    if (data) gardens.value = data.map((g: any) => ({ id: g.id, ownerId: g.owner_id, ownerName: g.profiles?.username || 'Someone', h3Cell: g.h3_cell, lat: g.lat, lng: g.lng, name: g.name, bloomScore: g.bloom_score, flowerCount: g.flower_count, beeCount: g.bee_count, createdAt: new Date(g.created_at) }))
    isLoading.value = false
  }

  async function fetchGardens() { await fetchGardensInBounds(51.5, 53, 4, 6) }

  async function fetchWorldCells(cells: string[]) {
    if (!cells.length) return
    const { data } = await supabase.from('world_cells').select('*').in('h3_cell', cells.slice(0, 50))
    if (data) {
      worldCells.value = data.map(c => ({ h3Cell: c.h3_cell, resolution: c.resolution, lat: c.lat, lng: c.lng, beePopulation: c.bee_population, nectar: c.nectar, pollen: c.pollen, bloomScore: c.bloom_score, activityScore: c.activity_score, weather: c.weather as WeatherState }))
      if (data[0]) currentWeather.value = data[0].weather as WeatherState
    }
  }

  async function fetchWorldCellsInBounds(minLat: number, maxLat: number, minLng: number, maxLng: number) {
    const { data } = await supabase.from('world_cells').select('*').gte('lat', minLat).lte('lat', maxLat).gte('lng', minLng).lte('lng', maxLng).limit(100)
    if (data) worldCells.value = data.map(c => ({ h3Cell: c.h3_cell, resolution: c.resolution, lat: c.lat, lng: c.lng, beePopulation: c.bee_population, nectar: c.nectar, pollen: c.pollen, bloomScore: c.bloom_score, activityScore: c.activity_score, weather: c.weather as WeatherState }))
  }

  async function fetchBeeFlows(sinceMinutes = 5) {
    const since = new Date(Date.now() - sinceMinutes * 60000).toISOString()
    const { data } = await supabase.from('bee_flows').select('*').gte('created_at', since).order('created_at', { ascending: false }).limit(50)
    if (data) beeFlows.value = data.map((f: any, i: number) => ({ id: `flow-${f.id}`, from: [f.from_lng || 5.12, f.from_lat || 52.09] as [number, number], to: [f.to_lng || 5.13, f.to_lat || 52.08] as [number, number], beeCount: f.bee_count, type: f.bee_type as BeeFlow['type'], progress: (i % 10) / 10 }))
  }

  async function fetchLatestTick() {
    const { data } = await supabase.from('game_ticks').select('id').eq('status', 'completed').order('completed_at', { ascending: false }).limit(1)
    if (data?.length) latestTick.value = data[0].id
  }

  async function fetchEvents() {
    const { data } = await supabase.from('global_events').select('*')
    if (data) events.value = data.map(e => ({ id: e.id, type: e.event_type, name: e.name, description: e.description, regionKey: e.region_key || undefined, startsAt: new Date(e.starts_at), endsAt: new Date(e.ends_at), active: new Date() >= new Date(e.starts_at) && new Date() <= new Date(e.ends_at) }))
  }

  function setVisibleRegion(lat: number, lng: number, zoom: number) { visibleRegion.value = { lat, lng, zoom } }

  function updateBeeFlowProgress() { beeFlows.value = beeFlows.value.map(f => ({ ...f, progress: (f.progress + 0.005) % 1 })) }

  let animationFrame: number
  function startBeeAnimation() {
    function tick() { updateBeeFlowProgress(); animationFrame = requestAnimationFrame(tick) }
    tick()
  }
  function stopBeeAnimation() { if (animationFrame) cancelAnimationFrame(animationFrame) }

  function subscribeToGardens() {
    const ch = supabase.channel('world:gardens').on('postgres_changes', { event: '*', schema: 'public', table: 'gardens' }, () => { const { lat, lng, zoom } = visibleRegion.value; const s = 0.5 / Math.pow(2, zoom - 10); fetchGardensInBounds(lat - s, lat + s, lng - s * 1.5, lng + s * 1.5) }).subscribe()
    realtimeChannels.value.push(ch)
  }

  function subscribeToWorldCells() {
    const ch = supabase.channel('world:cells').on('postgres_changes', { event: '*', schema: 'public', table: 'world_cells' }, () => { const { lat, lng, zoom } = visibleRegion.value; const s = 0.5 / Math.pow(2, zoom - 10); fetchWorldCellsInBounds(lat - s, lat + s, lng - s * 1.5, lng + s * 1.5) }).subscribe()
    realtimeChannels.value.push(ch)
  }

  function subscribeToBeeFlows() {
    const ch = supabase.channel('world:bee_flows').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bee_flows' }, () => fetchBeeFlows(5)).subscribe()
    realtimeChannels.value.push(ch)
  }

  function subscribeToEvents() {
    const ch = supabase.channel('world:events').on('postgres_changes', { event: '*', schema: 'public', table: 'global_events' }, () => fetchEvents()).subscribe()
    realtimeChannels.value.push(ch)
  }

  function unsubscribeAll() { realtimeChannels.value.forEach(ch => supabase.removeChannel(ch)); realtimeChannels.value = [] }

  return {
    gardens: readonly(gardens), beeFlows: readonly(beeFlows), worldCells: readonly(worldCells),
    events: readonly(events), currentWeather: readonly(currentWeather), visibleRegion: readonly(visibleRegion),
    isLoading: readonly(isLoading), activeEvent, nearbyGardens, weatherIcon, weatherLabel, latestTick: readonly(latestTick),
    setVisibleRegion, fetchGardens, fetchGardensInBounds, fetchWorldCells, fetchWorldCellsInBounds, fetchBeeFlows, fetchEvents, fetchLatestTick,
    startBeeAnimation, stopBeeAnimation, subscribeToGardens, subscribeToWorldCells, subscribeToBeeFlows, subscribeToEvents, unsubscribeAll,
  }
})