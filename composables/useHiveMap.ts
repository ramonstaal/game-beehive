import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { GardenFlower } from '~/lib/game/types'

/** Integer zoom at which flower plots appear (matches +/- control steps). */
export const MIN_ZOOM_GARDEN_FLOWERS = 13

/** Bee agents + route lines (handoff: city view ~8–11). */
export const MIN_ZOOM_BEE_AGENTS = 11

export function shouldShowBeeAgents(zoom: number): boolean {
  return Math.floor(zoom + 0.05) >= MIN_ZOOM_BEE_AGENTS
}

/** MapLibre zoom is fractional; treat “level 13” as soon as the control would read 13. */
export function shouldShowGardenFlowers(zoom: number): boolean {
  return Math.floor(zoom + 0.05) >= MIN_ZOOM_GARDEN_FLOWERS
}

export interface MapGardenFlower {
  speciesId: string
  state?: GardenFlower['state']
}

export interface MapGardenFlowersPayload {
  gardenId: string
  lat: number
  lng: number
  /** Player garden: exact species + growth stage */
  flowers?: MapGardenFlower[]
  /** Neighbor gardens: aggregate count only */
  flowerCount?: number
}

export interface MapInstance {
  map: maplibregl.Map
  addGardenMarkers: (gardens: any[], onClick?: (garden: any) => void) => void
  addGardenFlowerMarkers: (
    payloads: MapGardenFlowersPayload[],
    flowerImage: (speciesId: string, state?: GardenFlower['state']) => string,
  ) => void
  addBeeFlowLayer: (flows: any[]) => void
  updateBeeFlowAgents: (flows: any[]) => void
  addClickListener: (callback: (lng: number, lat: number) => void) => void
  removeClickListener: (callback: (lng: number, lat: number) => void) => void
  onMoveEnd: (callback: () => void) => void
  onZoomEnd: (callback: () => void) => void
  flyTo: (lng: number, lat: number, zoom?: number) => void
  getBounds: () => maplibregl.LngLatBounds
  destroy: () => void
}

