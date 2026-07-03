alter table public.gymbro_machines
  add column if not exists tracking_type text not null default 'strength';

alter table public.gymbro_machines
  drop constraint if exists gymbro_machines_tracking_type_check;

alter table public.gymbro_machines
  add constraint gymbro_machines_tracking_type_check
  check (tracking_type in ('strength', 'cardio'));

alter table public.gymbro_workout_exercises
  add column if not exists tracking_type text not null default 'strength';

alter table public.gymbro_workout_exercises
  drop constraint if exists gymbro_workout_exercises_tracking_type_check;

alter table public.gymbro_workout_exercises
  add constraint gymbro_workout_exercises_tracking_type_check
  check (tracking_type in ('strength', 'cardio'));

alter table public.gymbro_workout_sets
  add column if not exists duration_seconds integer,
  add column if not exists distance_km numeric,
  add column if not exists incline_percent numeric,
  add column if not exists elevation_meters numeric,
  add column if not exists speed_kmh numeric;

insert into public.gymbro_machines (id, name, note, sort_order, tracking_type)
values (
  'standard-treadmill',
  'Беговая дорожка',
  'Treadmill. Ходьба или бег с учетом времени, дистанции, наклона, высоты и скорости.',
  15,
  'cardio'
)
on conflict (id) do update set
  name = excluded.name,
  note = excluded.note,
  sort_order = excluded.sort_order,
  tracking_type = excluded.tracking_type;

insert into public.gymbro_machine_muscle_groups (machine_id, muscle_group) values
  ('standard-treadmill', 'glutes'),
  ('standard-treadmill', 'quads'),
  ('standard-treadmill', 'hamstrings'),
  ('standard-treadmill', 'calves')
on conflict (machine_id, muscle_group) do nothing;

create or replace function public.gymbro_save_machine(
  p_machine jsonb
)
returns void
language plpgsql
as $$
declare
  muscle_group_item jsonb;
  target_machine_id text := nullif(trim(p_machine->>'id'), '');
begin
  if target_machine_id is null then
    raise exception 'Machine id is required';
  end if;

  insert into public.gymbro_machines (id, name, note, tracking_type)
  values (
    target_machine_id,
    coalesce(nullif(trim(p_machine->>'name'), ''), 'Упражнение'),
    coalesce(p_machine->>'note', ''),
    coalesce(nullif(p_machine->>'trackingType', ''), 'strength')
  )
  on conflict (id) do update set
    name = excluded.name,
    note = excluded.note,
    tracking_type = excluded.tracking_type;

  delete from public.gymbro_machine_muscle_groups
  where machine_id = target_machine_id;

  for muscle_group_item in
    select value
    from jsonb_array_elements(coalesce(p_machine->'muscleGroups', '[]'::jsonb))
  loop
    insert into public.gymbro_machine_muscle_groups (machine_id, muscle_group)
    values (target_machine_id, muscle_group_item #>> '{}')
    on conflict (machine_id, muscle_group) do nothing;
  end loop;
end;
$$;

grant execute on function public.gymbro_save_machine(jsonb) to anon, authenticated;

create or replace function public.gymbro_save_workout(
  p_workout jsonb,
  p_user_id text
)
returns void
language plpgsql
as $$
declare
  exercise_index integer := 0;
  exercise_item jsonb;
  set_index integer;
  set_item jsonb;
  target_workout_id text := nullif(trim(p_workout->>'id'), '');
begin
  if target_workout_id is null then
    raise exception 'Workout id is required';
  end if;

  insert into public.gymbro_workouts (id, name, started_at, user_id)
  values (
    target_workout_id,
    coalesce(nullif(trim(p_workout->>'name'), ''), 'Тренировка'),
    (p_workout->>'startedAt')::timestamptz,
    p_user_id
  )
  on conflict (id) do update set
    name = excluded.name,
    started_at = excluded.started_at,
    user_id = excluded.user_id;

  delete from public.gymbro_workout_exercises
  where workout_id = target_workout_id;

  for exercise_item in
    select value
    from jsonb_array_elements(coalesce(p_workout->'exercises', '[]'::jsonb))
  loop
    if nullif(trim(exercise_item->>'id'), '') is null then
      raise exception 'Workout exercise id is required';
    end if;

    insert into public.gymbro_workout_exercises (
      id,
      machine_id,
      machine_name_snapshot,
      sort_order,
      tracking_type,
      workout_id
    )
    values (
      exercise_item->>'id',
      nullif(exercise_item->>'machineId', ''),
      coalesce(exercise_item->>'machineName', ''),
      exercise_index,
      coalesce(nullif(exercise_item->>'trackingType', ''), 'strength'),
      target_workout_id
    );

    set_index := 0;

    for set_item in
      select value
      from jsonb_array_elements(coalesce(exercise_item->'sets', '[]'::jsonb))
    loop
      if nullif(trim(set_item->>'id'), '') is null then
        raise exception 'Workout set id is required';
      end if;

      insert into public.gymbro_workout_sets (
        distance_km,
        duration_seconds,
        elevation_meters,
        exercise_id,
        id,
        incline_percent,
        note,
        reps,
        sort_order,
        speed_kmh,
        weight_kg
      )
      values (
        (set_item->>'distanceKm')::numeric,
        (set_item->>'durationSeconds')::integer,
        (set_item->>'elevationMeters')::numeric,
        exercise_item->>'id',
        set_item->>'id',
        (set_item->>'inclinePercent')::numeric,
        coalesce(set_item->>'note', ''),
        coalesce(set_item->>'reps', ''),
        set_index,
        (set_item->>'speedKmh')::numeric,
        (set_item->>'weightKg')::numeric
      );

      set_index := set_index + 1;
    end loop;

    exercise_index := exercise_index + 1;
  end loop;
end;
$$;

grant execute on function public.gymbro_save_workout(jsonb, text) to anon, authenticated;

drop function if exists public.gymbro_latest_sets_for_machine(text, text, text);

create or replace function public.gymbro_latest_sets_for_machine(
  p_user_id text,
  p_machine_id text,
  p_excluded_workout_id text
)
returns table (
  exercise_id text,
  id text,
  weight_kg numeric,
  reps text,
  note text,
  duration_seconds integer,
  distance_km numeric,
  incline_percent numeric,
  elevation_meters numeric,
  speed_kmh numeric
)
language sql
stable
as $$
  with latest_exercise as (
    select exercise.id
    from public.gymbro_workout_exercises exercise
    join public.gymbro_workouts workout
      on workout.id = exercise.workout_id
    where workout.user_id = p_user_id
      and exercise.machine_id = p_machine_id
      and workout.id <> p_excluded_workout_id
    order by workout.started_at desc, exercise.sort_order desc
    limit 1
  )
  select
    workout_set.exercise_id,
    workout_set.id,
    workout_set.weight_kg,
    workout_set.reps,
    workout_set.note,
    workout_set.duration_seconds,
    workout_set.distance_km,
    workout_set.incline_percent,
    workout_set.elevation_meters,
    workout_set.speed_kmh
  from public.gymbro_workout_sets workout_set
  join latest_exercise
    on latest_exercise.id = workout_set.exercise_id
  order by workout_set.sort_order asc;
$$;
