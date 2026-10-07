import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

export interface MapInstance {
  map: maplibregl.Map
  addGardenMarkers: (gardens: any[], onClick?: (garden: any) => void) => void
  addBeeFlowLayer: (flows: any[]) => void
  addClickListener: (callback: (lng: number, lat: number) => void) => void
  removeClickListener: (callback: (lng: number, lat: number) => void) => void
  onMoveEnd: (callback: () => void) => void
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

    return {
      map,
      addGardenMarkers: (gardens: any[], onClick?: (garden: any) => void) => addGardenMarkers(map, gardens, onClick),
      addBeeFlowLayer: (flows: any[]) => addBeeFlowLayer(map, flows),
      addClickListener: (callback: (lng: number, lat: number) => void) => {
        map.on('click', (e) => callback(e.lngLat.lng, e.lngLat.lat))
      },
      removeClickListener: (callback: (lng: number, lat: number) => void) => {
        map.off('click', callback as any)
      },
      onMoveEnd: (callback: () => void) => {
        map.on('moveend', callback)
      },
      flyTo: (lng: number, lat: number, zoom = 14) => {
        map.flyTo({ center: [lng, lat], zoom, duration: 1500, essential: true })
      },
      getBounds: () => map.getBounds(),
      destroy: () => {
        map.remove()
        mapInstance.value = null
        isReady.value = false
      },
    }
  }

  function addGardenMarkers(map: maplibregl.Map, gardens: any[], onClick?: (garden: any) => void) {
    // Remove existing garden markers
    const existing = document.querySelectorAll('.hive-garden-marker')
    existing.forEach(el => el.remove())

    gardens.forEach((garden: any) => {
      const el = document.createElement('div')
      el.className = 'hive-garden-marker'
      const isPlayerGarden = garden.ownerId === 'player' || garden.ownerName === 'You'
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
          position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%);
          background: rgba(37,53,45,0.8); color: white; padding: 2px 8px;
          border-radius: 999px; font-size: 10px; white-space: nowrap;
          font-family: Fredoka, sans-serif; pointer-events: none;
        ">
          ${garden.name}
        </div>
      `
      el.style.position = 'relative'

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

  function addBeeFlowLayer(map: maplibregl.Map, flows: any[]) {
    if (map.getLayer('bee-flows')) map.removeLayer('bee-flows')
    if (map.getSource('bee-flows')) map.removeSource('bee-flows')

    const features = flows.map((flow: any) => ({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [flow.from, flow.to],
      },
      properties: {
        beeCount: flow.beeCount,
        type: flow.type,
        progress: flow.progress,
      },
    }))

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
        'line-width': 3,
        'line-opacity': 0.6,
        'line-dasharray': [2, 4],
      },
    })
  }

  return {
    mapInstance: readonly(mapInstance),
    isReady: readonly(isReady),
    initMap,
  }
}
