<template>
  <div class="flex-1 overflow-y-auto p-4 pt-0 space-y-3">
    <!-- Player Garden Card -->
    <HiveCard class="relative overflow-hidden">
      <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-hive-leaf/10 to-transparent rounded-full -translate-y-8 translate-x-8" />
      <div class="relative">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 rounded-hive-md bg-gradient-to-br from-hive-leaf to-hive-leaf-deep flex items-center justify-center text-2xl shadow-hive-soft">
            🏡
          </div>
          <div>
            <h2 class="font-display font-bold text-hive-ink">{{ garden.garden.name }}</h2>
            <p class="text-xs text-hive-ink-muted">Bloom: {{ garden.bloomLabel }}</p>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-3 gap-2 mb-3">
          <div class="text-center p-2 rounded-hive-sm bg-hive-warm/50">
            <div class="text-lg">🐝</div>
            <div class="font-display font-bold text-sm">{{ garden.hive.population }}</div>
            <div class="text-[10px] text-hive-ink-muted">Bees</div>
          </div>
          <div class="text-center p-2 rounded-hive-sm bg-hive-warm/50">
            <div class="text-lg">🍯</div>
            <div class="font-display font-bold text-sm">{{ garden.hive.honey }}</div>
            <div class="text-[10px] text-hive-ink-muted">Honey</div>
          </div>
          <div class="text-center p-2 rounded-hive-sm bg-hive-warm/50">
            <div class="text-lg">🌼</div>
            <div class="font-display font-bold text-sm">{{ garden.garden.flowerCount }}</div>
            <div class="text-[10px] text-hive-ink-muted">Flowers</div>
          </div>
        </div>

        <!-- Flowers strip -->
        <div v-if="garden.flowers.length > 0" class="flex gap-2 mb-3 overflow-x-auto pb-1">
          <div
            v-for="flower in garden.flowers"
            :key="flower.id"
            class="flex-shrink-0 w-14 h-14 rounded-hive-md bg-hive-warm/50 flex flex-col items-center justify-center"
          >
            <span class="text-xl hive-flower">{{ getFlowerIcon(flower.speciesId) }}</span>
            <span class="text-[9px] text-hive-ink-muted capitalize">{{ flower.state }}</span>
          </div>
        </div>

        <HiveButton variant="primary" icon="🌱" class="w-full" @click="ui.openSheetById('flower-picker')">
          Plant a flower
        </HiveButton>
        <p class="text-[10px] text-center text-hive-ink-muted mt-2">{{ garden.availableSlots }} slots available</p>
      </div>
    </HiveCard>

    <!-- Nearby Gardens -->
    <div>
      <h3 class="font-display font-semibold text-sm text-hive-ink mb-2 px-1">Nearby Gardens</h3>
      <div class="space-y-2">
        <div
          v-for="g in world.gardens"
          :key="g.id"
          class="hive-card p-3 flex items-center gap-3 cursor-pointer hover:bg-hive-warm/30 transition-colors"
          @click="selectGarden(g.id)"
        >
          <div class="w-10 h-10 rounded-hive-sm bg-gradient-to-br from-hive-leaf-light to-hive-leaf flex items-center justify-center text-lg flex-shrink-0">
            🏡
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-display font-semibold text-sm truncate">{{ g.name }}</p>
            <p class="text-xs text-hive-ink-muted">by {{ g.ownerName }} • {{ g.flowerCount }} flowers</p>
          </div>
          <div class="text-right flex-shrink-0">
            <div class="hive-pill text-xs">
              <span>🐝</span>
              <span>{{ g.beeCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGardenStore } from '~/stores/garden'
import { useWorldStore } from '~/stores/world'
import { useUiStore } from '~/stores/ui'
import { DEMO_FLOWER_SPECIES } from '~/lib/game/fixtures-species'

const garden = useGardenStore()
const world = useWorldStore()
const ui = useUiStore()

function getFlowerIcon(speciesId: string) {
  return DEMO_FLOWER_SPECIES.find(s => s.id === speciesId)?.visualKey || '🌱'
}

function selectGarden(id: string) {
  garden.selectGarden(id)
  ui.showToast(`Visiting ${world.gardens.find(g => g.id === id)?.name}`, '🏡')
}
</script>
