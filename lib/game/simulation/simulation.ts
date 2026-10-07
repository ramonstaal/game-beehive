// Pure simulation logic for HIVE world tick
// These functions are unit-testable without Vue or Supabase

import type { FlowerSpecies, WeatherState } from '../types'

export interface SimulationCell {
  h3Cell: string
  beePopulation: number
  nectar: number
  pollen: number
  bloomScore: number
  activityScore: number
  weather: WeatherState
}

export interface SimulationInput {
  cell: SimulationCell
  flowers: { species: FlowerSpecies }[]
  hourOfDay: number
  tickId: number
}

export interface SimulationOutput {
  cell: SimulationCell
  beeFlows: { toCell: string; beeCount: number; beeType: string }[]
  nectarProduced: number
  pollenProduced: number
  honeyProduced: number
  discoveryChance: number
}

export function calculateWeather(h3Cell: string, timestamp: number): WeatherState {
  const hash = h3Cell.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const hour = Math.floor(timestamp / 3600000)
  const index = (hash + hour) % 5
  const states: WeatherState[] = ['sunny', 'cloudy', 'rain', 'windy', 'night']
  return states[index]
}

export function weatherMultiplier(weather: WeatherState): number {
  switch (weather) {
    case 'sunny': return 1.0
    case 'cloudy': return 0.8
    case 'rain': return 0.6
    case 'windy': return 0.9
    case 'night': return 0.5
  }
}

export function calculateAttraction(
  flowers: { species: FlowerSpecies }[],
  weather: WeatherState,
  hourOfDay: number
): number {
  let score = 0
  for (const { species } of flowers) {
    let flowerScore = species.nectarRate * (species.attractionRadius / 1000)
    if (species.preferredWeather.includes(weather)) flowerScore *= 1.5
    const timeOfDay = hourOfDay >= 6 && hourOfDay < 18 ? 'day' : hourOfDay >= 18 || hourOfDay < 6 ? 'night' : 'day'
    if (species.preferredTimes.includes(timeOfDay as any)) flowerScore *= 1.2
    score += flowerScore
  }
  return score
}

export function simulateCell(input: SimulationInput): SimulationOutput {
  const weather = input.cell.weather
  const wm = weatherMultiplier(weather)
  const attraction = calculateAttraction(input.flowers, weather, input.hourOfDay)

  const totalNectar = input.flowers.reduce((sum, f) => sum + f.species.nectarRate, 0)
  const totalPollen = input.flowers.reduce((sum, f) => sum + f.species.pollenRate, 0)

  const beeInflow = Math.floor(attraction * wm * 10)
  const naturalLoss = Math.floor(input.cell.beePopulation * 0.05)
  const newPopulation = Math.max(10, input.cell.beePopulation + beeInflow - naturalLoss)

  const nectarProduced = totalNectar * wm
  const pollenProduced = totalPollen * wm
  const honeyProduced = Math.floor(totalNectar * 0.2)

  const activityScore = Math.min(100, 20 + attraction * 5 + (input.flowers.length * 5))

  // Generate bee flows to random neighbors
  const beeFlows: SimulationOutput['beeFlows'] = []
  if (input.flowers.length > 0 && Math.random() > 0.3) {
    const types = ['worker', 'scout', 'night', 'rain', 'golden'] as const
    const beeType = types[Math.floor(Math.random() * types.length)]
    const beeCount = Math.max(1, Math.floor(newPopulation * 0.1 * Math.random()))
    beeFlows.push({ toCell: 'neighbor-cell', beeCount, beeType })
  }

  return {
    cell: {
      ...input.cell,
      beePopulation: newPopulation,
      nectar: Math.min(200, input.cell.nectar + nectarProduced),
      pollen: Math.min(200, input.cell.pollen + pollenProduced),
      activityScore,
      weather,
    },
    beeFlows,
    nectarProduced,
    pollenProduced,
    honeyProduced,
    discoveryChance: attraction * wm * 0.01,
  }
}

export function shouldDiscover(discoveryChance: number, existingDiscoveries: number): boolean {
  const baseChance = 0.02
  const chance = baseChance + discoveryChance - (existingDiscoveries * 0.005)
  return Math.random() < Math.max(0.005, Math.min(0.1, chance))
}
