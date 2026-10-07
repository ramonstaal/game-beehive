import { defineStore } from 'pinia'
import { supabase } from '~/lib/supabase/client'
import type { Discovery } from '~/lib/game/types'
import { DEMO_DISCOVERIES } from '~/lib/game/fixtures-world'

export const useJournalStore = defineStore('journal', () => {
  const discoveries = ref<Discovery[]>([...DEMO_DISCOVERIES])
  const isOpen = ref(false)
  const isLoading = ref(false)

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

  async function fetchDiscoveries() {
    isLoading.value = true
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { isLoading.value = false; return }

    const { data } = await supabase
      .from('discoveries')
      .select('*')
      .eq('player_id', user.id)
      .order('discovered_at', { ascending: false })

    if (data) {
      discoveries.value = data.map(d => ({
        id: d.id,
        type: d.discovery_type as Discovery['type'],
        key: d.discovery_key,
        name: d.name,
        description: d.description,
        discoveredAt: new Date(d.discovered_at),
        location: d.h3_cell || undefined,
        icon: d.metadata?.icon || '✨',
      }))
    }
    isLoading.value = false
  }

  async function recordDiscovery(type: string, key: string, name: string, description: string, h3Cell?: string) {
    const { data, error } = await supabase.rpc('record_discovery', {
      p_discovery_type: type,
      p_discovery_key: key,
      p_name: name,
      p_description: description,
      p_h3_cell: h3Cell || null,
    })

    if (error) {
      console.error('Error recording discovery:', error)
      return false
    }

    await fetchDiscoveries()
    return true
  }

  function toggleOpen() {
    isOpen.value = !isOpen.value
  }

  return {
    discoveries: readonly(discoveries),
    isOpen: readonly(isOpen),
    isLoading: readonly(isLoading),
    flowerDiscoveries,
    beeDiscoveries,
    honeyDiscoveries,
    placeDiscoveries,
    phenomenonDiscoveries,
    stats,
    fetchDiscoveries,
    recordDiscovery,
    toggleOpen,
  }
})
