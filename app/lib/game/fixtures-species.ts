import type { FlowerSpecies } from './types'

export const DEMO_FLOWER_SPECIES: FlowerSpecies[] = [
  { id: 'clover', name: 'Clover', rarity: 'common', nectarRate: 2, pollenRate: 3, attractionRadius: 500, bloomHours: 48, visualKey: '🍀', preferredWeather: ['sunny','cloudy'], preferredTimes: ['day'], description: 'Reliable and resilient. A favorite of beginner gardeners.' },
  { id: 'lavender', name: 'Lavender', rarity: 'common', nectarRate: 4, pollenRate: 2, attractionRadius: 1200, bloomHours: 72, visualKey: '💜', preferredWeather: ['sunny','windy'], preferredTimes: ['day','dusk'], description: 'Fragrant and irresistible to bees far and wide.' },
  { id: 'sunflower', name: 'Sunflower', rarity: 'common', nectarRate: 6, pollenRate: 4, attractionRadius: 800, bloomHours: 36, visualKey: '🌻', preferredWeather: ['sunny'], preferredTimes: ['day'], description: 'Abundant nectar. Turns its face to the sun.' },
  { id: 'wild-daisy', name: 'Wild Daisy', rarity: 'common', nectarRate: 2, pollenRate: 2, attractionRadius: 400, bloomHours: 24, visualKey: '🌼', preferredWeather: ['sunny','cloudy','windy'], preferredTimes: ['day'], description: 'Common but beloved. Adds diversity to any garden.' },
  { id: 'poppy', name: 'Poppy', rarity: 'uncommon', nectarRate: 5, pollenRate: 3, attractionRadius: 600, bloomHours: 18, visualKey: '🌺', preferredWeather: ['sunny','cloudy'], preferredTimes: ['day','dawn'], description: 'A burst of color. Short-lived but spectacular.' },
  { id: 'mint-bloom', name: 'Mint Bloom', rarity: 'uncommon', nectarRate: 3, pollenRate: 3, attractionRadius: 700, bloomHours: 60, visualKey: '🌿', preferredWeather: ['cloudy','rain'], preferredTimes: ['day'], description: 'Cooling and refreshing. Thrives in damp weather.' },
  { id: 'moonflower', name: 'Moonflower', rarity: 'rare', nectarRate: 5, pollenRate: 5, attractionRadius: 1000, bloomHours: 12, visualKey: '🌙', preferredWeather: ['cloudy','night'], preferredTimes: ['night'], description: 'Opens only at night. Attracts the most mysterious bees.' },
  { id: 'golden-aster', name: 'Golden Aster', rarity: 'rare', nectarRate: 7, pollenRate: 6, attractionRadius: 1500, bloomHours: 96, visualKey: '✨', preferredWeather: ['sunny','windy'], preferredTimes: ['day','dusk'], description: 'Rare and precious. Worth the wait.' },
]
