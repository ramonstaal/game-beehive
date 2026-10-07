<template>
  <div class="fixed inset-0 z-[200] bg-hive-cream flex flex-col">
    <!-- Progress dots -->
    <div class="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
      <div
        v-for="i in 5"
        :key="i"
        class="w-2 h-2 rounded-full transition-colors"
        :class="i - 1 === step ? 'bg-hive-honey' : i - 1 < step ? 'bg-hive-leaf' : 'bg-hive-ink/10'"
      />
    </div>

    <!-- Skip button -->
    <button
      class="absolute top-6 right-6 text-sm text-hive-ink-muted hover:text-hive-ink transition-colors z-10"
      @click="ui.skipOnboarding"
    >
      Skip
    </button>

    <!-- Content -->
    <div class="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <!-- Step 0: Welcome -->
      <template v-if="step === 0">
        <div class="relative mb-8">
          <div class="w-40 h-40 rounded-hive-pill bg-gradient-to-br from-hive-sky/30 to-hive-leaf/20 flex items-center justify-center">
            <div class="text-6xl animate-hive-bob">🐝</div>
          </div>
          <div class="absolute -top-2 -right-2 text-2xl animate-hive-float">🌼</div>
          <div class="absolute -bottom-2 -left-2 text-2xl animate-hive-float" style="animation-delay: 1s">🌸</div>
        </div>
        <h1 class="font-display font-bold text-4xl text-hive-ink mb-3">Welcome to HIVE</h1>
        <p class="text-lg text-hive-ink-muted max-w-xs">A tiny garden can change an entire world.</p>
      </template>

      <!-- Step 1: Choose garden -->
      <template v-if="step === 1">
        <div class="w-32 h-32 rounded-hive-lg bg-gradient-to-br from-hive-leaf/20 to-hive-honey/20 flex items-center justify-center mb-8">
          <div class="text-5xl">🗺️</div>
        </div>
        <h2 class="font-display font-bold text-2xl text-hive-ink mb-3">Where should your garden bloom?</h2>
        <p class="text-hive-ink-muted max-w-xs">Pick a place on the map. Your garden will be part of a shared world.</p>
      </template>

      <!-- Step 2: Plant -->
      <template v-if="step === 2">
        <div class="w-32 h-32 rounded-hive-lg bg-gradient-to-br from-hive-earth/30 to-hive-leaf/20 flex items-center justify-center mb-8">
          <div class="text-5xl animate-hive-sway">🌱</div>
        </div>
        <h2 class="font-display font-bold text-2xl text-hive-ink mb-3">Plant something</h2>
        <p class="text-hive-ink-muted max-w-xs">Each flower attracts different bees. Start with something simple.</p>
      </template>

      <!-- Step 3: First visitor -->
      <template v-if="step === 3">
        <div class="w-32 h-32 rounded-hive-lg bg-gradient-to-br from-hive-honey/30 to-hive-coral/20 flex items-center justify-center mb-8">
          <div class="text-5xl animate-hive-bob">🐝</div>
        </div>
        <h2 class="font-display font-bold text-2xl text-hive-ink mb-3">A visitor found you</h2>
        <p class="text-hive-ink-muted max-w-xs">Bees travel between gardens. Yours is now part of the network.</p>
      </template>

      <!-- Step 4: First reward -->
      <template v-if="step === 4">
        <div class="w-32 h-32 rounded-hive-lg bg-gradient-to-br from-hive-honey/40 to-hive-honey-light/30 flex items-center justify-center mb-8">
          <div class="text-5xl animate-hive-pulse-soft">🍯</div>
        </div>
        <h2 class="font-display font-bold text-2xl text-hive-ink mb-3">Your hive made its first honey</h2>
        <p class="text-hive-ink-muted max-w-xs">Come back anytime to see what changed while you were away.</p>
      </template>
    </div>

    <!-- CTA -->
    <div class="p-8">
      <HiveButton variant="primary" class="w-full" @click="handleNext">
        {{ step < 4 ? 'Continue' : 'Start your garden' }}
      </HiveButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/ui'

const ui = useUiStore()
const step = computed(() => ui.onboardingStep)

function handleNext() {
  if (step.value >= 4) {
    ui.skipOnboarding()
  } else {
    ui.nextOnboardingStep()
  }
}
</script>
