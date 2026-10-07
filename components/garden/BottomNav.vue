<template>
  <nav class="hive-card p-2 flex justify-around items-center">
    <button
      v-for="item in navItems"
      :key="item.view"
      class="flex flex-col items-center gap-0.5 p-2 rounded-hive-md transition-all"
      :class="ui.currentView === item.view ? 'bg-hive-honey/20 text-hive-ink' : 'text-hive-ink-muted hover:text-hive-ink-light'"
      @click="navigate(item.view, item.sheet)"
    >
      <span class="text-xl">{{ item.icon }}</span>
      <span class="text-[10px] font-display font-medium">{{ item.label }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { useUiStore } from '~/stores/ui'
import type { AppView } from '~/stores/ui'

const ui = useUiStore()

const navItems = [
  { view: 'world' as AppView, label: 'World', icon: '🌍', sheet: null },
  { view: 'garden' as AppView, label: 'Garden', icon: '🏡', sheet: 'garden' },
  { view: 'journal' as AppView, label: 'Journal', icon: '📖', sheet: 'journal' },
  { view: 'profile' as AppView, label: 'Profile', icon: '👤', sheet: 'profile' },
]

function navigate(view: AppView, sheet: string | null) {
  ui.setView(view)
  if (sheet) {
    ui.openSheetById(sheet)
  } else {
    ui.closeSheet()
  }
}
</script>
