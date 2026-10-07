<template>
  <div class="hive-sheet p-4 pb-8" @click.stop>
    <div class="w-12 h-1 bg-hive-ink/10 rounded-full mx-auto mb-4" />
    <h2 class="font-display font-bold text-xl text-hive-ink mb-1">Plant a Flower</h2>
    <p class="text-sm text-hive-ink-muted mb-4">Choose something beautiful for your garden</p>

    <div class="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pb-4">
      <button
        v-for="species in flowerSpecies"
        :key="species.id"
        class="hive-card p-3 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
        :class="{ 'opacity-50': garden.availableSlots <= 0 }"
        :disabled="garden.availableSlots <= 0"
        @click="plant(species)"
      >
        <div class="text-3xl mb-2">{{ species.visualKey }}</div>
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

    <HiveButton variant="secondary" class="w-full mt-3" @click="ui.closeSheet">
      Cancel
    </HiveButton>
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

function plant(species: FlowerSpecies) {
  const success = garden.plantFlower(species.id)
  if (success) {
    ui.showToast(`Planted ${species.name}!`, species.visualKey)
    ui.closeSheet()
  } else {
    ui.showToast('No slots available', '⚠️')
  }
}
</script>
