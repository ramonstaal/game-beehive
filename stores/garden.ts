import { defineStore } from 'pinia'
import { supabase } from '~/lib/supabase/client'
import type { Garden, Hive, GardenFlower } from '~/lib/game/types'
import { getBloomDisplay } from '~/lib/game/types'
import { PLAYER_GARDEN, DEMO_HIVE, PLAYER_FLOWERS } from '~/lib/game/fixtures-world'
import { DEMO_FLOWER_SPECIES } from '~/lib/game/fixtures-species'

export const useGardenStore = defineStore('garden', () => {
  const garden = ref<Garden>(PLAYER_GARDEN)
  const hive = ref<Hive>(DEMO_HIVE)
  const flowers = ref<GardenFlower[]>(PLAYER_FLOWERS)
  const selectedGardenId = ref<string | null>(null)
  const isLoading = ref(false)

  const bloomLabel = computed(() => getBloomDisplay(garden.value.bloomScore))
  const availableSlots = computed(() => hive.value.maxFlowerSlots - flowers.value.length)

  function selectGarden(id: string | null) {
    selectedGardenId.value = id
  }

  async function fetchMyGarden() {
    isLoading.value = true
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { isLoading.value = false; return }

    const { data: gd } = await supabase.from('gardens').select('*').eq('owner_id', user.id).single()
    if (!gd) { isLoading.value = false; return }

    garden.value = {
      id: gd.id, ownerId: gd.owner_id, ownerName: 'You', h3Cell: gd.h3_cell,
      lat: gd.lat, lng: gd.lng, name: gd.name,
      bloomScore: gd.bloom_score, flowerCount: gd.flower_count, beeCount: gd.bee_count,
      createdAt: new Date(gd.created_at),
    }

    const { data: hd } = await supabase.from('hives').select('*').eq('garden_id', gd.id).single()
    if (hd) {
      hive.value = {
        id: hd.id, gardenId: hd.garden_id, level: hd.level, population: hd.population,
        honey: hd.honey, nectar: hd.nectar, pollen: hd.pollen, maxFlowerSlots: hd.max_flower_slots,
      }
    }

    const { data: fd } = await supabase.from('garden_flowers').select('*').eq('garden_id', gd.id).order('slot_index')
    if (fd) {
      flowers.value = fd.map(f => ({
        id: f.id, speciesId: f.species_id, slotIndex: f.slot_index,
        plantedAt: new Date(f.planted_at), state: f.state as GardenFlower['state'],
        bloomStartedAt: f.bloom_started_at ? new Date(f.bloom_started_at) : undefined,
        bloomEndsAt: f.bloom_ends_at ? new Date(f.bloom_ends_at) : undefined,
      }))
    }
    isLoading.value = false
  }

  async function createGarden(h3Cell: string, name: string, lat: number, lng: number) {
    isLoading.value = true
    const { data, error } = await supabase.rpc('create_garden', { p_h3_cell: h3Cell, p_name: name, p_lat: lat, p_lng: lng })
    isLoading.value = false
    if (error) return { success: false, error }
    await fetchMyGarden()
    return { success: true, data }
  }

  async function plantFlower(speciesId: string) {
    const species = DEMO_FLOWER_SPECIES.find(s => s.id === speciesId)
    if (!species || availableSlots.value <= 0) return false
    const { error } = await supabase.rpc('plant_flower', {
      p_garden_id: garden.value.id, p_species_id: speciesId, p_slot_index: flowers.value.length,
    })
    if (error) { console.error('Error planting flower:', error); return plantFlowerLocal(speciesId) }
    await fetchMyGarden()
    return true
  }

  function plantFlowerLocal(speciesId: string) {
    const species = DEMO_FLOWER_SPECIES.find(s => s.id === speciesId)
    if (!species || availableSlots.value <= 0) return false
    const newFlower: GardenFlower = { id: `pf-${Date.now()}`, speciesId, slotIndex: flowers.value.length, plantedAt: new Date(), state: 'seed' }
    flowers.value.push(newFlower)
    garden.value.flowerCount = flowers.value.length
    setTimeout(() => { const f = flowers.value.find(f => f.id === newFlower.id); if (f) f.state = 'sprout' }, 1000)
    setTimeout(() => { const f = flowers.value.find(f => f.id === newFlower.id); if (f) f.state = 'growing' }, 2500)
    setTimeout(() => { const f = flowers.value.find(f => f.id === newFlower.id); if (f) { f.state = 'blooming'; f.bloomStartedAt = new Date(); f.bloomEndsAt = new Date(Date.now() + species!.bloomHours * 3600000); garden.value.bloomScore = Math.min(100, garden.value.bloomScore + 8) } }, 5000)
    return true
  }

  async function collectHoney(amount: number) {
    const { error } = await supabase.rpc('harvest_honey', { p_garden_id: garden.value.id, p_amount: amount })
    if (error) { if (hive.value.honey >= amount) { hive.value.honey -= amount; return true } return false }
    await fetchMyGarden()
    return true
  }

  return {
    garden: readonly(garden), hive: readonly(hive), flowers: readonly(flowers),
    isLoading: readonly(isLoading), bloomLabel, availableSlots,
    selectedGardenId: readonly(selectedGardenId), selectGarden,
    fetchMyGarden, createGarden, plantFlower, collectHoney,
  }
})