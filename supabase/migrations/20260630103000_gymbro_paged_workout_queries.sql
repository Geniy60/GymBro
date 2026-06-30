create or replace function public.gymbro_search_workout_summaries(
  p_user_id text,
  p_search text,
  p_limit integer,
  p_offset integer
)
returns table (
  id text,
  name text,
  started_at timestamptz,
  user_id text
)
language sql
stable
as $$
  select
    workout.id,
    workout.name,
    workout.started_at,
    workout.user_id
  from public.gymbro_workouts workout
  where workout.user_id = p_user_id
    and (
      nullif(trim(coalesce(p_search, '')), '') is null
      or workout.name ilike '%' || trim(p_search) || '%'
      or to_char(workout.started_at, 'DD.MM.YYYY') ilike '%' || trim(p_search) || '%'
      or to_char(workout.started_at, 'YYYY-MM-DD') ilike '%' || trim(p_search) || '%'
      or exists (
        select 1
        from public.gymbro_workout_exercises exercise
        where exercise.workout_id = workout.id
          and exercise.machine_name_snapshot ilike '%' || trim(p_search) || '%'
      )
    )
  order by workout.started_at desc, workout.id desc
  limit greatest(p_limit, 0)
  offset greatest(p_offset, 0);
$$;

create or replace function public.gymbro_machine_maxes(p_user_id text)
returns table (
  machine_id text,
  machine_name text,
  weight_kg numeric,
  started_at timestamptz
)
language sql
stable
as $$
  with weighted_sets as (
    select
      exercise.machine_id,
      exercise.machine_name_snapshot as machine_name,
      workout_set.weight_kg,
      workout.started_at
    from public.gymbro_workout_sets workout_set
    join public.gymbro_workout_exercises exercise
      on exercise.id = workout_set.exercise_id
    join public.gymbro_workouts workout
      on workout.id = exercise.workout_id
    where workout.user_id = p_user_id
      and exercise.machine_id is not null
      and workout_set.weight_kg is not null
  ),
  ranked_sets as (
    select
      weighted_sets.*,
      row_number() over (
        partition by weighted_sets.machine_id
        order by weighted_sets.weight_kg desc, weighted_sets.started_at desc
      ) as row_number
    from weighted_sets
  )
  select
    ranked_sets.machine_id,
    ranked_sets.machine_name,
    ranked_sets.weight_kg,
    ranked_sets.started_at
  from ranked_sets
  where ranked_sets.row_number = 1
  order by ranked_sets.machine_name collate "C";
$$;

create or replace function public.gymbro_machine_history(
  p_user_id text,
  p_machine_id text
)
returns table (
  id text,
  started_at timestamptz,
  set_count integer,
  max_weight_kg numeric
)
language sql
stable
as $$
  select
    workout.id || '-' || exercise.id as id,
    workout.started_at,
    count(workout_set.id)::integer as set_count,
    max(workout_set.weight_kg) as max_weight_kg
  from public.gymbro_workout_exercises exercise
  join public.gymbro_workouts workout
    on workout.id = exercise.workout_id
  left join public.gymbro_workout_sets workout_set
    on workout_set.exercise_id = exercise.id
  where workout.user_id = p_user_id
    and exercise.machine_id = p_machine_id
  group by workout.id, exercise.id, workout.started_at
  order by workout.started_at desc, exercise.id desc;
$$;

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
  note text
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
    workout_set.note
  from public.gymbro_workout_sets workout_set
  join latest_exercise
    on latest_exercise.id = workout_set.exercise_id
  order by workout_set.sort_order asc;
$$;

create or replace function public.gymbro_previous_machine_maxes(
  p_user_id text,
  p_machine_ids text[],
  p_excluded_workout_id text
)
returns table (
  machine_id text,
  max_weight_kg numeric
)
language sql
stable
as $$
  select
    exercise.machine_id,
    max(workout_set.weight_kg) as max_weight_kg
  from public.gymbro_workout_exercises exercise
  join public.gymbro_workouts workout
    on workout.id = exercise.workout_id
  join public.gymbro_workout_sets workout_set
    on workout_set.exercise_id = exercise.id
  where workout.user_id = p_user_id
    and workout.id <> p_excluded_workout_id
    and exercise.machine_id = any(p_machine_ids)
    and workout_set.weight_kg is not null
  group by exercise.machine_id;
$$;
