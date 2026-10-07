import { defineStore } from 'pinia'
import type { Discovery } from '~/lib/game/types'
import { DEMO_DISCOVERIES } from '~/lib/game/fixtures-world'

export const useJournalStore = defineStore('journal', () => {
  const discoveries = ref<Discovery[]>([...DEMO_DISCOVERIES])
  const isOpen = ref(false)

  const flowerDiscoveries = computed(() => discoveries.value.filter(d => d.type === 'flower'))
  const beeDiscoveries = computed(() => discoveries.value.filter(d => d.type === 'bee'))
  const honeyDiscoveries = computed(() => discoveries.value.filter(d => d.type === 'honey'))
  const placeDiscoveries = computed(() => discoveries.value.filter(d => d.type === 'place'))
  const phenomenonDiscoveries = computed(() => discoveries.value.filter(d => d.type === 'phenomenon'))

  const stats = computed(() => ({
    flowers: { current: flowerDiscoveries.value.length, total: 60 },
    bees: { current: beeDiscoveries.value.length, total: 20 },
    honey: { current: honeyDiscoveries.value.length, total: 15 },
    phenomena: { current: phenomenonDiscoveries.value.length, total: 12 },
    places: { current: placeDiscoveries.value.length, total: 100 },
  }))

  function addDiscovery(discovery: Discovery) {
    const exists = discoveries.value.find(
      d => d.type === discovery.type && d.key === discovery.key
    )
    if (!exists) {
      discoveries.value.unshift(discovery)
    }
  }

  function toggleOpen() {
    isOpen.value = !isOpen.value
  }

  return {
    discoveries: readonly(discoveries),
    isOpen: readonly(isOpen),
    flowerDiscoveries,
    beeDiscoveries,
    honeyDiscoveries,
    placeDiscoveries,
    phenomenonDiscoveries,
    stats,
    addDiscovery,
    toggleOpen,
  }
})
