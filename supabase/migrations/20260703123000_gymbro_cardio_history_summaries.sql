create or replace function public.gymbro_cardio_history_summaries(p_user_id text)
returns table (
  machine_id text,
  machine_name text,
  started_at timestamptz
)
language sql
stable
as $$
  select distinct on (exercise.machine_id)
    exercise.machine_id,
    exercise.machine_name_snapshot as machine_name,
    workout.started_at
  from public.gymbro_workout_exercises exercise
  join public.gymbro_workouts workout
    on workout.id = exercise.workout_id
  join public.gymbro_workout_sets workout_set
    on workout_set.exercise_id = exercise.id
  where workout.user_id = p_user_id
    and exercise.tracking_type = 'cardio'
    and exercise.machine_id is not null
  order by
    exercise.machine_id,
    workout.started_at desc,
    exercise.sort_order desc,
    workout_set.sort_order asc;
$$;

grant execute on function public.gymbro_cardio_history_summaries(text)
to anon, authenticated;
