import { defineStore } from 'pinia'
import type { Garden, Hive, GardenFlower } from '~/lib/game/types'
import { getBloomDisplay } from '~/lib/game/types'
import { PLAYER_GARDEN, DEMO_HIVE, PLAYER_FLOWERS } from '~/lib/game/fixtures-world'
import { DEMO_FLOWER_SPECIES } from '~/lib/game/fixtures-species'

export const useGardenStore = defineStore('garden', () => {
  const garden = ref<Garden>(PLAYER_GARDEN)
  const hive = ref<Hive>(DEMO_HIVE)
  const flowers = ref<GardenFlower[]>(PLAYER_FLOWERS)
  const selectedGardenId = ref<string | null>(null)

  const bloomLabel = computed(() => getBloomDisplay(garden.value.bloomScore))
  const availableSlots = computed(() => hive.value.maxFlowerSlots - flowers.value.length)
  const selectedGarden = computed(() => {
    if (!selectedGardenId.value || selectedGardenId.value === garden.value.id) {
      return garden.value
    }
    return null
  })

  function selectGarden(id: string | null) {
    selectedGardenId.value = id
  }

  function plantFlower(speciesId: string) {
    const species = DEMO_FLOWER_SPECIES.find(s => s.id === speciesId)
    if (!species || availableSlots.value <= 0) return false

    const newFlower: GardenFlower = {
      id: `pf-${Date.now()}`,
      speciesId,
      slotIndex: flowers.value.length,
      plantedAt: new Date(),
      state: 'seed',
    }

    flowers.value.push(newFlower)
    garden.value.flowerCount = flowers.value.length

    // Simulate bloom progression
    setTimeout(() => {
      const f = flowers.value.find(f => f.id === newFlower.id)
      if (f) f.state = 'sprout'
    }, 1000)
    setTimeout(() => {
      const f = flowers.value.find(f => f.id === newFlower.id)
      if (f) f.state = 'growing'
    }, 2500)
    setTimeout(() => {
      const f = flowers.value.find(f => f.id === newFlower.id)
      if (f) {
        f.state = 'blooming'
        f.bloomStartedAt = new Date()
        f.bloomEndsAt = new Date(Date.now() + species.bloomHours * 3600000)
        garden.value.bloomScore = Math.min(100, garden.value.bloomScore + 8)
      }
    }, 5000)

    return true
  }

  function collectHoney(amount: number) {
    if (hive.value.honey >= amount) {
      hive.value.honey -= amount
      return true
    }
    return false
  }

  return {
    garden: readonly(garden),
    hive: readonly(hive),
    flowers: readonly(flowers),
    bloomLabel,
    availableSlots,
    selectedGardenId: readonly(selectedGardenId),
    selectedGarden,
    selectGarden,
    plantFlower,
    collectHoney,
  }
})
