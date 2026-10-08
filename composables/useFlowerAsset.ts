import type { GardenFlower } from '~/lib/game/types'

/** Art stages available on disk (see docs/ASSETS.md). */
export type FlowerArtStage = 'seedling' | 'bloom' | 'wilted'

/** Map a live flower state to one of the three art stages. */
export function flowerArtStage(state?: GardenFlower['state']): FlowerArtStage {
  switch (state) {
    case 'blooming':
    case 'pre-bloom':
    case 'seed-producing':
      return 'bloom'
    case 'fading':
      return 'wilted'
    case 'seed':
    case 'sprout':
    case 'growing':
    default:
      return 'seedling'
  }
}

/**
 * Resolve the SVG asset path for a flower species.
 * Defaults to the blooming stage (used in pickers/catalogs).
 */
export function useFlowerAsset() {
  const baseURL = useRuntimeConfig().app.baseURL

  function flowerImage(speciesId: string, state?: GardenFlower['state']): string {
    return `${baseURL}assets/flowers/flower-${speciesId}-${flowerArtStage(state)}.svg`
  }

  return { flowerImage, flowerArtStage }
}
