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

  insert into public.gymbro_machines (id, name, note)
  values (
    target_machine_id,
    coalesce(nullif(trim(p_machine->>'name'), ''), 'Упражнение'),
    coalesce(p_machine->>'note', '')
  )
  on conflict (id) do update set
    name = excluded.name,
    note = excluded.note;

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
