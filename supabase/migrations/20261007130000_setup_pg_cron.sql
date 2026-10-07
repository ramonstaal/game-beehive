-- Enable pg_cron extension for scheduled jobs
create extension if not exists pg_cron;

-- Enable pg_net extension for HTTP calls from database
create extension if not exists pg_net;

-- Create a wrapper function that calls the world-tick Edge Function via HTTP
create or replace function public.trigger_world_tick()
returns void as $$
declare
  v_url text := 'https://qpvizapftjjjcupojbpl.supabase.co/functions/v1/world-tick';
  v_service_key text := current_setting('app.settings.service_role_key', true);
begin
  -- Call the Edge Function via HTTP POST
  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_service_key
    ),
    body := '{}'::jsonb
  );
end;
$$ language plpgsql security definer;

-- Schedule world tick every minute
select cron.schedule(
  'world-tick-every-minute',
  '* * * * *',
  'select public.trigger_world_tick()'
);

-- Alternative: Direct Edge Function invocation if pg_net is not available
-- You can also call this manually:
-- select net.http_post('https://qpvizapftjjjcupojbpl.supabase.co/functions/v1/world-tick', '{}'::jsonb);
