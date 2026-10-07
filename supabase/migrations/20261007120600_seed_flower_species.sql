-- Seed flower species catalog
delete from public.flower_species;

insert into public.flower_species (id, name, rarity, nectar_rate, pollen_rate, attraction_radius, bloom_hours, visual_key, preferred_weather, preferred_times, description)
values
  ('clover', 'Clover', 'common', 2, 3, 500, 48, '🍀', array['sunny', 'cloudy'], array['day'], 'Reliable and resilient. A favorite of beginner gardeners.'),
  ('lavender', 'Lavender', 'common', 4, 2, 1200, 72, '💜', array['sunny', 'windy'], array['day', 'dusk'], 'Fragrant and irresistible to bees far and wide.'),
  ('sunflower', 'Sunflower', 'common', 6, 4, 800, 36, '🌻', array['sunny'], array['day'], 'Abundant nectar. Turns its face to the sun.'),
  ('wild-daisy', 'Wild Daisy', 'common', 2, 2, 400, 24, '🌼', array['sunny', 'cloudy', 'windy'], array['day'], 'Common but beloved. Adds diversity to any garden.'),
  ('poppy', 'Poppy', 'uncommon', 5, 3, 600, 18, '🌺', array['sunny', 'cloudy'], array['day', 'dawn'], 'A burst of color. Short-lived but spectacular.'),
  ('mint-bloom', 'Mint Bloom', 'uncommon', 3, 3, 700, 60, '🌿', array['cloudy', 'rain'], array['day'], 'Cooling and refreshing. Thrives in damp weather.'),
  ('moonflower', 'Moonflower', 'rare', 5, 5, 1000, 12, '🌙', array['cloudy', 'night'], array['night'], 'Opens only at night. Attracts the most mysterious bees.'),
  ('golden-aster', 'Golden Aster', 'rare', 7, 6, 1500, 96, '✨', array['sunny', 'windy'], array['day', 'dusk'], 'Rare and precious. Worth the wait.');
