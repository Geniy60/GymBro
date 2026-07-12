create or replace function public.gymbro_machine_history_sets(
  p_user_id text,
  p_history_item_id text
)
returns table (
  id text,
  set_number integer,
  weight_kg numeric,
  reps text,
  note text
)
language sql
stable
as $$
  select
    workout_set.id,
    workout_set.sort_order + 1 as set_number,
    workout_set.weight_kg,
    workout_set.reps,
    workout_set.note
  from public.gymbro_workout_exercises exercise
  join public.gymbro_workouts workout
    on workout.id = exercise.workout_id
  join public.gymbro_workout_sets workout_set
    on workout_set.exercise_id = exercise.id
  where workout.user_id = p_user_id
    and workout.id || '-' || exercise.id = p_history_item_id
  order by workout_set.sort_order asc;
$$;

grant execute on function public.gymbro_machine_history_sets(text, text)
to anon, authenticated;
