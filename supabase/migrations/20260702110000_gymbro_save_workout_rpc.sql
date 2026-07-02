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
      workout_id
    )
    values (
      exercise_item->>'id',
      nullif(exercise_item->>'machineId', ''),
      coalesce(exercise_item->>'machineName', ''),
      exercise_index,
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
        exercise_id,
        id,
        note,
        reps,
        sort_order,
        weight_kg
      )
      values (
        exercise_item->>'id',
        set_item->>'id',
        coalesce(set_item->>'note', ''),
        coalesce(set_item->>'reps', ''),
        set_index,
        (set_item->>'weightKg')::numeric
      );

      set_index := set_index + 1;
    end loop;

    exercise_index := exercise_index + 1;
  end loop;
end;
$$;

grant execute on function public.gymbro_save_workout(jsonb, text) to anon, authenticated;
