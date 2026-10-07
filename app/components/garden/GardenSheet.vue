<template>
  <div class="hive-sheet p-4 pb-24" @click.stop>
    <div class="w-12 h-1 bg-hive-ink/10 rounded-full mx-auto mb-4" />

    <div class="flex items-center gap-3 mb-4">
      <div class="w-12 h-12 rounded-hive-md bg-gradient-to-br from-hive-leaf to-hive-leaf-deep flex items-center justify-center text-2xl shadow-hive-soft">
        🏡
      </div>
      <div>
        <h2 class="font-display font-bold text-xl text-hive-ink">{{ garden.garden.name }}</h2>
        <p class="text-sm text-hive-ink-muted">Bloom: {{ garden.bloomLabel }}</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-2 mb-4">
      <div class="text-center p-3 rounded-hive-sm bg-hive-warm/50">
        <div class="text-2xl">🐝</div>
        <div class="font-display font-bold">{{ garden.hive.population }}</div>
        <div class="text-[10px] text-hive-ink-muted">Bees</div>
      </div>
      <div class="text-center p-3 rounded-hive-sm bg-hive-warm/50">
        <div class="text-2xl">🍯</div>
        <div class="font-display font-bold">{{ garden.hive.honey }}</div>
        <div class="text-[10px] text-hive-ink-muted">Honey</div>
      </div>
      <div class="text-center p-3 rounded-hive-sm bg-hive-warm/50">
        <div class="text-2xl">🌼</div>
        <div class="font-display font-bold">{{ garden.garden.flowerCount }}</div>
        <div class="text-[10px] text-hive-ink-muted">Flowers</div>
      </div>
    </div>

    <!-- Flowers -->
    <h3 class="font-display font-semibold text-sm text-hive-ink mb-2">Your Flowers</h3>
    <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
      <div
        v-for="flower in garden.flowers"
        :key="flower.id"
        class="flex-shrink-0 w-16 h-16 rounded-hive-md bg-hive-warm/50 flex flex-col items-center justify-center"
      >
        <span class="text-2xl hive-flower">{{ getFlowerIcon(flower.speciesId) }}</span>
        <span class="text-[10px] text-hive-ink-muted capitalize">{{ flower.state }}</span>
      </div>
      <button
        v-if="garden.availableSlots > 0"
        class="flex-shrink-0 w-16 h-16 rounded-hive-md border-2 border-dashed border-hive-ink/10 flex items-center justify-center text-hive-ink-muted hover:border-hive-honey hover:text-hive-honey transition-colors"
        @click="openPicker"
      >
        <span class="text-2xl">+</span>
      </button>
    </div>

    <HiveButton variant="primary" icon="🌱" class="w-full" @click="openPicker">
      Plant a flower
    </HiveButton>
  </div>
</template>

<script setup lang="ts">
import { useGardenStore } from '~/stores/garden'
import { useUiStore } from '~/stores/ui'
import { DEMO_FLOWER_SPECIES } from '~/lib/game/fixtures-species'

const garden = useGardenStore()
const ui = useUiStore()

function getFlowerIcon(speciesId: string) {
  return DEMO_FLOWER_SPECIES.find(s => s.id === speciesId)?.visualKey || '🌱'
}

function openPicker() {
  ui.closeSheet()
  setTimeout(() => ui.openSheetById('flower-picker'), 100)
}
</script>
