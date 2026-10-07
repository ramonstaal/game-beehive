<template>
  <div class="fixed inset-0 z-[200] bg-hive-cream flex items-center justify-center p-6">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 rounded-hive-pill bg-gradient-to-br from-hive-honey to-hive-honey-light flex items-center justify-center text-3xl mx-auto mb-3 shadow-hive-glow">
          🐝
        </div>
        <h1 class="font-display font-bold text-2xl text-hive-ink">HIVE</h1>
        <p class="text-sm text-hive-ink-muted">Grow something worth visiting</p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6">
        <button
          class="flex-1 py-2 text-sm font-display font-medium rounded-hive-md transition-colors"
          :class="mode === 'signin' ? 'bg-hive-honey text-hive-ink' : 'bg-hive-warm text-hive-ink-muted'"
          @click="mode = 'signin'"
        >
          Sign In
        </button>
        <button
          class="flex-1 py-2 text-sm font-display font-medium rounded-hive-md transition-colors"
          :class="mode === 'signup' ? 'bg-hive-honey text-hive-ink' : 'bg-hive-warm text-hive-ink-muted'"
          @click="mode = 'signup'"
        >
          New Garden
        </button>
      </div>

      <!-- Form -->
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div v-if="mode === 'signup'">
          <label class="block text-sm font-medium text-hive-ink mb-1">Garden Name</label>
          <input
            v-model="username"
            type="text"
            class="w-full px-4 py-3 rounded-hive-md border border-hive-ink/10 bg-white focus:border-hive-honey focus:outline-none transition-colors"
            placeholder="Maya's Meadow"
            required
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-hive-ink mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            class="w-full px-4 py-3 rounded-hive-md border border-hive-ink/10 bg-white focus:border-hive-honey focus:outline-none transition-colors"
            placeholder="you@example.com"
            required
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-hive-ink mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            class="w-full px-4 py-3 rounded-hive-md border border-hive-ink/10 bg-white focus:border-hive-honey focus:outline-none transition-colors"
            placeholder="••••••••"
            required
            minlength="6"
          >
        </div>

        <div v-if="error" class="p-3 rounded-hive-sm bg-hive-coral/10 text-hive-coral text-sm">
          {{ error }}
        </div>

        <HiveButton variant="primary" class="w-full" :disabled="isLoading">
          <span v-if="isLoading">🌱 Growing...</span>
          <span v-else>{{ mode === 'signin' ? 'Sign In' : 'Start Your Garden' }}</span>
        </HiveButton>
      </form>

      <!-- Magic Link -->
      <div class="mt-4 text-center">
        <button class="text-sm text-hive-ink-muted hover:text-hive-ink transition-colors" @click="sendMagicLink">
          Or use a magic link ✨
        </button>
      </div>

      <!-- Skip -->
      <div class="mt-6 text-center">
        <button class="text-xs text-hive-ink-muted hover:text-hive-ink transition-colors" @click="skipAuth">
          Explore without an account
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlayerStore } from '~/stores/player'
import { useUiStore } from '~/stores/ui'

const player = usePlayerStore()
const ui = useUiStore()

const mode = ref<'signin' | 'signup'>('signin')
const email = ref('')
const password = ref('')
const username = ref('')
const error = ref('')
const isLoading = ref(false)

async function handleSubmit() {
  error.value = ''
  isLoading.value = true

  if (mode.value === 'signup') {
    const { error: err } = await player.signUp(email.value, password.value, username.value)
    if (err) {
      error.value = err.message
    } else {
      ui.showToast('Check your email to confirm!', '📧')
    }
  } else {
    const { error: err } = await player.signIn(email.value, password.value)
    if (err) {
      error.value = err.message
    }
  }

  isLoading.value = false
}

async function sendMagicLink() {
  if (!email.value) {
    error.value = 'Please enter your email first'
    return
  }
  isLoading.value = true
  const { error: err } = await player.signInWithMagicLink(email.value)
  if (err) {
    error.value = err.message
  } else {
    ui.showToast('Magic link sent! Check your email.', '✨')
  }
  isLoading.value = false
}

function skipAuth() {
  player.initDemoPlayer()
}
</script>
