import { defineStore } from 'pinia'

export type AppView = 'world' | 'garden' | 'journal' | 'profile'

export const useUiStore = defineStore('ui', () => {
  const currentView = ref<AppView>('world')
  const selectedMapObject = ref<string | null>(null)
  const openSheet = ref<string | null>(null)
  const isOnboarding = ref(true)
  const onboardingStep = ref(0)
  const isReducedMotion = ref(false)
  const toastMessage = ref<string | null>(null)
  const toastIcon = ref<string>('')
  const showDiscovery = ref(false)
  const discoveryData = ref<{ name: string; description: string; icon: string } | null>(null)
  const showPlantCelebration = ref(false)
  const plantCelebrationData = ref<{
    speciesId: string
    speciesName: string
    description?: string
  } | null>(null)

  let plantCelebrationTimer: ReturnType<typeof setTimeout> | null = null

  const isMobile = computed(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < 1024
  })

  function setView(view: AppView) {
    currentView.value = view
  }

  function selectMapObject(id: string | null) {
    selectedMapObject.value = id
  }

  function openSheetById(id: string | null) {
    openSheet.value = id
  }

  function closeSheet() {
    openSheet.value = null
  }

  function nextOnboardingStep() {
    onboardingStep.value++
    if (onboardingStep.value > 4) {
      isOnboarding.value = false
    }
  }

  function skipOnboarding() {
    isOnboarding.value = false
  }

  function showToast(message: string, icon: string = '') {
    toastMessage.value = message
    toastIcon.value = icon
    setTimeout(() => {
      toastMessage.value = null
      toastIcon.value = ''
    }, 3000)
  }

  function triggerDiscovery(name: string, description: string, icon: string) {
    discoveryData.value = { name, description, icon }
    showDiscovery.value = true
    setTimeout(() => {
      showDiscovery.value = false
    }, 4000)
  }

  function dismissDiscovery() {
    showDiscovery.value = false
    discoveryData.value = null
  }

  function triggerPlantCelebration(
    speciesId: string,
    speciesName: string,
    description?: string,
  ) {
    if (plantCelebrationTimer) clearTimeout(plantCelebrationTimer)
    plantCelebrationData.value = { speciesId, speciesName, description }
    showPlantCelebration.value = true
    plantCelebrationTimer = setTimeout(() => {
      dismissPlantCelebration()
    }, 8000)
  }

  function dismissPlantCelebration() {
    if (plantCelebrationTimer) {
      clearTimeout(plantCelebrationTimer)
      plantCelebrationTimer = null
    }
    showPlantCelebration.value = false
    plantCelebrationData.value = null
  }

  return {
    currentView: readonly(currentView),
    selectedMapObject: readonly(selectedMapObject),
    openSheet: readonly(openSheet),
    isOnboarding: readonly(isOnboarding),
    onboardingStep: readonly(onboardingStep),
    isReducedMotion: readonly(isReducedMotion),
    toastMessage: readonly(toastMessage),
    toastIcon: readonly(toastIcon),
    showDiscovery: readonly(showDiscovery),
    discoveryData: readonly(discoveryData),
    showPlantCelebration: readonly(showPlantCelebration),
    plantCelebrationData: readonly(plantCelebrationData),
    isMobile,
    setView,
    selectMapObject,
    openSheetById,
    closeSheet,
    nextOnboardingStep,
    skipOnboarding,
    showToast,
    triggerDiscovery,
    dismissDiscovery,
    triggerPlantCelebration,
    dismissPlantCelebration,
  }
})
