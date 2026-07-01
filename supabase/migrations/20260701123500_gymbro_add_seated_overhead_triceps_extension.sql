insert into public.gymbro_machines (id, name, note, sort_order)
values (
  'standard-seated-overhead-triceps-extension',
  'Разгибание рук из-за головы сидя',
  'Seated overhead triceps extension. Разгибание рук из-за головы сидя.',
  208
)
on conflict (id) do nothing;

insert into public.gymbro_machine_muscle_groups (machine_id, muscle_group)
values
  ('standard-seated-overhead-triceps-extension', 'triceps'),
  ('standard-seated-overhead-triceps-extension', 'forearms')
on conflict (machine_id, muscle_group) do nothing;