export function useHiveMap() {
  const mapInstance = shallowRef<maplibregl.Map | null>(null)
  const isReady = ref(false)

  function initMap(container: HTMLElement): MapInstance {
    const map = new maplibregl.Map({
      container,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm',
            paint: {
              'raster-opacity': 0.6,
              'raster-saturation': -0.7,
              'raster-contrast': -0.1,
            },
          },
        ],
      },
      center: [5.1214, 52.0907],
      zoom: 12,
      attributionControl: false,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

    map.on('load', () => {
      isReady.value = true
    })

    mapInstance.value = map

    // Expose for debugging/e2e testing
    if (import.meta.dev) {
      ;(window as any).__mapInstance = map
    }

    // Registry of click callbacks -> their map wrappers, so listeners can be removed correctly
    const clickHandlers = new Map<(lng: number, lat: number) => void, (e: maplibregl.MapMouseEvent) => void>()
    const beeFlowAgents = new Map<string, maplibregl.Marker[]>()

    function clearAllBeeAgents() {
      for (const markers of beeFlowAgents.values()) markers.forEach(m => m.remove())
      beeFlowAgents.clear()
    }

    return {
      map,
      addGardenMarkers: (gardens: any[], onClick?: (garden: any) => void) => addGardenMarkers(map, gardens, onClick),
      addGardenFlowerMarkers: (payloads, flowerImage) => addGardenFlowerMarkers(map, payloads, flowerImage),
      addBeeFlowLayer: (flows: any[]) => addBeeFlowLayer(map, flows),
      updateBeeFlowAgents: (flows: any[]) => updateBeeFlowAgents(map, flows, beeFlowAgents, clearAllBeeAgents),
      addClickListener: (callback: (lng: number, lat: number) => void) => {
        const wrapper = (e: maplibregl.MapMouseEvent) => callback(e.lngLat.lng, e.lngLat.lat)
        clickHandlers.set(callback, wrapper)
        map.on('click', wrapper)
      },
      removeClickListener: (callback: (lng: number, lat: number) => void) => {
        const wrapper = clickHandlers.get(callback)
        if (wrapper) {
          map.off('click', wrapper)
          clickHandlers.delete(callback)
        }
      },
      onMoveEnd: (callback: () => void) => {
        map.on('moveend', callback)
      },
      onZoomEnd: (callback: () => void) => {
        map.on('zoomend', callback)
      },
      flyTo: (lng: number, lat: number, zoom = 14) => {
        map.flyTo({ center: [lng, lat], zoom, duration: 1500, essential: true })
      },
      getBounds: () => map.getBounds(),
      destroy: () => {
        clearAllBeeAgents()
        map.remove()
        mapInstance.value = null
        isReady.value = false
      },
    }
  }

  function addGardenMarkers(map: maplibregl.Map, gardens: any[], onClick?: (garden: any) => void) {
    // Remove existing garden markers (scoped to this map's container so
    // multiple map instances don't delete each other's markers)
    const existing = map.getContainer().querySelectorAll('.hive-garden-marker')
    existing.forEach(el => el.remove())

    gardens.forEach((garden: any) => {
      const el = document.createElement('div')
      el.className = 'hive-garden-marker'
      const isPlayerGarden = garden.ownerId === 'player' || garden.ownerName === 'You'
      // Must shrink-wrap: block divs default to 100% of the map marker slot width,
      // which pins the icon on the left and absolute `left: 50%` labels at the lng/lat.
      el.style.cssText = 'display: flex; flex-direction: column; align-items: center; width: max-content;'
      el.innerHTML = `
        <div class="garden-marker-inner" style="
          width: 40px; height: 40px; border-radius: 50%;
          background: ${isPlayerGarden ? 'linear-gradient(135deg, #F6C344, #FADD7A)' : 'linear-gradient(135deg, #67A85B, #8BC97F)'};
          border: 3px solid white; box-shadow: 0 4px 12px rgba(37,53,45,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; cursor: pointer; transition: transform 0.2s ease;
        ">
          🏡
        </div>
        <div style="
          margin-top: 4px;
          background: rgba(37,53,45,0.8); color: white; padding: 2px 8px;
          border-radius: 999px; font-size: 10px; white-space: nowrap;
          font-family: Fredoka, sans-serif; pointer-events: none;
        ">
          ${garden.name}
        </div>
      `

      el.addEventListener('mouseenter', () => {
        const inner = el.querySelector('.garden-marker-inner') as HTMLElement
        if (inner) inner.style.transform = 'scale(1.15)'
      })
      el.addEventListener('mouseleave', () => {
        const inner = el.querySelector('.garden-marker-inner') as HTMLElement
        if (inner) inner.style.transform = 'scale(1)'
      })
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        onClick?.(garden)
      })

      new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([garden.lng, garden.lat])
        .addTo(map)
    })
  }

  /** Offset each flower slightly around the garden so they read as a small plot. */
  function flowerLngLat(
    gardenLng: number,
    gardenLat: number,
    slotIndex: number,
    total: number,
  ): [number, number] {
    const radiusM = 22
    const angle = (slotIndex / Math.max(total, 1)) * 2 * Math.PI - Math.PI / 2
    const dLat = (radiusM / 111_320) * Math.sin(angle)
    const dLng = (radiusM / (111_320 * Math.cos((gardenLat * Math.PI) / 180))) * Math.cos(angle)
    return [gardenLng + dLng, gardenLat + dLat]
  }

  function addGardenFlowerMarkers(
    map: maplibregl.Map,
    payloads: MapGardenFlowersPayload[],
    flowerImage: (speciesId: string, state?: GardenFlower['state']) => string,
  ) {
    map.getContainer().querySelectorAll('.hive-flower-marker').forEach(el => el.remove())

    const zoom = map.getZoom()
    if (!shouldShowGardenFlowers(zoom)) return

    const sizePx = Math.round(Math.min(36, Math.max(24, 18 + (zoom - MIN_ZOOM_GARDEN_FLOWERS) * 6)))

    payloads.forEach((payload) => {
      const listed = payload.flowers?.length
        ? payload.flowers
        : Array.from({ length: Math.min(payload.flowerCount ?? 0, 8) }, () => ({
            speciesId: 'wild-daisy',
            state: 'blooming' as const,
          }))

      listed.forEach((flower, slotIndex) => {
        const el = document.createElement('div')
        el.className = 'hive-flower-marker'
        el.style.cssText = `width: ${sizePx}px; height: ${sizePx}px; pointer-events: none;`
        const img = document.createElement('img')
        img.src = flowerImage(flower.speciesId, flower.state)
        img.alt = ''
        img.draggable = false
        img.style.cssText = 'width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(37,53,45,0.25));'
        el.appendChild(img)

        const [lng, lat] = flowerLngLat(payload.lng, payload.lat, slotIndex, listed.length)
        new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([lng, lat])
          .addTo(map)
      })
    })
  }

  function beeAgentCount(beeCount: number): number {
    return Math.min(5, Math.max(1, Math.ceil(beeCount / 6)))
  }

  function isValidLngLat(pair: unknown): pair is [number, number] {
    return Array.isArray(pair)
      && pair.length >= 2
      && Number.isFinite(pair[0])
      && Number.isFinite(pair[1])
  }

  function flowEndpoints(flow: any): { from: [number, number]; to: [number, number] } | null {
    if (!isValidLngLat(flow?.from) || !isValidLngLat(flow?.to)) return null
    return { from: flow.from, to: flow.to }
  }

  function interpolateFlowCoord(from: [number, number], to: [number, number], t: number): [number, number] {
    return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t]
  }

  function beeAgentLngLat(
    from: [number, number],
    to: [number, number],
    progress: number,
    index: number,
    total: number,
  ): [number, number] {
    const phase = (progress + (index * 0.2) / total) % 1
    const base = interpolateFlowCoord(from, to, phase)
    const off = beeSwarmOffset(from, to, index, total)
    return [base[0] + off[0], base[1] + off[1]]
  }

  /** Small lateral offset so swarms read as a group, not one icon. */
  function beeSwarmOffset(
    from: [number, number],
    to: [number, number],
    index: number,
    total: number,
  ): [number, number] {
    const dx = to[0] - from[0]
    const dy = to[1] - from[1]
    const len = Math.hypot(dx, dy) || 1
    const px = -dy / len
    const py = dx / len
    const spread = 0.00007 * (index - (total - 1) / 2)
    return [px * spread, py * spread]
  }

  function createBeeAgentElement(type: string): HTMLElement {
    const el = document.createElement('div')
    el.className = 'hive-bee-agent'
    // Outer shell is positioned by MapLibre via transform — must not animate transform here.
    el.style.cssText = 'display: inline-block; width: max-content; pointer-events: auto; cursor: pointer; user-select: none;'

    const bob = document.createElement('span')
    bob.className = 'hive-bee'
    bob.textContent = '🐝'
    bob.style.cssText = 'display: inline-block; font-size: 18px; line-height: 1;'
    if (type === 'golden') {
      bob.style.filter = 'drop-shadow(0 0 5px rgba(246, 195, 68, 0.95))'
    }
    if (type === 'scout') bob.style.fontSize = '16px'
    el.appendChild(bob)
    return el
  }

  function updateBeeFlowAgents(
    map: maplibregl.Map,
    flows: any[],
    beeFlowAgents: Map<string, maplibregl.Marker[]>,
    clearAllBeeAgents: () => void,
  ) {
    if (!map.loaded() || !shouldShowBeeAgents(map.getZoom())) {
      clearAllBeeAgents()
      return
    }

    const validFlows = flows.filter(f => flowEndpoints(f) != null)
    const activeIds = new Set(validFlows.map((f: any) => f.id))
    for (const id of [...beeFlowAgents.keys()]) {
      if (!activeIds.has(id)) {
        beeFlowAgents.get(id)?.forEach(m => m.remove())
        beeFlowAgents.delete(id)
      }
    }

    for (const flow of validFlows) {
      const endpoints = flowEndpoints(flow)!
      const progress = Number.isFinite(flow.progress) ? flow.progress : 0
      const wanted = beeAgentCount(flow.beeCount)
      let markers = beeFlowAgents.get(flow.id)
      if (!markers || markers.length !== wanted) {
        markers?.forEach(m => m.remove())
        markers = []
        for (let i = 0; i < wanted; i++) {
          const marker = new maplibregl.Marker({
            element: createBeeAgentElement(flow.type),
            anchor: 'center',
          })
          marker.setLngLat(beeAgentLngLat(endpoints.from, endpoints.to, progress, i, wanted))
          marker.addTo(map)
          markers.push(marker)
        }
        beeFlowAgents.set(flow.id, markers)
      }

      markers!.forEach((marker, i) => {
        const [lng, lat] = beeAgentLngLat(endpoints.from, endpoints.to, progress, i, markers!.length)
        if (Number.isFinite(lng) && Number.isFinite(lat)) {
          marker.setLngLat([lng, lat])
        }
      })
    }
  }

  function buildBeeFlowFeatures(flows: any[]) {
    return flows
      .filter(f => flowEndpoints(f) != null)
      .map((flow: any) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: [flow.from, flow.to],
        },
        properties: {
          beeCount: flow.beeCount,
          type: flow.type,
          progress: flow.progress,
        },
      }))
  }

  function applyBeeFlowLayer(map: maplibregl.Map, flows: any[]): boolean {
    if (!map.isStyleLoaded()) return false

    const features = buildBeeFlowFeatures(flows)
    if (map.getLayer('bee-flows')) map.removeLayer('bee-flows')
    if (map.getSource('bee-flows')) map.removeSource('bee-flows')
    if (features.length === 0) return true

    map.addSource('bee-flows', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features,
      },
    })

    map.addLayer({
      id: 'bee-flows',
      type: 'line',
      source: 'bee-flows',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#F6C344',
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, 2,
          13, 4,
          15, 5,
        ],
        'line-opacity': 0.85,
        'line-dasharray': [2, 3],
      },
    })
    return true
  }

  function addBeeFlowLayer(map: maplibregl.Map, flows: any[]) {
    const run = () => applyBeeFlowLayer(map, flows)
    if (run()) return
    map.once('idle', run)
  }

  return {
    mapInstance: readonly(mapInstance),
    isReady: readonly(isReady),
    initMap,
  }
}
