<template>
  <div class="fixed inset-0 z-[150] flex flex-col items-center justify-end pb-8 p-6 pointer-events-none">
    <!-- Instruction overlay -->
    <div class="hive-card px-6 py-4 text-center pointer-events-auto mb-4 animate-hive-float">
      <p class="font-display font-bold text-lg text-hive-ink mb-1">📍 Place Your Garden</p>
      <p class="text-sm text-hive-ink-muted">Click anywhere on the map to choose a location</p>
      <p class="text-xs text-hive-ink-muted mt-1">Your exact location stays private — we use a coarse grid</p>
    </div>

    <!-- Confirm placement -->
    <div v-if="pendingCell" class="hive-card p-4 pointer-events-auto w-full max-w-sm">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-hive-md bg-hive-leaf/20 flex items-center justify-center text-xl">🏡</div>
        <div>
          <p class="font-display font-semibold text-sm">{{ gardenName || 'My Garden' }}</p>
          <p class="text-xs text-hive-ink-muted">H3 Cell: {{ pendingCell.cell.slice(0, 12) }}...</p>
        </div>
      </div>
      <HiveButton variant="primary" class="w-full mb-2" @click="confirm">
        🌱 Plant Here
      </HiveButton>
      <HiveButton variant="ghost" class="w-full text-sm" @click="cancel">
        Choose Another Spot
      </HiveButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGardenStore } from '~/stores/garden'
import { useUiStore } from '~/stores/ui'
import { useH3 } from '~/composables/useH3'

const props = defineProps<{
  lat: number
  lng: number
}>()

const emit = defineEmits<{
  placed: []
  cancel: []
}>()

const garden = useGardenStore()
const ui = useUiStore()
const { getCellCenter } = useH3()

const gardenName = ref('')
const pendingCell = ref<{ lat: number; lng: number; cell: string } | null>(null)

// Set initial cell from props
onMounted(() => {
  pendingCell.value = getCellCenter(props.lat, props.lng)
})

watch(() => [props.lat, props.lng], ([lat, lng]) => {
  pendingCell.value = getCellCenter(lat, lng)
})

async function confirm() {
  if (!pendingCell.value) return
  const result = await garden.createGarden(
    pendingCell.value.cell,
    gardenName.value || 'My Garden',
    pendingCell.value.lat,
    pendingCell.value.lng
  )
  if (result.success) {
    ui.showToast('Your garden is planted! 🌱', '🏡')
    emit('placed')
  } else {
    ui.showToast('Could not plant garden. Try again.', '⚠️')
  }
}

function cancel() {
  pendingCell.value = null
  emit('cancel')
}
</script>
