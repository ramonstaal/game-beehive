export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_seed: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string
          avatar_seed?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_seed?: string
          created_at?: string
          updated_at?: string
        }
      }
      gardens: {
        Row: {
          id: string
          owner_id: string
          h3_cell: string
          name: string
          lat: number
          lng: number
          bloom_score: number
          flower_count: number
          bee_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          h3_cell: string
          name?: string
          lat: number
          lng: number
          bloom_score?: number
          flower_count?: number
          bee_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          h3_cell?: string
          name?: string
          lat?: number
          lng?: number
          bloom_score?: number
          flower_count?: number
          bee_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      hives: {
        Row: {
          id: string
          garden_id: string
          level: number
          population: number
          honey: number
          nectar: number
          pollen: number
          max_flower_slots: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          garden_id: string
          level?: number
          population?: number
          honey?: number
          nectar?: number
          pollen?: number
          max_flower_slots?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          garden_id?: string
          level?: number
          population?: number
          honey?: number
          nectar?: number
          pollen?: number
          max_flower_slots?: number
          created_at?: string
          updated_at?: string
        }
      }
      flower_species: {
        Row: {
          id: string
          name: string
          rarity: string
          nectar_rate: number
          pollen_rate: number
          attraction_radius: number
          bloom_hours: number
          visual_key: string
          preferred_weather: string[]
          preferred_times: string[]
          description: string
        }
      }
      garden_flowers: {
        Row: {
          id: string
          garden_id: string
          species_id: string
          slot_index: number
          planted_at: string
          bloom_started_at: string | null
          bloom_ends_at: string | null
          state: string
          created_at: string
        }
        Insert: {
          id?: string
          garden_id: string
          species_id: string
          slot_index: number
          planted_at?: string
          bloom_started_at?: string | null
          bloom_ends_at?: string | null
          state?: string
          created_at?: string
        }
        Update: {
          id?: string
          garden_id?: string
          species_id?: string
          slot_index?: number
          planted_at?: string
          bloom_started_at?: string | null
          bloom_ends_at?: string | null
          state?: string
          created_at?: string
        }
      }
      world_cells: {
        Row: {
          h3_cell: string
          resolution: number
          lat: number
          lng: number
          bee_population: number
          nectar: number
          pollen: number
          bloom_score: number
          activity_score: number
          weather: string
          updated_at: string
        }
      }
      bee_flows: {
        Row: {
          id: number
          tick_id: number
          from_cell: string
          to_cell: string
          bee_count: number
          bee_type: string
          created_at: string
        }
      }
      discoveries: {
        Row: {
          id: string
          player_id: string
          discovery_type: string
          discovery_key: string
          name: string
          description: string
          h3_cell: string | null
          discovered_at: string
          metadata: Record<string, unknown>
        }
        Insert: {
          id?: string
          player_id: string
          discovery_type: string
          discovery_key: string
          name: string
          description?: string
          h3_cell?: string | null
          discovered_at?: string
          metadata?: Record<string, unknown>
        }
      }
      global_events: {
        Row: {
          id: string
          event_type: string
          region_key: string | null
          name: string
          description: string
          starts_at: string
          ends_at: string
          config: Record<string, unknown>
          created_at: string
        }
      }
      game_ticks: {
        Row: {
          id: number
          started_at: string
          completed_at: string | null
          status: string
          metadata: Record<string, unknown>
        }
      }
    }
  }
}
