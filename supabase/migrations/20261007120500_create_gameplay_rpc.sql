-- RPC: Create a garden for the authenticated user
create or replace function public.create_garden(
  p_h3_cell text,
  p_name text,
  p_lat numeric,
  p_lng numeric
)
returns json as $$
declare
  v_garden_id uuid;
  v_hive_id uuid;
begin
  -- Verify user doesn't already have a garden
  if exists (select 1 from public.gardens where owner_id = auth.uid()) then
    raise exception 'User already has a garden';
  end if;

  -- Create garden
  insert into public.gardens (owner_id, h3_cell, name, lat, lng)
  values (auth.uid(), p_h3_cell, p_name, p_lat, p_lng)
  returning id into v_garden_id;

  -- Create associated hive
  insert into public.hives (garden_id, level, population, honey, nectar, pollen, max_flower_slots)
  values (v_garden_id, 1, 50, 0, 0, 0, 3)
  returning id into v_hive_id;

  return json_build_object(
    'garden_id', v_garden_id,
    'hive_id', v_hive_id
  );
end;
$$ language plpgsql security definer;

-- RPC: Plant a flower
create or replace function public.plant_flower(
  p_garden_id uuid,
  p_species_id text,
  p_slot_index integer
)
returns json as $$
declare
  v_flower_id uuid;
  v_owner_id uuid;
  v_max_slots integer;
  v_current_count integer;
  v_bloom_hours integer;
  v_species record;
begin
  -- Verify garden ownership
  select owner_id into v_owner_id
  from public.gardens where id = p_garden_id;

  if v_owner_id is null then
    raise exception 'Garden not found';
  end if;

  if v_owner_id != auth.uid() then
    raise exception 'Not your garden';
  end if;

  -- Check slot availability
  select max_flower_slots into v_max_slots
  from public.hives where garden_id = p_garden_id;

  select count(*) into v_current_count
  from public.garden_flowers where garden_id = p_garden_id;

  if v_current_count >= v_max_slots then
    raise exception 'No flower slots available';
  end if;

  -- Verify species exists
  select * into v_species
  from public.flower_species where id = p_species_id;

  if v_species is null then
    raise exception 'Unknown flower species';
  end if;

  -- Check slot not already used
  if exists (select 1 from public.garden_flowers where garden_id = p_garden_id and slot_index = p_slot_index) then
    raise exception 'Slot already occupied';
  end if;

  -- Insert flower
  insert into public.garden_flowers (
    garden_id, species_id, slot_index, state, planted_at
  ) values (
    p_garden_id, p_species_id, p_slot_index, 'seed', now()
  )
  returning id into v_flower_id;

  -- Update garden flower count
  update public.gardens
  set flower_count = flower_count + 1,
      updated_at = now()
  where id = p_garden_id;

  return json_build_object(
    'flower_id', v_flower_id,
    'species', v_species.name,
    'state', 'seed'
  );
end;
$$ language plpgsql security definer;

-- RPC: Harvest honey from hive
create or replace function public.harvest_honey(
  p_garden_id uuid,
  p_amount numeric
)
returns json as $$
declare
  v_owner_id uuid;
  v_current_honey numeric;
begin
  select owner_id into v_owner_id
  from public.gardens where id = p_garden_id;

  if v_owner_id != auth.uid() then
    raise exception 'Not your garden';
  end if;

  select honey into v_current_honey
  from public.hives where garden_id = p_garden_id;

  if v_current_honey < p_amount then
    raise exception 'Not enough honey';
  end if;

  update public.hives
  set honey = honey - p_amount,
      updated_at = now()
  where garden_id = p_garden_id;

  return json_build_object(
    'harvested', p_amount,
    'remaining', v_current_honey - p_amount
  );
end;
$$ language plpgsql security definer;

-- RPC: Record a discovery
create or replace function public.record_discovery(
  p_discovery_type text,
  p_discovery_key text,
  p_name text,
  p_description text,
  p_h3_cell text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns json as $$
declare
  v_discovery_id uuid;
begin
  insert into public.discoveries (
    player_id, discovery_type, discovery_key, name, description, h3_cell, metadata
  ) values (
    auth.uid(), p_discovery_type, p_discovery_key, p_name, p_description, p_h3_cell, p_metadata
  )
  on conflict (player_id, discovery_type, discovery_key) do nothing
  returning id into v_discovery_id;

  if v_discovery_id is null then
    return json_build_object('already_discovered', true);
  end if;

  return json_build_object(
    'discovery_id', v_discovery_id,
    'already_discovered', false
  );
end;
$$ language plpgsql security definer;

-- RPC: Get nearby gardens
create or replace function public.get_nearby_gardens(
  p_lat numeric,
  p_lng numeric,
  p_radius_km numeric default 10
)
returns setof public.gardens as $$
begin
  return query
  select *
  from public.gardens
  where earth_distance(
    ll_to_earth(p_lat, p_lng),
    ll_to_earth(lat, lng)
  ) / 1000 <= p_radius_km
  order by earth_distance(
    ll_to_earth(p_lat, p_lng),
    ll_to_earth(lat, lng)
  );
end;
$$ language plpgsql security definer;
