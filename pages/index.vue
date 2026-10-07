<template>
  <div class="hive-app">
    <!-- Auth Modal -->
    <AuthModal v-if="showAuth" />

    <!-- Onboarding Overlay -->
    <OnboardingFlow v-else-if="ui.isOnboarding" />

    <!-- Garden Placement -->
    <template v-else-if="needsGardenPlacement">
      <div class="h-screen w-screen relative">
        <HiveMap />
        <GardenPlacement
          :lat="placementLat"
          :lng="placementLng"
          @placed="onGardenPlaced"
          @cancel="onPlacementCancelled"
        />
      </div>
    </template>

    <!-- Main App Layout -->
    <template v-else>
      <!-- Toast -->
      <HiveToast v-if="ui.toastMessage" :message="ui.toastMessage" :icon="ui.toastIcon" />

      <!-- Discovery Card -->
      <DiscoveryCard
        v-if="ui.showDiscovery && ui.discoveryData"
        v-bind="ui.discoveryData"
      />

      <!-- Desktop: Side panels + Map -->
      <div class="hidden lg:flex h-screen w-screen overflow-hidden">
        <!-- Left Panel -->
        <aside class="w-80 flex-shrink-0 hive-panel m-3 flex flex-col gap-3 overflow-hidden">
          <AppHeader />
          <GardenPanel v-if="ui.currentView === 'world' || ui.currentView === 'garden'" />
          <JournalPanel v-else-if="ui.currentView === 'journal'" />
          <ProfilePanel v-else-if="ui.currentView === 'profile'" />
        </aside>

        <!-- Map -->
        <main class="flex-1 relative m-3 ml-0 rounded-hive-lg overflow-hidden shadow-hive-soft">
          <HiveMap />
          <!-- Floating stats bar on map -->
          <div class="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-3">
            <HivePill icon="🍯" :label="String(garden.hive.honey)" />
            <HivePill icon="🌼" :label="String(garden.garden.flowerCount)" />
            <HivePill icon="🐝" :label="String(garden.garden.beeCount)" />
          </div>
          <!-- Event Banner -->
          <EventBanner v-if="world.activeEvent" class="absolute top-16 left-1/2 -translate-x-1/2 z-10" />
        </main>

        <!-- Right Panel -->
        <aside class="w-72 flex-shrink-0 hive-panel m-3 ml-0 flex flex-col overflow-hidden">
          <ActivityFeed />
        </aside>
      </div>

      <!-- Mobile: Full screen map + overlays -->
      <div class="lg:hidden h-screen w-screen relative overflow-hidden">
        <HiveMap />

        <!-- Top stats bar -->
        <div class="absolute top-3 left-3 right-3 z-10 flex justify-between items-center">
          <AppHeader compact />
          <div class="flex gap-2">
            <HivePill icon="🍯" :label="String(garden.hive.honey)" small />
            <HivePill icon="🌼" :label="String(garden.garden.flowerCount)" small />
          </div>
        </div>

        <!-- Event Banner -->
        <EventBanner v-if="world.activeEvent" class="absolute top-16 left-3 right-3 z-10" />

        <!-- Bottom Navigation -->
        <BottomNav class="absolute bottom-4 left-3 right-3 z-20" />

        <!-- Bottom Sheets (mobile) -->
        <GardenSheet v-if="ui.openSheet === 'garden'" />
        <JournalSheet v-if="ui.openSheet === 'journal'" />
        <ProfileSheet v-if="ui.openSheet === 'profile'" />
      </div>

      <!-- Flower Picker (mobile + desktop: renders as bottom sheet on mobile, modal on desktop) -->
      <FlowerPickerSheet v-if="ui.openSheet === 'flower-picker'" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from '~/stores/player'
import { useGardenStore } from '~/stores/garden'
import { useWorldStore } from '~/stores/world'
import { useJournalStore } from '~/stores/journal'
import { useUiStore } from '~/stores/ui'

const player = usePlayerStore()
const garden = useGardenStore()
const world = useWorldStore()
const journal = useJournalStore()
const ui = useUiStore()

const isReady = ref(false)
const hasCheckedGarden = ref(false)
const needsGardenPlacement = ref(false)
const placementLat = ref(52.09)
const placementLng = ref(5.12)

const showAuth = computed(() => {
  return isReady.value && !player.isAuthenticated && !player.profile
})

// Watch for map clicks during garden placement
watch(() => ui.selectedMapObject, (val) => {
  if (!val || !needsGardenPlacement.value) return
  if (val.startsWith('lat:')) {
    const parts = val.split(',')
    const lat = parseFloat(parts[0].split(':')[1])
    const lng = parseFloat(parts[1].split(':')[1])
    if (!isNaN(lat) && !isNaN(lng)) {
      placementLat.value = lat
      placementLng.value = lng
    }
  }
})

onMounted(async () => {
  // Initialize auth state
  await player.initAuth()
  isReady.value = true

  if (player.isAuthenticated) {
    // Check if user has a garden
    await garden.fetchMyGarden()
    hasCheckedGarden.value = true

    // If garden ID is still the demo one, user has no real garden
    if (garden.garden.id === 'garden-player') {
      needsGardenPlacement.value = true
      ui.openSheetById('place-garden')
    } else {
      // User has a garden - load full data and start realtime
      await loadFullData()
    }
  } else if (player.profile) {
    // Demo mode - use demo data but still fetch nearby real gardens
    await world.fetchGardens()
    world.startBeeAnimation()
  } else {
    // Not authenticated - will show auth modal
  }
})

onBeforeUnmount(() => {
  world.stopBeeAnimation()
  world.unsubscribeAll()
})

async function loadFullData() {
  await Promise.all([
    world.fetchGardens(),
    world.fetchEvents(),
    journal.fetchDiscoveries(),
  ])
  world.startBeeAnimation()
  world.subscribeToGardens()
  world.subscribeToEvents()
}

function onGardenPlaced() {
  needsGardenPlacement.value = false
  ui.closeSheet()
  loadFullData()
}

function onPlacementCancelled() {
  // Allow user to explore without placing a garden
  needsGardenPlacement.value = false
  ui.closeSheet()
  player.initDemoPlayer()
  world.startBeeAnimation()
}
</script>

<style>
.hive-app {
  background-color: var(--hive-cream);
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>
