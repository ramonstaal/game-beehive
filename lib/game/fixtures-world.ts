import type { Garden, Hive, BeeFlow, Discovery, WorldCell, GameEvent } from './types'

export const DEMO_GARDENS: Garden[] = [
  { id: 'garden-1', ownerId: 'user-1', ownerName: 'Maya', h3Cell: 'demo-cell-1', lat: 52.0907, lng: 5.1214, name: "Maya's Meadow", bloomScore: 82, flowerCount: 7, beeCount: 34, createdAt: new Date('2026-09-15') },
  { id: 'garden-2', ownerId: 'user-2', ownerName: 'Lucas', h3Cell: 'demo-cell-2', lat: 52.0807, lng: 5.1414, name: 'Sunflower Corner', bloomScore: 64, flowerCount: 5, beeCount: 21, createdAt: new Date('2026-09-20') },
  { id: 'garden-3', ownerId: 'user-3', ownerName: 'Sofia', h3Cell: 'demo-cell-3', lat: 52.1007, lng: 5.1014, name: 'The Lavender Patch', bloomScore: 91, flowerCount: 9, beeCount: 47, createdAt: new Date('2026-09-10') },
  { id: 'garden-4', ownerId: 'user-4', ownerName: 'Oliver', h3Cell: 'demo-cell-4', lat: 52.0707, lng: 5.1314, name: 'Moonlight Garden', bloomScore: 45, flowerCount: 3, beeCount: 12, createdAt: new Date('2026-09-25') },
  { id: 'garden-5', ownerId: 'user-5', ownerName: 'Emma', h3Cell: 'demo-cell-5', lat: 52.1107, lng: 5.1514, name: 'Wildflower Walk', bloomScore: 73, flowerCount: 6, beeCount: 28, createdAt: new Date('2026-09-18') },
  { id: 'garden-6', ownerId: 'user-6', ownerName: 'Noah', h3Cell: 'demo-cell-6', lat: 52.0945, lng: 5.1085, name: 'Griftpark Greens', bloomScore: 68, flowerCount: 5, beeCount: 22, createdAt: new Date('2026-09-22') },
  { id: 'garden-7', ownerId: 'user-7', ownerName: 'Aisha', h3Cell: 'demo-cell-7', lat: 52.0765, lng: 5.1185, name: 'Canal Side Plot', bloomScore: 55, flowerCount: 4, beeCount: 16, createdAt: new Date('2026-09-24') },
  { id: 'garden-8', ownerId: 'user-8', ownerName: 'Finn', h3Cell: 'demo-cell-8', lat: 52.1025, lng: 5.1585, name: 'Parkhive North', bloomScore: 77, flowerCount: 8, beeCount: 31, createdAt: new Date('2026-09-26') },
  { id: 'garden-9', ownerId: 'user-9', ownerName: 'Lina', h3Cell: 'demo-cell-9', lat: 52.0685, lng: 5.1485, name: 'Riverside Blooms', bloomScore: 61, flowerCount: 5, beeCount: 18, createdAt: new Date('2026-09-28') },
]

export const PLAYER_GARDEN: Garden = {
  id: 'garden-player', ownerId: 'player', ownerName: 'You', h3Cell: 'player-cell',
  lat: 52.0857, lng: 5.1314, name: 'My Garden', bloomScore: 58, flowerCount: 3, beeCount: 19, createdAt: new Date('2026-10-01'),
}

export const DEMO_HIVE: Hive = {
  id: 'hive-1', gardenId: 'garden-player', level: 2, population: 87, honey: 342, nectar: 56, pollen: 23, maxFlowerSlots: 5,
}

export const DEMO_BEE_FLOWS: BeeFlow[] = [
  { id: 'flow-1', from: [5.1214, 52.0907], to: [5.1414, 52.0807], beeCount: 12, type: 'worker', progress: 0.6 },
  { id: 'flow-2', from: [5.1014, 52.1007], to: [5.1214, 52.0907], beeCount: 8, type: 'scout', progress: 0.3 },
  { id: 'flow-3', from: [5.1314, 52.0707], to: [5.1214, 52.0907], beeCount: 5, type: 'worker', progress: 0.8 },
  { id: 'flow-4', from: [5.1514, 52.1107], to: [5.1014, 52.1007], beeCount: 15, type: 'worker', progress: 0.45 },
  { id: 'flow-5', from: [5.1214, 52.0907], to: [5.1514, 52.1107], beeCount: 3, type: 'golden', progress: 0.2 },
  // Routes involving the player's garden (Utrecht demo)
  { id: 'flow-6', from: [5.1214, 52.0907], to: [5.1314, 52.0857], beeCount: 14, type: 'worker', progress: 0.15 },
  { id: 'flow-7', from: [5.1314, 52.0857], to: [5.1085, 52.0945], beeCount: 9, type: 'scout', progress: 0.55 },
  { id: 'flow-8', from: [5.1414, 52.0807], to: [5.1314, 52.0857], beeCount: 11, type: 'worker', progress: 0.72 },
  { id: 'flow-9', from: [5.1314, 52.0857], to: [5.1585, 52.1025], beeCount: 6, type: 'worker', progress: 0.38 },
  { id: 'flow-10', from: [5.1185, 52.0765], to: [5.1314, 52.0857], beeCount: 20, type: 'worker', progress: 0.48 },
  { id: 'flow-11', from: [5.1314, 52.0857], to: [5.1485, 52.0685], beeCount: 4, type: 'golden', progress: 0.62 },
]

