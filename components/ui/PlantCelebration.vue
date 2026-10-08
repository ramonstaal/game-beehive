<template>
  <div class="fixed inset-0 z-[160] flex items-center justify-center p-4">
    <div
      class="absolute inset-0 bg-hive-ink/25 backdrop-blur-sm plant-celebration-backdrop"
      @click="dismiss"
    />

    <div
      class="relative hive-card p-6 pt-8 text-center max-w-sm w-full plant-celebration-card"
      role="dialog"
      aria-labelledby="plant-celebration-title"
      @click.stop
    >
      <div
        v-if="!ui.isReducedMotion"
        class="pointer-events-none absolute inset-0 overflow-hidden rounded-hive-lg"
        aria-hidden="true"
      >
        <span
          v-for="(p, i) in sparkles"
          :key="i"
          class="plant-sparkle absolute text-lg"
          :style="{ left: p.x, top: p.y, animationDelay: `${p.delay}ms` }"
        >{{ p.emoji }}</span>
      </div>

      <div class="relative mx-auto mb-4 h-28 w-28">
        <div
          class="absolute bottom-2 left-1/2 h-4 w-16 -translate-x-1/2 rounded-[50%] bg-hive-earth/40"
          :class="{ 'plant-soil-puff': phase >= 1 && !ui.isReducedMotion }"
        />
        <div
          v-if="phase >= 1"
          class="absolute bottom-4 left-1/2 -translate-x-1/2"
          :class="ui.isReducedMotion ? '' : 'plant-flower-rise'"
        >
          <FlowerIcon
            :species-id="speciesId"
            :state="displayState"
            class="h-24 w-24 hive-flower drop-shadow-md"
          />
        </div>
        <div
          v-if="phase === 0 && !ui.isReducedMotion"
          class="absolute bottom-6 left-1/2 -translate-x-1/2 text-2xl plant-seed-drop"
        >🌱</div>
      </div>

      <p class="text-xs uppercase tracking-wider text-hive-ink-muted mb-1">Planted!</p>
      <h2 id="plant-celebration-title" class="font-display font-bold text-2xl text-hive-ink mb-2">
        {{ speciesName }}
      </h2>
      <p class="text-sm text-hive-ink-muted mb-5">
        {{ message }}
      </p>

      <HiveButton variant="primary" class="w-full" @click="dismiss">
        Lovely!
      </HiveButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GardenFlower } from '~/lib/game/types'
import { useUiStore } from '~/stores/ui'

const props = defineProps<{
  speciesId: string
  speciesName: string
  description?: string
}>()

const ui = useUiStore()

const phase = ref(ui.isReducedMotion ? 1 : 0)
const displayState = ref<GardenFlower['state']>('seed')

const message = computed(() =>
  props.description || 'Bees will notice soon. Your meadow is a little more alive.',
)

const sparkles = [
  { emoji: '✨', x: '12%', y: '18%', delay: 400 },
  { emoji: '🌼', x: '78%', y: '22%', delay: 550 },
  { emoji: '✨', x: '82%', y: '55%', delay: 700 },
  { emoji: '🐝', x: '8%', y: '58%', delay: 850 },
]

let timers: ReturnType<typeof setTimeout>[] = []

function dismiss() {
  ui.dismissPlantCelebration()
}

onMounted(() => {
  if (ui.isReducedMotion) {
    displayState.value = 'sprout'
    return
  }

  timers.push(setTimeout(() => {
    phase.value = 1
    displayState.value = 'sprout'
  }, 450))

  timers.push(setTimeout(() => {
    displayState.value = 'growing'
  }, 1100))
})

onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
})
</script>

<style scoped>
.plant-celebration-backdrop {
  animation: plantFadeIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.plant-celebration-card {
  animation: plantCardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.plant-seed-drop {
  animation: plantSeedDrop 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.plant-soil-puff {
  animation: plantSoilPuff 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.plant-flower-rise {
  animation: plantFlowerRise 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.plant-sparkle {
  animation: plantSparkle 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  opacity: 0;
}

@keyframes plantFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes plantCardIn {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.92);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes plantSeedDrop {
  0% {
    opacity: 0;
    transform: translate(-50%, -28px) scale(0.6);
  }
  70% {
    opacity: 1;
    transform: translate(-50%, 4px) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, 8px) scale(0.85);
  }
}

@keyframes plantSoilPuff {
  0% { transform: translateX(-50%) scale(1); }
  40% { transform: translateX(-50%) scale(1.35); opacity: 0.55; }
  100% { transform: translateX(-50%) scale(1); opacity: 1; }
}

@keyframes plantFlowerRise {
  0% {
    opacity: 0;
    transform: translateY(16px) scale(0.35);
  }
  65% {
    opacity: 1;
    transform: translateY(-4px) scale(1.08);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes plantSparkle {
  0% {
    opacity: 0;
    transform: scale(0.4) translateY(8px);
  }
  35% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.85) translateY(-12px);
  }
}
</style>
