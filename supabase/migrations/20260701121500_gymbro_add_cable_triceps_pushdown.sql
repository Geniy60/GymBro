insert into public.gymbro_machines (id, name, note, sort_order)
values (
  'standard-cable-triceps-pushdown',
  'Разгибание рук на блоке',
  'Cable triceps pushdown. Разгибание рук вниз на верхнем блоке с канатной рукоятью.',
  205
)
on conflict (id) do nothing;

insert into public.gymbro_machine_muscle_groups (machine_id, muscle_group)
values
  ('standard-cable-triceps-pushdown', 'triceps'),
  ('standard-cable-triceps-pushdown', 'forearms')
on conflict (machine_id, muscle_group) do nothing;
