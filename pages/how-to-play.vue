<template>
  <div class="hive-app min-h-screen bg-hive-cream">
    <!-- Header -->
    <div class="hive-panel m-3 p-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-hive-pill bg-gradient-to-br from-hive-honey to-hive-honey-light flex items-center justify-center text-xl shadow-hive-glow">
          🐝
        </div>
        <div>
          <h1 class="font-display font-bold text-xl text-hive-ink">How to Play HIVE</h1>
          <p class="text-sm text-hive-ink-muted">Grow something worth visiting</p>
        </div>
      </div>
      <NuxtLink to="/" class="hive-button hive-button--secondary text-sm">
        Back to Game
      </NuxtLink>
    </div>

    <!-- Content -->
    <div class="max-w-2xl mx-auto p-4 space-y-6 pb-8">
      <!-- What is HIVE -->
      <section class="hive-card p-6">
        <h2 class="font-display font-bold text-2xl text-hive-ink mb-4">🌍 What is HIVE?</h2>
        <p class="text-hive-ink-light leading-relaxed mb-4">
          HIVE is a calm multiplayer game played on a real-world map. You start with one tiny garden.
          You plant flowers. Bees arrive. They travel. They visit other players' gardens.
          Your garden helps someone else's hive. Someone else's flowers help yours.
        </p>
        <p class="text-hive-ink-light leading-relaxed">
          Over time, tiny gardens become corridors, corridors become ecosystems, and the world map
          slowly becomes a living picture of what the community has created together.
        </p>
      </section>

      <!-- The Core Loop -->
      <section class="hive-card p-6">
        <h2 class="font-display font-bold text-2xl text-hive-ink mb-4">🔄 The Core Loop</h2>
        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-hive-sm bg-hive-leaf/20 flex items-center justify-center flex-shrink-0 text-lg">🌱</div>
            <div>
              <p class="font-display font-semibold text-hive-ink">Plant Flowers</p>
              <p class="text-sm text-hive-ink-muted">Choose from 8 flower species. Each attracts different bees.</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-hive-sm bg-hive-honey/20 flex items-center justify-center flex-shrink-0 text-lg">🐝</div>
            <div>
              <p class="font-display font-semibold text-hive-ink">Attract Bees</p>
              <p class="text-sm text-hive-ink-muted">Bees travel between gardens. Yours will visit nearby flowers.</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-hive-sm bg-hive-honey/20 flex items-center justify-center flex-shrink-0 text-lg">🍯</div>
            <div>
              <p class="font-display font-semibold text-hive-ink">Harvest Honey</p>
              <p class="text-sm text-hive-ink-muted">Your hive converts nectar into honey over time.</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-hive-sm bg-hive-lavender/20 flex items-center justify-center flex-shrink-0 text-lg">✨</div>
            <div>
              <p class="font-display font-semibold text-hive-ink">Discover</p>
              <p class="text-sm text-hive-ink-muted">Find rare species, special phenomena, and new places.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Your Garden -->
      <section class="hive-card p-6">
        <h2 class="font-display font-bold text-2xl text-hive-ink mb-4">🏡 Your Garden</h2>
        <div class="space-y-3 text-sm text-hive-ink-light">
          <p><strong>Location:</strong> Choose any place on the real-world map. Your exact location stays private — we use a coarse H3 grid.</p>
          <p><strong>Flowers:</strong> Start with 3 slots. Upgrade your hive to unlock more.</p>
          <p><strong>Bloom Score:</strong> How lush your garden is. Higher scores attract more bees.</p>
          <p><strong>Hive:</strong> Your home base. Produces honey from nectar collected by bees.</p>
        </div>
      </section>

      <!-- Flowers -->
      <section class="hive-card p-6">
        <h2 class="font-display font-bold text-2xl text-hive-ink mb-4">🌼 Flower Species</h2>
        <div class="grid grid-cols-2 gap-2">
          <div class="p-2 rounded-hive-sm bg-hive-warm/50 text-center">
            <div class="text-2xl">🍀</div>
            <p class="font-display font-semibold text-sm">Clover</p>
            <p class="text-xs text-hive-ink-muted">Reliable & resilient</p>
          </div>
          <div class="p-2 rounded-hive-sm bg-hive-warm/50 text-center">
            <div class="text-2xl">💜</div>
            <p class="font-display font-semibold text-sm">Lavender</p>
            <p class="text-xs text-hive-ink-muted">Strong attraction</p>
          </div>
          <div class="p-2 rounded-hive-sm bg-hive-warm/50 text-center">
            <div class="text-2xl">🌻</div>
            <p class="font-display font-semibold text-sm">Sunflower</p>
            <p class="text-xs text-hive-ink-muted">High nectar</p>
          </div>
          <div class="p-2 rounded-hive-sm bg-hive-warm/50 text-center">
            <div class="text-2xl">🌼</div>
            <p class="font-display font-semibold text-sm">Wild Daisy</p>
            <p class="text-xs text-hive-ink-muted">Diversity bonus</p>
          </div>
          <div class="p-2 rounded-hive-sm bg-hive-warm/50 text-center">
            <div class="text-2xl">🌺</div>
            <p class="font-display font-semibold text-sm">Poppy</p>
            <p class="text-xs text-hive-ink-muted">Burst production</p>
          </div>
          <div class="p-2 rounded-hive-sm bg-hive-warm/50 text-center">
            <div class="text-2xl">🌿</div>
            <p class="font-display font-semibold text-sm">Mint Bloom</p>
            <p class="text-xs text-hive-ink-muted">Weather synergy</p>
          </div>
          <div class="p-2 rounded-hive-sm bg-hive-warm/50 text-center">
            <div class="text-2xl">🌙</div>
            <p class="font-display font-semibold text-sm">Moonflower</p>
            <p class="text-xs text-hive-ink-muted">Night bees</p>
          </div>
          <div class="p-2 rounded-hive-sm bg-hive-warm/50 text-center">
            <div class="text-2xl">✨</div>
            <p class="font-display font-semibold text-sm">Golden Aster</p>
            <p class="text-xs text-hive-ink-muted">Rare & precious</p>
          </div>
        </div>
      </section>

      <!-- The World -->
      <section class="hive-card p-6">
        <h2 class="font-display font-bold text-2xl text-hive-ink mb-4">🌍 The Shared World</h2>
        <div class="space-y-3 text-sm text-hive-ink-light">
          <p><strong>Other Gardens:</strong> See gardens from players all over the world. Click any garden to visit.</p>
          <p><strong>Bee Flows:</strong> Golden lines show bees traveling between gardens. Your flowers help the whole ecosystem.</p>
          <p><strong>Weather:</strong> Sunny ☀️, Cloudy ⛅, Rain 🌧️, Windy 💨, Night 🌙 — each affects bee behavior.</p>
          <p><strong>Events:</strong> Special world events like "The Great Bloom" bring rare bees and bonuses.</p>
        </div>
      </section>

      <!-- Privacy -->
      <section class="hive-card p-6">
        <h2 class="font-display font-bold text-2xl text-hive-ink mb-4">🔒 Privacy First</h2>
        <div class="space-y-2 text-sm text-hive-ink-light">
          <p>Your exact location is <strong>never</strong> stored or shown.</p>
          <p>Gardens are placed on a coarse H3 grid — only the cell center is visible.</p>
          <p>Your profile is pseudonymous by default. Play without revealing who you are.</p>
        </div>
      </section>

      <!-- CTA -->
      <div class="text-center pt-4">
        <NuxtLink to="/" class="hive-button hive-button--primary inline-flex items-center gap-2">
          <span>🌱</span>
          <span>Start Your Garden</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Static page — no reactive state needed
</script>

<style>
.hive-app {
  background-color: var(--hive-cream);
  min-height: 100vh;
  width: 100vw;
}
</style>