export const DEMO_DISCOVERIES: Discovery[] = [
  { id: 'disc-1', type: 'flower', key: 'lavender', name: 'Lavender', description: 'First time seeing this fragrant beauty.', discoveredAt: new Date('2026-09-16'), location: 'Utrecht', icon: '💜' },
  { id: 'disc-2', type: 'bee', key: 'scout-bee', name: 'Scout Bee', description: 'A curious traveller from afar.', discoveredAt: new Date('2026-09-17'), location: "Near Maya's Meadow", icon: '🐝' },
  { id: 'disc-3', type: 'honey', key: 'wildflower-honey', name: 'Wildflower Honey', description: 'A complex, floral sweetness.', discoveredAt: new Date('2026-09-18'), icon: '🍯' },
  { id: 'disc-4', type: 'place', key: 'griftpark', name: 'Griftpark', description: 'A green oasis in the city.', discoveredAt: new Date('2026-09-19'), location: 'Utrecht', icon: '🌳' },
]

export const DEMO_WORLD_CELLS: WorldCell[] = [
  { h3Cell: 'cell-1', resolution: 9, lat: 52.0907, lng: 5.1214, beePopulation: 34, nectar: 120, pollen: 80, bloomScore: 82, activityScore: 75, weather: 'sunny' },
  { h3Cell: 'cell-2', resolution: 9, lat: 52.0807, lng: 5.1414, beePopulation: 21, nectar: 85, pollen: 55, bloomScore: 64, activityScore: 60, weather: 'sunny' },
  { h3Cell: 'cell-3', resolution: 9, lat: 52.1007, lng: 5.1014, beePopulation: 47, nectar: 150, pollen: 95, bloomScore: 91, activityScore: 88, weather: 'sunny' },
  { h3Cell: 'cell-4', resolution: 9, lat: 52.0707, lng: 5.1314, beePopulation: 12, nectar: 45, pollen: 30, bloomScore: 45, activityScore: 40, weather: 'cloudy' },
  { h3Cell: 'cell-5', resolution: 9, lat: 52.1107, lng: 5.1514, beePopulation: 28, nectar: 95, pollen: 65, bloomScore: 73, activityScore: 68, weather: 'sunny' },
  { h3Cell: 'cell-6', resolution: 9, lat: 52.0945, lng: 5.1085, beePopulation: 22, nectar: 88, pollen: 58, bloomScore: 68, activityScore: 62, weather: 'sunny' },
  { h3Cell: 'cell-7', resolution: 9, lat: 52.0765, lng: 5.1185, beePopulation: 16, nectar: 62, pollen: 40, bloomScore: 55, activityScore: 50, weather: 'cloudy' },
  { h3Cell: 'cell-8', resolution: 9, lat: 52.1025, lng: 5.1585, beePopulation: 31, nectar: 110, pollen: 72, bloomScore: 77, activityScore: 70, weather: 'sunny' },
  { h3Cell: 'cell-9', resolution: 9, lat: 52.0685, lng: 5.1485, beePopulation: 18, nectar: 70, pollen: 48, bloomScore: 61, activityScore: 55, weather: 'sunny' },
]

export const DEMO_EVENTS: GameEvent[] = [
  { id: 'event-1', type: 'great-bloom', name: 'The Great Bloom', description: 'A region-wide flowering event. Rare bees are more likely to visit.', regionKey: 'utrecht', startsAt: new Date('2026-10-06T00:00:00'), endsAt: new Date('2026-10-08T23:59:59'), active: true },
]

export const PLAYER_FLOWERS = [
  { id: 'pf-1', speciesId: 'clover', slotIndex: 0, plantedAt: new Date('2026-10-01'), state: 'blooming' as const, bloomStartedAt: new Date('2026-10-02'), bloomEndsAt: new Date('2026-10-04') },
  { id: 'pf-2', speciesId: 'lavender', slotIndex: 1, plantedAt: new Date('2026-10-03'), state: 'blooming' as const, bloomStartedAt: new Date('2026-10-04'), bloomEndsAt: new Date('2026-10-07') },
  { id: 'pf-3', speciesId: 'sunflower', slotIndex: 2, plantedAt: new Date('2026-10-05'), state: 'pre-bloom' as const },
]
