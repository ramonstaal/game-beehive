<template>
  <div class="fixed inset-0 z-[120] flex items-end lg:items-center justify-center">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-hive-ink/30 backdrop-blur-sm" @click="ui.closeSheet" />

    <!-- Sheet (mobile) / Modal (desktop) -->
    <div class="relative w-full lg:max-w-md bg-hive-cream rounded-t-hive-lg lg:rounded-hive-lg shadow-hive-float p-4 pb-8 lg:pb-4 max-h-[85vh] flex flex-col" @click.stop>
      <div class="w-12 h-1 bg-hive-ink/10 rounded-full mx-auto mb-4 lg:hidden" />
      <h2 class="font-display font-bold text-xl text-hive-ink mb-1">Plant a Flower</h2>
      <p class="text-sm text-hive-ink-muted mb-4">Choose something beautiful for your garden</p>

      <div class="grid grid-cols-2 gap-3 overflow-y-auto pb-4">
        <button
          v-for="species in flowerSpecies"
          :key="species.id"
          class="hive-card p-3 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
          :class="{ 'opacity-50 pointer-events-none': garden.availableSlots <= 0 || isPlanting }"
          :disabled="garden.availableSlots <= 0 || isPlanting"
          @click="plant(species)"
        >
          <div class="h-14 mb-1 flex items-end justify-center">
            <FlowerIcon :species-id="species.id" class="h-full" />
          </div>
          <p class="font-display font-semibold text-sm">{{ species.name }}</p>
          <p class="text-xs text-hive-ink-muted mb-2">{{ species.description }}</p>
          <div class="flex flex-wrap gap-1">
            <span class="hive-pill text-[10px] py-0.5 px-1.5">
              {{ species.rarity }}
            </span>
            <span class="hive-pill text-[10px] py-0.5 px-1.5">
              🍯 {{ species.nectarRate }}
            </span>
          </div>
        </button>
      </div>

      <HiveButton variant="secondary" class="w-full mt-3" :disabled="isPlanting" @click="ui.closeSheet">
        {{ isPlanting ? '🌱 Planting...' : 'Cancel' }}
      </HiveButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DEMO_FLOWER_SPECIES } from '~/lib/game/fixtures-species'
import { useGardenStore } from '~/stores/garden'
import { useUiStore } from '~/stores/ui'
import type { FlowerSpecies } from '~/lib/game/types'

const flowerSpecies = DEMO_FLOWER_SPECIES
const garden = useGardenStore()
const ui = useUiStore()
const isPlanting = ref(false)

async function plant(species: FlowerSpecies) {
  if (isPlanting.value) return
  isPlanting.value = true
  const success = await garden.plantFlower(species.id)
  isPlanting.value = false

  if (success) {
    ui.closeSheet()
    ui.triggerPlantCelebration(species.id, species.name, species.description)
  } else {
    ui.showToast('That did not work — try again', '⚠️')
  }
}
</script>

