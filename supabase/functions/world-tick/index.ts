import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
)

const WEATHER_TYPES = ['sunny', 'cloudy', 'rain', 'windy', 'night']
const BEE_TYPES = ['worker', 'scout', 'night', 'rain', 'golden']

serve(async () => {
  try {
    const { data: tickData, error: tickError } = await supabase
      .from('game_ticks').insert({ status: 'running' }).select().single()
    if (tickError) throw tickError
    const tickId = tickData.id

    const { data: gardens } = await supabase
      .from('gardens').select('id, h3_cell, bloom_score, flower_count')
    if (!gardens?.length) {
      await supabase.from('game_ticks').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', tickId)
      return new Response(JSON.stringify({ tick: tickId, cellsProcessed: 0 }), { headers: { 'Content-Type': 'application/json' } })
    }

    const { data: speciesList } = await supabase.from('flower_species').select('*')
    const speciesMap = new Map(speciesList?.map(s => [s.id, s]))

    const gardenIds = gardens.map(g => g.id)
    const { data: flowers } = await supabase
      .from('garden_flowers').select('garden_id, species_id, state')
      .in('garden_id', gardenIds).eq('state', 'blooming')

    const flowersByGarden = new Map()
    flowers?.forEach(f => {
      const arr = flowersByGarden.get(f.garden_id) || []
      arr.push(f)
      flowersByGarden.set(f.garden_id, arr)
    })

    const gardenCells = gardens.map(g => g.h3_cell)
    const { data: existingCells } = await supabase
      .from('world_cells').select('*').in('h3_cell', gardenCells)
    const cellMap = new Map(existingCells?.map(c => [c.h3_cell, c]))

    const cellsToUpsert = []
    const flowsToInsert = []
    const gardenUpdates = []

    for (const garden of gardens) {
      const cell = cellMap.get(garden.h3_cell) || {
        h3_cell: garden.h3_cell, resolution: 9, lat: 0, lng: 0,
        bee_population: 50, nectar: 0, pollen: 0,
        bloom_score: garden.bloom_score, activity_score: 50, weather: 'sunny',
      }

      const gardenFlowers = flowersByGarden.get(garden.id) || []
      let totalNectar = 0, totalPollen = 0, attractionScore = 0
      for (const f of gardenFlowers) {
        const sp = speciesMap.get(f.species_id)
        if (sp) {
          totalNectar += sp.nectar_rate
          totalPollen += sp.pollen_rate
          attractionScore += sp.nectar_rate * (sp.attraction_radius / 1000)
        }
      }

      const weatherIndex = Math.abs(
        garden.h3_cell.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + Math.floor(Date.now() / 3600000)
      ) % WEATHER_TYPES.length
      const weather = WEATHER_TYPES[weatherIndex]
      const wm = weather === 'sunny' ? 1.0 : weather === 'cloudy' ? 0.8 : weather === 'rain' ? 0.6 : weather === 'windy' ? 0.9 : 0.5

      const beeInflow = Math.floor(attractionScore * wm * 10)
      cell.bee_population = Math.max(10, cell.bee_population + beeInflow - Math.floor(cell.bee_population * 0.05))
      cell.nectar = Math.min(200, cell.nectar + totalNectar * wm)
      cell.pollen = Math.min(200, cell.pollen + totalPollen * wm)
      cell.bloom_score = garden.bloom_score
      cell.activity_score = Math.min(100, 20 + attractionScore * 5 + garden.flower_count * 5)
      cell.weather = weather

      cellsToUpsert.push(cell)

      if (gardenFlowers.length > 0 && Math.random() > 0.3) {
        const others = gardens.filter(g => g.h3_cell !== garden.h3_cell)
        if (others.length) {
          const target = others[Math.floor(Math.random() * others.length)]
          flowsToInsert.push({
            tick_id: tickId,
            from_cell: garden.h3_cell,
            to_cell: target.h3_cell,
            bee_count: Math.max(1, Math.floor(cell.bee_population * 0.1 * Math.random())),
            bee_type: BEE_TYPES[Math.floor(Math.random() * BEE_TYPES.length)],
          })
          gardenUpdates.push({ garden_id: target.id, nectar_add: Math.floor(totalNectar * wm * 0.3), pollen_add: Math.floor(totalPollen * wm * 0.3) })
        }
      }

      if (totalNectar > 0) {
        gardenUpdates.push({ garden_id: garden.id, honey_add: Math.floor(totalNectar * 0.2), nectar_add: Math.floor(totalNectar * 0.5), pollen_add: Math.floor(totalPollen * 0.5) })
      }
    }

    for (const cell of cellsToUpsert) await supabase.from('world_cells').upsert(cell)
    if (flowsToInsert.length) await supabase.from('bee_flows').insert(flowsToInsert)
    for (const u of gardenUpdates) {
      const { data: h } = await supabase.from('hives').select('honey, nectar, pollen').eq('garden_id', u.garden_id).single()
      if (h) await supabase.from('hives').update({
        honey: (h.honey || 0) + (u.honey_add || 0),
        nectar: (h.nectar || 0) + (u.nectar_add || 0),
        pollen: (h.pollen || 0) + (u.pollen_add || 0),
        updated_at: new Date().toISOString(),
      }).eq('garden_id', u.garden_id)
    }

    await supabase.from('bee_flows').delete().lt('created_at', new Date(Date.now() - 86400000).toISOString())
    await supabase.from('game_ticks').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', tickId)

    return new Response(JSON.stringify({ tick: tickId, cellsProcessed: cellsToUpsert.length, flowsCreated: flowsToInsert.length }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})
