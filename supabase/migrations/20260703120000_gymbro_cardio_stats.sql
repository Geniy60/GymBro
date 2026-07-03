create or replace function public.gymbro_latest_cardio_summary(p_user_id text)
returns table (
  machine_id text,
  machine_name text,
  started_at timestamptz,
  distance_km numeric,
  elevation_meters numeric,
  duration_seconds integer
)
language sql
stable
as $$
  select
    exercise.machine_id,
    exercise.machine_name_snapshot as machine_name,
    workout.started_at,
    workout_set.distance_km,
    workout_set.elevation_meters,
    workout_set.duration_seconds
  from public.gymbro_workout_exercises exercise
  join public.gymbro_workouts workout
    on workout.id = exercise.workout_id
  join public.gymbro_workout_sets workout_set
    on workout_set.exercise_id = exercise.id
  where workout.user_id = p_user_id
    and exercise.tracking_type = 'cardio'
    and exercise.machine_id is not null
  order by workout.started_at desc, exercise.sort_order desc, workout_set.sort_order asc
  limit 1;
$$;

grant execute on function public.gymbro_latest_cardio_summary(text)
to anon, authenticated;

create or replace function public.gymbro_cardio_history(
  p_user_id text,
  p_machine_id text
)
returns table (
  id text,
  machine_id text,
  machine_name text,
  started_at timestamptz,
  distance_km numeric,
  elevation_meters numeric,
  duration_seconds integer
)
language sql
stable
as $$
  select
    exercise.id,
    exercise.machine_id,
    exercise.machine_name_snapshot as machine_name,
    workout.started_at,
    workout_set.distance_km,
    workout_set.elevation_meters,
    workout_set.duration_seconds
  from public.gymbro_workout_exercises exercise
  join public.gymbro_workouts workout
    on workout.id = exercise.workout_id
  join public.gymbro_workout_sets workout_set
    on workout_set.exercise_id = exercise.id
  where workout.user_id = p_user_id
    and exercise.machine_id = p_machine_id
    and exercise.tracking_type = 'cardio'
  order by workout.started_at desc, exercise.sort_order desc, workout_set.sort_order asc;
$$;

grant execute on function public.gymbro_cardio_history(text, text)
to anon, authenticated;
