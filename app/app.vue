<template>
  <div class="hive-app">
    <!-- Onboarding Overlay -->
    <OnboardingFlow v-if="ui.isOnboarding" />

    <!-- Toast -->
    <HiveToast v-if="ui.toastMessage" :message="ui.toastMessage" :icon="ui.toastIcon" />

    <!-- Discovery Card -->
    <DiscoveryCard
      v-if="ui.showDiscovery && ui.discoveryData"
      v-bind="ui.discoveryData"
    />

    <!-- Main App Layout -->
    <template v-else>
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

        <!-- Bottom Sheets -->
        <GardenSheet v-if="ui.openSheet === 'garden'" />
        <JournalSheet v-if="ui.openSheet === 'journal'" />
        <ProfileSheet v-if="ui.openSheet === 'profile'" />
        <FlowerPickerSheet v-if="ui.openSheet === 'flower-picker'" />
      </div>
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

onMounted(() => {
  player.initDemoPlayer()
  world.startBeeAnimation()
})

onBeforeUnmount(() => {
  world.stopBeeAnimation()
})
</script>

<style>
.hive-app {
  background-color: var(--hive-cream);
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>
