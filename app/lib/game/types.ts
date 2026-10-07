export interface FlowerSpecies {
  id: string
  name: string
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic'
  nectarRate: number
  pollenRate: number
  attractionRadius: number
  bloomHours: number
  visualKey: string
  preferredWeather: string[]
  preferredTimes: ('day' | 'night' | 'dawn' | 'dusk')[]
  description: string
}

export interface GardenFlower {
  id: string
  speciesId: string
  slotIndex: number
  plantedAt: Date
  state: 'seed' | 'sprout' | 'growing' | 'pre-bloom' | 'blooming' | 'fading' | 'seed-producing'
  bloomStartedAt?: Date
  bloomEndsAt?: Date
}

export interface Garden {
  id: string
  ownerId: string
  ownerName: string
  h3Cell: string
  lat: number
  lng: number
  name: string
  bloomScore: number
  flowerCount: number
  beeCount: number
  createdAt: Date
}

export interface Hive {
  id: string
  gardenId: string
  level: number
  population: number
  honey: number
  nectar: number
  pollen: number
  maxFlowerSlots: number
}

export interface BeeFlow {
  id: string
  from: [number, number]
  to: [number, number]
  beeCount: number
  type: 'worker' | 'scout' | 'night' | 'rain' | 'golden'
  progress: number
}

export interface Discovery {
  id: string
  type: 'flower' | 'bee' | 'honey' | 'phenomenon' | 'place'
  key: string
  name: string
  description: string
  discoveredAt: Date
  location?: string
  icon: string
}

export interface WorldCell {
  h3Cell: string
  resolution: number
  lat: number
  lng: number
  beePopulation: number
  nectar: number
  pollen: number
  bloomScore: number
  activityScore: number
  weather: 'sunny' | 'cloudy' | 'rain' | 'windy' | 'night'
}

export interface GameEvent {
  id: string
  type: string
  name: string
  description: string
  regionKey?: string
  startsAt: Date
  endsAt: Date
  active: boolean
}

export type WeatherState = 'sunny' | 'cloudy' | 'rain' | 'windy' | 'night'

export type BloomLevel = 'dormant' | 'awakening' | 'blooming' | 'lush' | 'abundant'

export function getBloomLabel(score: number): BloomLevel {
  if (score >= 80) return 'abundant'
  if (score >= 60) return 'lush'
  if (score >= 40) return 'blooming'
  if (score >= 20) return 'awakening'
  return 'dormant'
}

export function getBloomDisplay(score: number): string {
  const level = getBloomLabel(score)
  const labels: Record<BloomLevel, string> = {
    dormant: 'Quiet',
    awakening: 'Awakening',
    blooming: 'Blooming',
    lush: 'Lush',
    abundant: 'Abundant',
  }
  return labels[level]
}
